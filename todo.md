# Silverback - TODO List

## Custom Scrollbar Implementation

### Overview
Add custom scrollbar to specific scrollable containers for better mobile UX while keeping main page scrollbar hidden.

### Components to Update

#### 1. NewPaymentForm.jsx ⭐ HIGH PRIORITY
**File:** `frontend/src/components/NewPaymentForm.jsx`

**Location:** Step 2B - Existing Fighter Selection

```jsx
{/* Fighters list in Step 2B - Line ~XXX */}
<div className="max-h-96 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg">
  {fightersLoading ? (
    <div className="p-6 text-center">
      <LoadingSpinner message="Loading fighters..." />
    </div>
  ) : fightersError ? (
    <div className="p-6 text-center text-red-500">
      Error loading fighters: {fightersError}
    </div>
  ) : filteredFighters.length === 0 ? (
    <div className="p-6 text-center text-gray-500">
      No fighters found. Please try a different search term.
    </div>
  ) : (
    <ul className="divide-y divide-gray-200">
      {filteredFighters.map(fighter => (
        <li 
          key={fighter.id}
          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => handleSelectFighter(fighter.id)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">{fighter.name}</h3>
              <p className="text-sm text-gray-500">
                {fighter.sessionsLeft} sessions left
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
```

**Change:** Add `custom-scrollbar` class to the outer div

---

#### 2. FighterAttendanceHistory.jsx
**File:** `frontend/src/components/FighterAttendanceHistory.jsx`

**Location:** Attendance Records Section

```jsx
{/* Attendance Records - Line ~XXX */}
<div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
  {attendance.slice(0, showAllRecords ? undefined : 10).map(record => (
    <div key={record.id} className="px-6 py-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium">{formatDate(record.date)}</p>
          <p className="text-sm text-gray-500">Coach: {record.coachName || 'Not assigned'}</p>
        </div>
        <AttendanceStatusBadge status={record.status} />
      </div>
      {record.notes && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <span className="font-medium">Notes: </span>
          {record.notes}
        </div>
      )}
    </div>
  ))}
</div>
```

**Changes:**
1. Add `max-h-[500px] overflow-y-auto` if not present
2. Add `custom-scrollbar` class

---

#### 3. FighterDetailsModal.jsx (if exists)
**File:** `frontend/src/components/FighterDetailsModal.jsx`

**Location:** Payment history section

```jsx
{/* Payment History List */}
<div className="max-h-64 overflow-y-auto custom-scrollbar">
  {payments.map(payment => (
    // Payment items
  ))}
</div>
```

**Change:** Add `custom-scrollbar` class to scrollable payment history container

---

#### 4. CoachCard.jsx (if schedule table scrolls)
**File:** `frontend/src/components/CoachCard.jsx`

**Location:** Schedule table wrapper

```jsx
{/* Schedule Table */}
<div className="overflow-x-auto custom-scrollbar">
  <table className="min-w-full">
    {/* Schedule rows */}
  </table>
</div>
```

**Change:** Add `custom-scrollbar` class to horizontal scroll container

---

### CSS Updates (Already Done ✅)

**File:** `frontend/src/index.css`

Current implementation:
```css
/* Custom scrollbar for specific elements */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #492e51 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #492e51;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #5a3660;
}
```

---

### Optional Enhancements

#### A. Mobile-Specific Wider Scrollbar
**File:** `frontend/src/index.css`

```css
/* Mobile-specific: Wider scrollbar on small screens for better touch targets */
@media (max-width: 640px) {
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(73, 46, 81, 0.8); /* Slightly transparent */
    border-radius: 5px;
  }
}
```

---

#### B. Scroll Shadow Effect (Alternative Approach)
**File:** `frontend/src/index.css`

```css
/* Scroll shadow effect - shows when content is scrollable */
.scroll-shadow {
  background:
    /* Shadow covers */
    linear-gradient(white 30%, rgba(255, 255, 255, 0)),
    linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
    
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(73, 46, 81, 0.2), rgba(0, 0, 0, 0)),
    radial-gradient(farthest-side at 50% 100%, rgba(73, 46, 81, 0.2), rgba(0, 0, 0, 0)) 0 100%;
  
  background-repeat: no-repeat;
  background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
  background-attachment: local, local, scroll, scroll;
}
```

**Usage:**
```jsx
<div className="max-h-96 overflow-y-auto scroll-shadow md:custom-scrollbar">
  {/* Use scroll-shadow on mobile, custom-scrollbar on desktop */}
</div>
```

---

#### C. Scroll Indicator Gradient
Add to bottom of scrollable lists to indicate more content:

```jsx
{/* Example: Fighter list with scroll indicator */}
<div className="relative">
  <div className="max-h-96 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg">
    {/* List items */}
  </div>
  
  {/* Scroll indicator - shows there's more content below */}
  {filteredFighters.length > 5 && (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-lg" />
  )}
</div>
```

---

### Testing Checklist

- [ ] Test NewPaymentForm fighter selection on mobile
- [ ] Test FighterAttendanceHistory scrolling with many records
- [ ] Test payment history scrolling (if applicable)
- [ ] Test coach schedule table horizontal scroll
- [ ] Verify scrollbar visible on Chrome mobile
- [ ] Verify scrollbar visible on Safari iOS
- [ ] Verify scrollbar visible on Firefox mobile
- [ ] Test on various screen sizes (320px to 768px)
- [ ] Ensure scrollbar doesn't interfere with touch gestures
- [ ] Verify purple color matches brand (#492e51)

---

### Priority

**High Priority:**
- NewPaymentForm.jsx (most used on mobile)
- FighterAttendanceHistory.jsx (long lists)

**Medium Priority:**
- Payment history modals
- Coach schedules

**Low Priority:**
- Optional enhancements (mobile-specific styling, scroll shadows)

---

### Notes

- Main app scrollbar is already hidden ✅
- Custom scrollbar only for internal scrollable containers
- Mobile users (primary audience) need wider, more visible scrollbars
- Purple brand color (#492e51) used consistently
- Scrollbar appears only when content overflows

---

### Estimated Time
- **Basic implementation:** 30 minutes
- **With optional enhancements:** 1 hour
- **Testing on all devices:** 30 minutes

**Total:** ~2 hours

---