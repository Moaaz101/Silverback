import { NavLink } from "react-router-dom";
import {
  UsersIcon,           // Fighters (people)
  UserGroupIcon,       // Fighters (group)
  FireIcon,            // Fighters (intensity)
  BoltIcon,            // Fighters (energy)
  AcademicCapIcon,     // Coaches (education)
  UserCircleIcon,      // Coaches (instructor)
  TrophyIcon,          // Coaches (achievement)
  CalendarDaysIcon,    // Attendance (calendar)
  ClipboardDocumentCheckIcon, // Attendance (checklist)
  CheckBadgeIcon,      // Attendance (verified)
  CurrencyDollarIcon,  // Payments (money)
  BanknotesIcon,       // Payments (cash)
  CreditCardIcon,      // Payments (card)
} from '@heroicons/react/24/outline';
const navigationItems = [
  {
    to: "/fighters",
    icon: UserGroupIcon, 
    label: "Fighters",
  },
  {
    to: "/coaches",
    icon: TrophyIcon,  
    label: "Coaches",
  },
  {
    to: "/attendance",
    icon: CalendarDaysIcon,  
    label: "Attendance",
  },
  {
    to: "/payments",
    icon: BanknotesIcon, 
    label: "Payments",
  },
];

export default function BottomNavigation() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-[#391843] border-t border-[#3d2544] shadow-inner z-50"
      style={{
        /* Extend nav to fill home indicator area */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-3 py-2 min-h-[60px] min-w-[60px] rounded-lg transition-all duration-200 ease-in-out ${
                  isActive
                    ? "text-white font-bold bg-[#61456a]"
                    : "text-[#e0cce7] hover:text-white hover:bg-[#5a3d63]"
                }`
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs leading-tight text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
