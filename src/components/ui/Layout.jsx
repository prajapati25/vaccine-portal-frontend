import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Calendar, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  
  // Custom sidebar background color to match login page
  const sidebarColor = 'rgb(116, 120, 117)';
  const sidebarHoverColor = 'rgb(96, 100, 97)';
  const sidebarActiveColor = 'rgb(86, 90, 87)';
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const sidebarLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <BookOpen size={20} className="text-white" />,
    },
    {
      name: 'Manage Students',
      path: '/students',
      icon: <Users size={20} className="text-white" />,
    },
    {
      name: 'Vaccination Drives',
      path: '/drives',
      icon: <Calendar size={20} className="text-white" />,
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <FileText size={20} className="text-white" />,
    },
  ];
  
  return (
    <div className="fixed inset-0 flex bg-gray-100">
      <div
        className="w-64 h-full shadow-md flex-shrink-0"
        style={{
          backgroundColor: sidebarColor,
        }}
      >
        {/* App Title */}
        <div className="py-8 px-4 flex justify-center items-center border-b border-opacity-20 border-white">
          <h2 className="text-3xl font-bold text-white text-center">Vaccination<br />Portal</h2>
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-6">
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`
                    flex items-center px-6 py-3 text-white transition-colors duration-200
                    ${isActive(link.path) ? 'bg-opacity-100' : 'hover:bg-opacity-100'}
                  `}
                  style={{
                    backgroundColor: isActive(link.path) ? sidebarActiveColor : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.path)) {
                      e.currentTarget.style.backgroundColor = sidebarHoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="mr-3">{link.icon}</div>
                  <span className="text-white">{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="absolute bottom-0 w-64 border-t border-white border-opacity-20">
          <button
            onClick={logout}
            className="flex items-center w-full px-6 py-4 text-white transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = sidebarHoverColor}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut className="mr-3" size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content - takes full remaining width */}
      <div className="flex-1 overflow-auto">
        <main className="h-full w-full p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;