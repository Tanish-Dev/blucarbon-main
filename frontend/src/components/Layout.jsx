import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  Menu, 
  X, 
  BarChart3, 
  FolderOpen, 
  MapPin, 
  Microscope, 
  Coins, 
  ShoppingCart,
  Shield, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { navItems } from '../mock';
import BrandLogo from './BrandLogo';

const iconMap = {
  dashboard: BarChart3,
  projects: FolderOpen,
  'field-capture': MapPin,
  'dmrv-studio': Microscope,
  credits: Coins,
  marketplace: ShoppingCart,
  admin: Shield,
  settings: Settings
};

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
  };

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'admin' && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <Link to="/">
              <BrandLogo />
            </Link>
          </div>

          {/* Right: User info and actions */}
          <div className="flex items-center gap-3">
            {/* User welcome */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-700">
                {user?.full_name || user?.username}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
            
            <Button 
              className="bg-[#00e07a] hover:bg-[#00b86b] text-black px-6 py-2 rounded-xl font-medium shadow-sm"
              onClick={() => window.location.href = '/projects'}
            >
              Start a Project
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-9 h-9 p-0 rounded-lg border-slate-200 hover:border-slate-300"
              onClick={() => window.location.href = '/settings'}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-9 h-9 p-0 rounded-lg border-slate-200 hover:border-slate-300 text-red-600 hover:text-red-700 hover:border-red-200"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className={`bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} flex-shrink-0`}>
          <div className="p-4">
            {/* Collapse Toggle */}
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = iconMap[item.id];
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-green-50 text-green-700 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-600' : ''}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {isActive && <div className="w-2 h-2 bg-[#00e07a] rounded-full ml-auto" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          <div className="max-w-[1280px] mx-auto p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}