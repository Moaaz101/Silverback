# Silverback Admin System — Pricing Sheet

## Plan: Standard Package

**Price:** $55 per month  
**Billing:** Monthly subscription (cancel anytime)  
**Setup Fee:** None — customization included

---

## Included Features

| Category                          | Details                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Fighter Management**            | Complete fighter profiles with contact info, assigned coaches, session tracking, attendance history, and payment records. |
| **Coach Management**              | Manage coaches with detailed profiles, weekly schedules, assigned fighters, and earnings tracking.           |
| **Smart Attendance System**       | Daily attendance tracking with coach-specific sessions, status marking (present/absent/late), automatic session deduction, and admin override for special cases. |
| **Payment Processing**            | Track membership payments with package management (8, 12, 16, or 24 sessions), payment receipts (print/download), payment history, and session balance tracking. |
| **Coach Earnings Dashboard**      | Monthly earnings reports, payment breakdown by fighter, date filtering, and visual analytics.                |
| **Advanced Scheduling**           | Weekly coach schedules with time slots, day-specific assignments, and automatic session-coach matching.      |
| **Real-time Analytics**           | Visual dashboard with attendance rates, payment summaries, fighter statistics, and coach performance metrics.|
| **Authentication & Security**     | Secure JWT-based authentication, encrypted passwords (bcrypt), protected API endpoints, session management, and password change functionality. |
| **Responsive Design**             | Mobile-first interface that works seamlessly on desktop, tablet, and mobile devices with touch-optimized controls. |
| **Smart Data Management**         | Automatic session tracking, payment-to-session conversion, subscription package management, and data validation. |
| **Custom UI Branding**            | Personalized design with your gym's logo, custom color themes (purple gradient), and professional styling.   |
| **Attendance History & Reports**  | Detailed attendance records per fighter, date range filtering, status breakdown, and visual progress tracking.|
| **Payment Receipt System**        | Professional payment receipts with gym branding, printable/downloadable PDFs, payment details, and session information. |
| **Empty State Handling**          | User-friendly empty states with helpful messages and clear calls-to-action throughout the application.       |
| **Error Handling & Validation**   | Comprehensive error handling, input validation, user-friendly error messages, and toast notifications.       |
| **Loading States**                | Smooth loading indicators for all data operations ensuring users know when data is being processed.          |
| **Data Relationships**            | Intelligent linking between fighters, coaches, attendance, payments, and schedules with automatic updates.   |
| **Search & Filter**               | Quick search and filtering capabilities across all data entities for efficient management.                   |
| **Bulk Operations**               | Bulk attendance submission, batch payment processing, and mass data updates for efficiency.                  |
| **Session Management**            | Automatic session deduction on attendance, session balance warnings, package expiration tracking.            |
| **Professional UI Components**    | Modern card-based layouts, gradient buttons, smooth animations, hover effects, and polished interactions.    |
| **Cloud Hosting**                 | Secure, reliable cloud hosting with 99.9% uptime guarantee and automatic SSL certificates.                   |
| **Database Management**           | SQLite database with Prisma ORM, automatic backups, data integrity constraints, and migration support.       |
| **API Architecture**              | RESTful API design, consistent response formats, proper HTTP status codes, and comprehensive error handling. |
| **Regular Updates**               | Continuous improvements, bug fixes, security patches, and feature enhancements.                              |
| **Technical Support**             | Up to 2 hours of technical support or maintenance per month via email/phone.                                 |

---

## Technical Highlights

### **Frontend Technology**
- React 18 with modern hooks (useState, useEffect, useCallback)
- React Router for seamless navigation
- Custom hooks for separation of concerns (useAuth, useFighters, useCoaches, useAttendance, usePayments)
- Context API for global state management (Auth, Toast)
- Tailwind CSS for responsive styling
- Lucide React icons for consistent UI
- Toast notifications for user feedback

### **Backend Technology**
- Node.js with Express.js framework
- Prisma ORM for database management
- JWT (JSON Web Tokens) for authentication
- bcrypt for password encryption
- SQLite database (easily upgradable to PostgreSQL/MySQL)
- RESTful API architecture
- Middleware for authentication and error handling

### **Security Features**
- JWT token authentication with 7-day expiration
- Bcrypt password hashing (10 rounds)
- Protected API endpoints with authentication middleware
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Secure session management
- Token verification on every protected request

### **Data Architecture**
- Relational database design with proper foreign keys
- Cascade delete options for data integrity
- Automatic timestamp tracking (createdAt, updatedAt)
- Transaction support for complex operations
- Data validation at both frontend and backend levels

