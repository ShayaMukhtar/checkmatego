import { useState } from 'react';
import { Menu, X, Bell, User, Search } from 'lucide-react';

interface NavBarProps {
  userName: string;
  onLogout: () => void;
  notifications: number; // new notifications prop
}

const NavBar: React.FC<NavBarProps> = ({ userName, onLogout, notifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass bg-white/80 backdrop-blur-xl border-b border-border/40">
      <div className="mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span style={{ color: "#37cb7e", fontSize: "1.25rem", fontWeight: "bold" }}>
                CheckMateGo
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-primary/60" />
              </div>
              <input
                type="text"
                className="bg-secondary/70 pl-10 pr-4 py-2 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-colors border-none"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <button className="relative text-primary/80 hover:text-primary p-2 rounded-full hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {notifications}
                  </span>
                )}
              </button>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userName}</span>
                <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary/80 hover:text-primary p-2 rounded-md hover:bg-secondary transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border/40 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-3 py-2 rounded-md text-sm font-medium text-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> {userName}
              </span>
            </div>
            <div className="px-3 py-2 rounded-md text-sm font-medium text-foreground">
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications {notifications > 0 && `(${notifications})`}
              </span>
            </div>
            <div className="px-3 py-2">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
            <div className="relative mt-3 px-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-primary/60" />
              </div>
              <input
                type="text"
                className="bg-secondary/70 pl-10 pr-4 py-2 rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-colors border-none"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
