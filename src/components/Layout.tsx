
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Calendar, Users, User, Settings, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">WELLNESS</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') ? 'bg-black text-white' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/plan"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/plan') ? 'bg-black text-white' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Plan</span>
              </Link>
              <Link
                to="/community"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/community') || location.pathname.startsWith('/community/') ? 'bg-black text-white' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Community</span>
              </Link>
              <Link
                to="/posts"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/posts') ? 'bg-black text-white' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Posts</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Avatar className="cursor-pointer">
                <AvatarFallback className="bg-black text-white">T</AvatarFallback>
              </Avatar>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile/Tablet) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 md:hidden">
        <Link to="/" className={`flex flex-col items-center flex-1 py-2 ${isActive('/') ? 'text-purple-600' : 'text-gray-500'}`}> 
          <Home className="w-6 h-6 mb-1" />
        </Link>
        <Link to="/plan" className={`flex flex-col items-center flex-1 py-2 ${isActive('/plan') ? 'text-purple-600' : 'text-gray-500'}`}> 
          <Calendar className="w-6 h-6 mb-1" />
        </Link>
        <Link to="/community" className={`flex flex-col items-center flex-1 py-2 ${(isActive('/community') || location.pathname.startsWith('/community/')) ? 'text-purple-600' : 'text-gray-500'}`}> 
          <Users className="w-6 h-6 mb-1" />
        </Link>
        <Link to="/posts" className={`flex flex-col items-center flex-1 py-2 ${isActive('/posts') ? 'text-purple-600' : 'text-gray-500'}`}> 
          <MessageSquare className="w-6 h-6 mb-1" />
        </Link>
        <Link to="/profile" className={`flex flex-col items-center flex-1 py-2 ${isActive('/profile') ? 'text-purple-600' : 'text-gray-500'}`}> 
          <User className="w-6 h-6 mb-1" />
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