### **User Experience Features**
- Intuitive navigation with header and bottom navigation
- Consistent purple gradient theme throughout
- Mobile-responsive design (works on phones, tablets, desktops)
- Loading spinners for all async operations
- Error displays with retry options
- Success/error toast notifications
- Empty states with helpful guidance
- Disabled states during form submission
- Password visibility toggle
- Date pickers with proper formatting
- Status badges with color coding
- Modal dialogs for forms
- Dropdown menus for user actions

---

## Optional Add-Ons

| Add-On                             | Description                                                      | Price      |
| ---------------------------------- | ---------------------------------------------------------------- | ---------- |
| **Additional Support Time**        | Extra support or customization work beyond 2 hrs/month           | $25/hr     |
| **Custom Reports & Analytics**     | Tailored analytics dashboards, PDF reports, or Excel exports     | from $50   |
| **SMS Notifications**              | Automated SMS reminders for payments, classes, or attendance     | from $30/mo|
| **Email Notifications**            | Automated email reports and alerts                               | from $20/mo|
| **Advanced Analytics Package**     | Revenue forecasting, trend analysis, fighter retention metrics   | from $75   |
| **Multi-location Support**         | Manage multiple gym branches from one system                     | from $100  |
| **Fighter Mobile App**             | Companion app for fighters to check schedules and payments       | TBD        |
| **Custom Integrations**            | Integration with accounting software, payment gateways, etc.     | Quote      |
| **White-label Branding**           | Complete rebranding with your domain and logo throughout         | from $150  |

---

## What You Get

### **Immediate Value**
✅ **Streamlined Operations** - Reduce administrative time by 70%  
✅ **Better Financial Tracking** - Never miss payments or lose track of sessions  
✅ **Improved Attendance** - Automatic tracking with session deduction  
✅ **Professional Receipts** - Branded payment receipts for your fighters  
✅ **Coach Management** - Clear schedules and earnings transparency  
✅ **Data Insights** - Visual analytics to grow your business  

### **Long-term Benefits**
✅ **Scalability** - Grows with your gym from 10 to 1000+ fighters  
✅ **Time Savings** - Automate repetitive tasks  
✅ **Reduced Errors** - Automated calculations prevent mistakes  
✅ **Better Communication** - Clear records prevent disputes  
✅ **Business Intelligence** - Make data-driven decisions  
✅ **Professional Image** - Modern system impresses clients  

---

## Implementation Process

### **Week 1: Setup & Customization**
- Deploy application to cloud hosting
- Add your gym's logo and branding
- Configure color scheme to match your brand
- Set up initial admin account
- Import existing data (if any)

### **Week 2: Training & Launch**
- 1-hour training session for staff
- Documentation and user guides provided
- Test all features with real data
- Go live with full support

### **Ongoing**
- Monthly check-ins
- Regular updates and improvements
- 2 hours of support per month included
- 24-hour response time for critical issues

---

## Terms & Conditions

- **Monthly subscription:** $55/month, billed at the start of each month
- **What's Included:** Hosting, updates, maintenance, and up to 2 hours of support
- **Cancellation:** Cancel anytime with 30-day notice
- **Data Ownership:** Your data is always yours
- **Data Backups:** Automated daily backups with 30-day retention
- **Uptime Guarantee:** 99.9% uptime with compensation for extended outages
- **Security:** SSL encryption, secure authentication, regular security updates
- **Support Hours:** Monday-Friday, 9 AM - 6 PM (your timezone)
- **Updates:** New features and improvements included at no extra cost

---

## Why Choose Silverback?

✅ **Built for Gyms** - Designed specifically for martial arts and fitness gyms  
✅ **Modern Technology** - Built with latest web technologies for speed and reliability  
✅ **Mobile-First** - Works perfectly on any device  
✅ **Secure** - Bank-level encryption and authentication  
✅ **Easy to Use** - Intuitive interface requires minimal training  
✅ **Customizable** - Tailored to your gym's specific needs  
✅ **Reliable** - Cloud-hosted with automatic backups  
✅ **Affordable** - Professional system at a fraction of custom development costs  
✅ **No Lock-in** - Export your data anytime, cancel without penalty  

---

## Getting Started

Ready to transform your gym management?

1. **Schedule a Demo** - See the system in action (30 minutes)
2. **Discuss Customization** - Review branding and specific needs (30 minutes)
3. **Setup & Deploy** - We handle everything (1 week)
4. **Training & Launch** - Get your team up to speed (1 week)

**Contact:** [Your Contact Information]  
**Email:** [Your Email]  
**Phone:** [Your Phone]  
**Website:** [Your Website]

---

*All prices in USD. Applicable taxes may apply. Terms subject to change with 30-day notice.*