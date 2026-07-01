import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export function Layout() {
  const { userEmail, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/history', label: 'History', icon: '📚' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and nav links */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-600">🔬 Research Agent</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* User menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <span className="text-sm text-gray-500">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-base font-medium ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 border-l-4 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 px-4">
              <p className="text-sm text-gray-500 mb-2">{userEmail}</p>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
