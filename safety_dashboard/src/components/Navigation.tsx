import Link from 'next/link';
import { LogOut, User, Shield, Crown, Users } from 'lucide-react';

interface NavigationProps {
  currentRole?: 'user' | 'police' | 'admin' | 'super_admin';
  userName?: string;
}

export default function Navigation({ currentRole, userName }: NavigationProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <User className="h-4 w-4" />;
      case 'police': return <Shield className="h-4 w-4" />;
      case 'admin': return <Users className="h-4 w-4" />;
      case 'super_admin': return <Crown className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'police': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'super_admin': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Security Alert System
            </Link>
            {currentRole && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentRole)}`}>
                {getRoleIcon(currentRole)}
                {currentRole.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-gray-600">Welcome, {userName}</span>
            )}
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
