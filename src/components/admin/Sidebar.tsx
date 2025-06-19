import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

const APP_VERSION = 'v1.0.0'; // You can move this to a config file

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on window resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle hover-based collapse/expand
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (!isLocked && window.innerWidth >= 1024) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked && window.innerWidth >= 1024) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsCollapsed(true);
      }, 300);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin',
    },
    {
      title: 'Inventory',
      icon: <Package size={20} />,
      path: '/admin/inventory',
    },
    {
      title: 'Orders',
      icon: <ShoppingCart size={20} />,
      path: '/admin/orders',
    },
    {
      title: 'Reports',
      icon: <BarChart size={20} />,
      path: '/admin/reports',
    },
    {
      title: 'Customers',
      icon: <Users size={20} />,
      path: '/admin/customers',
    },
    {
      title: 'Spends',
      icon: <DollarSign size={20} />,
      path: '/admin/spends',
    },
    {
      title: 'Stock History',
      icon: <LineChart size={20} />,
      path: '/admin/verify-stock-history',
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      path: '/admin/settings',
    },
  ];

  const sidebarClasses = `
    fixed top-0 bottom-0 z-40 bg-neutral-800 dark:bg-neutral-900 text-white transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${isMobileOpen ? 'left-0' : '-left-full lg:left-0'}
  `;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    // When unlocking, if the sidebar is not being hovered, collapse it
    if (!isLocked && !sidebarRef.current?.matches(':hover')) {
      setIsCollapsed(true);
    }
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-neutral-800 dark:bg-neutral-700 text-white lg:hidden hover:bg-neutral-700 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-transform duration-200 hover:scale-105"
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div 
        ref={sidebarRef}
        className={sidebarClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-700">
          <div className="flex items-center">
            <Package size={24} className="text-primary-500 flex-shrink-0" />
            <div className={`
              ml-2 transition-all duration-300 ease-in-out
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
            `}>
              <span className="text-xl font-bold truncate">
                Brick<span className="text-primary-500">Co</span>
              </span>
            </div>
          </div>
          
          {/* Desktop Collapse & Lock Buttons */}
          <div className="hidden lg:flex items-center space-x-1">
            <button
              onClick={toggleLock}
              className="p-1.5 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-colors"
              aria-label={isLocked ? "Enable hover-based collapsing" : "Disable hover-based collapsing"}
            >
              {isLocked ? (
                <Lock size={16} className="text-primary-500" />
              ) : (
                <Unlock size={16} className="text-neutral-400" />
              )}
            </button>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} className="text-neutral-400" />
              ) : (
                <ChevronLeft size={20} className="text-neutral-400" />
              )}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="py-6">
          <ul className="space-y-1.5 px-3">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                      group relative overflow-hidden
                      ${active
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                        : 'text-neutral-300 hover:bg-neutral-700/50 hover:text-white'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    onClick={() => setIsMobileOpen(false)}
                    role="menuitem"
                    aria-current={active ? 'page' : undefined}
                  >
                    {/* Active indicator for collapsed state */}
                    {isCollapsed && active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
                    )}
                    <span className={`
                      flex-shrink-0 transition-transform duration-200 relative
                      ${active ? 'text-white transform scale-110' : 'text-neutral-400 group-hover:text-white'}
                      ${isCollapsed && active ? 'ml-1' : ''} // Add slight margin when collapsed and active to account for indicator
                    `}>
                      {item.icon}
                    </span>
                    <span className={`
                      ml-3 font-medium whitespace-nowrap transition-all duration-300
                      ${active ? 'font-semibold' : ''}
                      ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
                    `}>
                      {item.title}
                    </span>
                    {isCollapsed && (
                      <div className="
                        absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-sm
                        rounded opacity-0 group-hover:opacity-100 pointer-events-none
                        transform -translate-x-2 group-hover:translate-x-0
                        transition-all duration-200 z-50
                      ">
                        {item.title}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-700">
          <button
            onClick={logout}
            className={`
              flex items-center w-full px-3 py-2.5 rounded-lg
              text-neutral-300 hover:bg-neutral-700/50 hover:text-white
              transition-colors duration-200 group relative
              ${isCollapsed ? 'justify-center' : ''}
            `}
            aria-label="Logout"
          >
            <LogOut size={20} className="flex-shrink-0 text-neutral-400 group-hover:text-white" />
            <span className={`
              ml-3 transition-all duration-300
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
            `}>
              Logout
            </span>
            {isCollapsed && (
              <div className="
                absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-sm
                rounded opacity-0 group-hover:opacity-100 pointer-events-none
                transform -translate-x-2 group-hover:translate-x-0
                transition-all duration-200 z-50
              ">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* New Footer Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-700 dark:border-neutral-600">
          {/* Settings and Theme Controls */}
          <div className="p-4 space-y-2">
            {/* Control Buttons Container */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`
                  flex-1 flex items-center justify-center px-3 py-2
                  rounded-lg text-sm font-medium
                  ${isDarkMode 
                    ? 'bg-neutral-700/50 text-primary-400' 
                    : 'bg-neutral-700/20 text-neutral-300'
                  }
                  hover:bg-neutral-700 hover:text-white
                  transition-all duration-200
                  group relative
                `}
                aria-label="Toggle dark mode"
              >
                <span className={`
                  flex items-center transition-transform duration-500
                  ${isDarkMode ? 'rotate-180' : 'rotate-0'}
                  ${isCollapsed ? 'mr-0' : 'mr-2'}
                `}>
                  {isDarkMode ? (
                    <Moon size={18} className="text-primary-400" />
                  ) : (
                    <Sun size={18} className="text-primary-400" />
                  )}
                </span>
                {!isCollapsed && (
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="
                    absolute left-full ml-2 px-2 py-1 bg-neutral-900 
                    text-white text-xs rounded opacity-0 group-hover:opacity-100 
                    pointer-events-none transform -translate-x-2 
                    group-hover:translate-x-0 transition-all duration-200 
                    whitespace-nowrap z-50
                  ">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </div>
                )}
              </button>

              {/* Settings Button */}
              <Link
                to="/admin/settings"
                className={`
                  flex-1 flex items-center justify-center px-3 py-2
                  rounded-lg text-sm font-medium
                  ${location.pathname === '/admin/settings'
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-neutral-300 hover:bg-neutral-700/50 hover:text-white'
                  }
                  transition-all duration-200
                  group relative
                `}
              >
                <Settings size={18} className={`
                  ${isCollapsed ? 'mr-0' : 'mr-2'}
                  ${location.pathname === '/admin/settings' ? 'text-primary-400' : ''}
                `} />
                {!isCollapsed && <span>Settings</span>}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="
                    absolute left-full ml-2 px-2 py-1 bg-neutral-900 
                    text-white text-xs rounded opacity-0 group-hover:opacity-100 
                    pointer-events-none transform -translate-x-2 
                    group-hover:translate-x-0 transition-all duration-200 z-50
                  ">
                    Settings
                  </div>
                )}
              </Link>
            </div>

            {/* Help/Support Button */}
            <button
              onClick={() => window.open('mailto:support@brickco.com')}
              className={`
                w-full flex items-center justify-center px-3 py-2
                rounded-lg text-sm font-medium
                text-neutral-400 hover:bg-neutral-700/50 hover:text-white
                transition-all duration-200
                group relative
              `}
              aria-label="Contact support"
            >
              <HelpCircle size={18} className={`${isCollapsed ? 'mr-0' : 'mr-2'}`} />
              {!isCollapsed && <span>Contact Support</span>}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-2 px-2 py-1 bg-neutral-900 
                  text-white text-xs rounded opacity-0 group-hover:opacity-100 
                  pointer-events-none transform -translate-x-2 
                  group-hover:translate-x-0 transition-all duration-200 z-50
                ">
                  Contact Support
                </div>
              )}
            </button>
          </div>

          {/* App Info */}
          <div className={`
            px-4 py-3 text-neutral-500 text-xs
            border-t border-neutral-700 dark:border-neutral-600
            ${isCollapsed ? 'text-center' : ''}
          `}>
            <div className={`font-medium ${isCollapsed ? 'hidden' : 'block'}`}>
              BrickCo Admin
            </div>
            <div className="mt-0.5">
              {APP_VERSION}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;