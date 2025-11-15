import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { useAuth } from '../hooks/useAuth';
import type { Theme, SystemNotification } from '../types';
import { SunIcon, MoonIcon, LanguageIcon, MenuAlt2Icon, BellIcon, StockIcon, LogoutIcon, UserCircleIcon, BranchesIcon, ChevronDownIcon } from './icons';

interface HeaderProps {
    toggleSidebar: () => void;
}

const themes: { name: Theme; label: string }[] = [
    { name: 'light', label: 'Light' },
    { name: 'dark', label: 'Dark' },
    { name: 'modern', label: 'Modern' },
    { name: 'glassmorphism', label: 'Glass' },
    { name: 'neon', label: 'Neon' },
    { name: 'classic', label: 'Classic' },
];

const NotificationDropdown: React.FC<{ notifications: SystemNotification[], markAllAsRead: () => void, setView: (view: any, filters?: any) => void, close: () => void }> = ({ notifications, markAllAsRead, setView, close }) => {
    const { t } = useLocalization();

    const handleNotificationClick = (notification: SystemNotification) => {
        if (notification.link) {
            setView(notification.link.view, notification.link.filters);
        }
        close();
    }
    
    return (
        <div className="absolute top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl ltr:right-0 rtl:left-0">
            <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold">{t('notification_center')}</h3>
                <button onClick={markAllAsRead} className="text-xs text-primary font-semibold">{t('mark_all_as_read')}</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground p-6">{t('no_new_notifications')}</p>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b border-border last:border-b-0 hover:bg-secondary cursor-pointer ${!n.read ? 'bg-secondary/50' : ''}`}>
                             <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-red-500/20 text-red-500 rounded-full mt-1"><StockIcon/></div>
                                <div>
                                    <p className="text-sm font-semibold">{t('stock_alert')}</p>
                                    <p className="text-xs text-muted-foreground">{n.message}</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                </div>
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocalization();
  const { systemNotifications, markAllNotificationsAsRead, setView, branches, currentBranchId, setCurrentBranch } = useSystem();
  const { user, currentRole, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const branchSelectorRef = useRef<HTMLDivElement>(null);

  const unreadCount = systemNotifications.filter(n => !n.read).length;
  const currentBranch = branches.find(b => b.id === currentBranchId);

  const handleClickOutside = (event: MouseEvent) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      setShowNotifications(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
      setShowUserMenu(false);
    }
    if (branchSelectorRef.current && !branchSelectorRef.current.contains(event.target as Node)) {
      setShowBranchSelector(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full p-4 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="lg:hidden p-2.5 rounded-md hover:bg-secondary">
                <MenuAlt2Icon />
            </button>
            <h1 className="text-xl font-bold hidden sm:block">{t('greeting')} {user?.name.split(' ')[0]}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div ref={branchSelectorRef} className="relative">
              <button onClick={() => setShowBranchSelector(s => !s)} className="flex items-center gap-2 p-2.5 rounded-md hover:bg-secondary transition-colors font-semibold">
                  <BranchesIcon />
                  <span>{currentBranch ? currentBranch.name : 'Select Branch'}</span>
                  <ChevronDownIcon />
              </button>
              {showBranchSelector && (
                  <div className="absolute top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl ltr:left-0 rtl:right-0 z-20">
                      <ul className="p-2">
                          {branches.map(branch => (
                              <li key={branch.id}>
                                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentBranch(branch.id); setShowBranchSelector(false); }}
                                    className={`block w-full text-left rtl:text-right px-3 py-2 text-sm rounded-md ${currentBranchId === branch.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                                    {branch.name}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>

          <div className="relative">
             <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="appearance-none cursor-pointer rounded-md py-2 px-3 bg-secondary border border-transparent hover:border-border transition-colors"
                aria-label="Theme switcher"
             >
                {themes.map(th => <option key={th.name} value={th.name}>{th.label}</option>)}
             </select>
          </div>
          
          <button
            onClick={() => setLocale(locale === 'en-US' ? 'ar-EG' : 'en-US')}
            className="p-2.5 rounded-md hover:bg-secondary transition-colors"
            aria-label="Language switcher"
          >
            <div className="flex items-center gap-2">
                <LanguageIcon />
                <span>{locale === 'en-US' ? 'AR' : 'EN'}</span>
            </div>
          </button>
          
          <div ref={notificationRef} className="relative">
              <button onClick={() => setShowNotifications(s => !s)} className="p-2.5 rounded-md hover:bg-secondary transition-colors relative">
                  <BellIcon />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 block w-4 h-4 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>}
              </button>
              {showNotifications && <NotificationDropdown notifications={systemNotifications} markAllAsRead={markAllNotificationsAsRead} setView={setView} close={() => setShowNotifications(false)}/>}
          </div>
          
          <div ref={userMenuRef} className="relative">
            <button onClick={() => setShowUserMenu(s => !s)} className="flex items-center gap-2">
                 <img
                    src={`https://i.pravatar.cc/150?u=${user?.id}`}
                    alt="User profile"
                    className="w-10 h-10 rounded-full object-cover"
                />
            </button>
            {showUserMenu && (
                 <div className="absolute top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl ltr:right-0 rtl:left-0">
                     <div className="p-3 border-b border-border">
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{currentRole?.name}</p>
                     </div>
                     <div className="p-2">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md hover:bg-secondary">
                          <UserCircleIcon/>
                          {t('profile_and_settings')}
                        </button>
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 text-left rounded-md hover:bg-secondary">
                            <LogoutIcon/>
                            {t('logout')}
                        </button>
                     </div>
                 </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};