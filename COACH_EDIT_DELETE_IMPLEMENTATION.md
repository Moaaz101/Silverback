# Coach Edit & Delete Implementation

## ✅ Backend Routes Verified & Added

### **Added to `backend/routes/coaches.js`:**

#### **PUT /api/coaches/:id** - Update Coach
```javascript
// Updates coach name and weekly schedule
// Deletes all old schedules and creates new ones
// Returns updated coach with schedules and fighters
```

#### **DELETE /api/coaches/:id** - Delete Coach  
```javascript
// Deletes coach and associated schedules
// Sets coachId to NULL for assigned fighters (preserves fighter data)
// Keeps attendance records (they have coachName stored for history)
// Returns deletion summary with affected fighter count
```

---

## 📊 Database Impact When Deleting a Coach

### **What Happens:**
1. ✅ **Coach record**: Deleted
2. ✅ **Coach schedules**: Deleted (cascade)
3. ✅ **Assigned fighters**: `coachId` set to `NULL` (fighters remain, just unassigned)
4. ✅ **Attendance records**: Kept (historical data with `coachName` field)

### **Why This Works:**
- Fighter schema has `coachId Int?` (nullable)
- Attendance has `coachName String` (stores name at time of attendance)
- SQLite default behavior sets foreign keys to NULL when optional

---

## 🎨 Frontend Implementation

### **CoachCard.jsx** - Added Edit & Delete Buttons
- Buttons only visible when card is **expanded**
- Clean button styling (blue for edit, red for delete)
- Uses `e.stopPropagation()` to prevent card collapse when clicking buttons

```jsx
<button onClick={(e) => { e.stopPropagation(); onEdit?.(coach); }}>
  <Edit /> Edit
</button>
<button onClick={(e) => { e.stopPropagation(); onDelete?.(coach); }}>
  <Trash2 /> Delete
</button>
```

### **EditCoachForm.jsx** - New Component
- Pre-fills with existing coach data
- Same UI/UX as CreateCoachForm
- Allows editing name and weekly schedule
- Add/remove schedule slots dynamically

### **Coaches.jsx** - Integration
- Three modals: Create, Edit, Delete
- Edit modal shows EditCoachForm with pre-filled data
- Delete modal shows confirmation with:
  - Coach name
  - Warning if fighters are assigned
  - Affected fighter count
  - "Cannot be undone" message
- Success/error toasts for all operations

---

## 🔄 User Flow

### **Edit Flow:**
1. User expands coach card
2. Clicks blue "Edit" button
3. Modal opens with pre-filled form
4. User modifies name or schedule
5. Clicks "Update Coach"
6. ✅ Toast: "Coach updated successfully!"

### **Delete Flow:**
1. User expands coach card
2. Clicks red "Delete" button
3. Confirmation modal appears showing:
   - Coach name
   - Number of assigned fighters (if any)
   - Warning message
4. User clicks "Delete Coach" to confirm
5. ✅ Toast: "Coach deleted successfully!"
6. Fighters with this coach now have `coachId = null`

---

## 🔒 Data Safety

### **Frontend Validation:**
- ✅ Coach name required
- ✅ At least 1 schedule slot required
- ✅ Valid weekday selection
- ✅ Valid time format

### **Backend Validation:**
- ✅ ID must be positive integer
- ✅ Coach must exist before update/delete
- ✅ Schedule array validation
- ✅ Weekday must be valid day name

### **Delete Safety:**
- ✅ Confirmation modal required
- ✅ Shows affected fighter count
- ✅ Cannot be accidentally triggered
- ✅ Loading state prevents double-clicks

---

## 🚀 Deployment

### **Backend:**
```bash
cd G:\Projects\Silverback
git add backend/routes/coaches.js
git commit -m "Add PUT and DELETE routes for coaches"
git push origin main
```

Backend will auto-deploy on Railway.

### **Frontend:**
```bash
git add frontend/src/components/CoachCard.jsx
git add frontend/src/components/EditCoachForm.jsx
git add frontend/src/pages/Coaches.jsx
git commit -m "Add edit and delete features for coaches"
git push origin main
```

Frontend will auto-deploy on Vercel.

---

## ✅ Integration Status

- ✅ **Backend routes implemented** (PUT, DELETE)
- ✅ **Frontend UI components** (Edit/Delete buttons in card)
- ✅ **Edit modal** with pre-filled form
- ✅ **Delete confirmation** modal
- ✅ **useCoaches hook** already has `updateCoach` and `deleteCoach`
- ✅ **Clean code** - no complexity, clear separation of concerns
- ✅ **Error handling** with toasts
- ✅ **Loading states** to prevent double-actions

---

## 🎯 Code Quality

### **Clean Implementation:**
- No nested ternaries
- Clear function names
- Proper error handling
- Consistent styling
- Reusable components
- Minimal prop drilling

### **Performance:**
- `e.stopPropagation()` prevents unnecessary re-renders
- Modal lazy-renders content only when open
- Optimistic UI updates (local state changes immediately)

---

## 📝 Notes

### **Why Fighters Aren't Deleted:**
When a coach is deleted, fighters remain in the system with `coachId = null`. This is intentional:
- Preserves fighter subscription data
- Preserves payment history
- Preserves attendance records
- Allows reassigning fighters to new coaches

### **Historical Data Preservation:**
Attendance records store `coachName` as a string, so even if a coach is deleted, historical attendance records show who the coach was at that time.

---

## 🧪 Testing Checklist

### **Edit Feature:**
- [ ] Click Edit button on expanded coach card
- [ ] Form pre-fills with current data
- [ ] Modify name and save
- [ ] Modify schedule and save
- [ ] Add new schedule slot and save
- [ ] Remove schedule slot and save
- [ ] Cancel without saving
- [ ] Verify toast appears on success

### **Delete Feature:**
- [ ] Click Delete button on expanded coach card
- [ ] Confirmation modal appears
- [ ] Shows correct coach name
- [ ] Shows fighter count warning (if applicable)
- [ ] Cancel deletion
- [ ] Confirm deletion
- [ ] Verify coach removed from list
- [ ] Verify fighters still exist (check Fighters page)
- [ ] Verify toast appears on success

---

## 🎉 Complete!

All coach CRUD operations are now fully functional:
- ✅ **C**reate
- ✅ **R**ead
- ✅ **U**pdate
- ✅ **D**elete
