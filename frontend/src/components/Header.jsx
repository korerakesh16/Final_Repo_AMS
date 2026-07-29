import React, { useState, useRef, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Check, Monitor, LogOut, ChevronDown } from 'lucide-react';
import { useAssetManager } from '../hooks/useAssetManager';
import Avatar from './Avatar';
import QuadrantLogo from './QuadrantLogo';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUser, loginUser, logoutUser, showToast } = useAssetManager();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const notifRef = useRef(null);
  const adminMenuRef = useRef(null);

  // Outside click listener for notification dropdown & admin menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (showNotifications) {
          markAllNotificationsAsRead();
        }
        setShowNotifications(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, markAllNotificationsAsRead]);

  // Map route paths to human-friendly titles matching the mockup headers
  const getPageTitle = () => {
    if (currentUser && currentUser.role === 'Employee' && location.pathname === '/employee') {
      return (
        <span className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Welcome back,</span>
          <span className="text-slate-800 font-extrabold">{currentUser.name}</span>
          <span className="inline-block animate-bounce text-slate-800">👋</span>
        </span>
      );
    }
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/employees': return 'Employees';
      case '/assets': return 'Assets';
      case '/categories': return 'Categories';
      case '/assign-assets': return 'Assign Assets';
      case '/return-assets': return 'Return Assets';
      case '/repairs': return 'Repairs';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      case '/activity-log': return 'Activity Log';
      case '/employee': return 'Dashboard';
      case '/employee/settings': return 'Settings';
      default: return 'Quadrant IT Services';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isEmployee = currentUser?.role === 'Employee';

  return (
    <header className="bg-white border-b border-[#E6DED8] h-14 px-5 flex items-center justify-between sticky top-0 z-30 shadow-xs relative select-none">
      {/* Brand & Left Title */}
      <div className="flex items-center">
        {isEmployee ? (
          /* Branding Block */
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => navigate('/employee')}>
            <div className="shrink-0 overflow-hidden rounded-xl bg-white border border-[#E6DED8] p-0.5">
              <QuadrantLogo className="h-7 w-7 object-cover" />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-xs text-[#1F2937] leading-tight">Quadrant</h1>
              <p className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider">IT Services</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Title & Hamburger */}
            <button className="text-slate-500 hover:text-slate-800 lg:hidden mr-2 cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-extrabold text-[#1F2937] tracking-tight">{getPageTitle()}</h2>
          </>
        )}
      </div>

      {/* Center Capsule Navigation Links (Only for Employee Portal) */}
      {isEmployee && (
        <nav className="flex items-center gap-1 bg-[#FAF8F6] border border-[#E6DED8] p-1 rounded-2xl absolute left-1/2 -translate-x-1/2 shadow-inner">
          <NavLink
            to="/employee"
            end
            className={({ isActive }) =>
              `py-2 px-5 transition-all duration-300 ease-out rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 ${isActive
                ? 'bg-white text-[#1E3A8A] shadow-sm border border-[#E6DED8]'
                : 'text-[#6B7280] hover:text-[#1E3A8A] hover:bg-[#EEF4FF]'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/employee/settings"
            className={({ isActive }) =>
              `py-2 px-5 transition-all duration-300 ease-out rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 ${isActive
                ? 'bg-white text-[#1E3A8A] shadow-sm border border-[#E6DED8]'
                : 'text-[#6B7280] hover:text-[#1E3A8A] hover:bg-[#EEF4FF]'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      )}

      {/* Operations Panel */}
      <div className="flex items-center gap-6">
        {/* Search Input (Only for Admins) */}
        {!isEmployee && (
          <div className="relative w-80 hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search assets, employees..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        )}

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const willShow = !showNotifications;
              setShowNotifications(willShow);
              if (!willShow) {
                markAllNotificationsAsRead();
              }
            }}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all relative border border-slate-100 cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} New
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-4 transition-all hover:bg-slate-50 flex items-start gap-3 cursor-pointer ${!notif.read ? 'bg-blue-50/20' : ''}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${notif.type === 'success' ? 'bg-green-500' :
                          notif.type === 'warning' ? 'bg-amber-500' :
                            notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    markAllNotificationsAsRead();
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-all cursor-pointer"
                >
                  Close panel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Admin Switcher */}
        {currentUser && (
          <div className="flex items-center gap-4 border-l border-slate-200 pl-6 animate-fade-in relative">
            {/* Admin Switcher / Profile Card */}
            {!isEmployee ? (
              <div className="relative" ref={adminMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAdminMenu(prev => !prev)}
                  className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/80 bg-slate-50/50 cursor-pointer"
                  title="Click to Switch Admin"
                >
                  <Avatar name={currentUser.name} className="h-9 w-9 rounded-xl ring-2 ring-blue-500/20" />
                  <div className="hidden sm:block text-left pr-1">
                    <h4 className="text-xs font-extrabold text-slate-800 leading-tight flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">Admin</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                      {currentUser.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                </button>

                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1.5 animate-scale-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Account Actions</p>
                    </div>

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          logoutUser();
                          navigate('/login');
                        }}
                        className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-all cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar name={currentUser.name} className="h-10 w-10 rounded-xl ring-2 ring-slate-100" />
                <div className="hidden sm:block text-left">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{currentUser.name}</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                    {currentUser.designation}
                  </p>
                </div>
              </div>
            )}

            {/* Employee Logout Button */}
            {isEmployee && (
              <button
                onClick={() => {
                  logoutUser();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-red-500 rounded-xl text-xs font-bold text-slate-500 hover:text-red-500 transition-all cursor-pointer bg-slate-50/55 hover:bg-white shrink-0 ml-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
