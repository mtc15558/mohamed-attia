import { Sprout, LogOut, Home, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface HeaderProps {
  currentUser: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Header({ currentUser, currentPage, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <Sprout className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">المبادرات الزراعية</h1>
              <p className="text-sm text-green-100">دور القطاع الزراعي في التنمية المستدامة</p>
            </div>
          </div>
          
          {currentUser ? (
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Button 
                  variant={currentPage === 'home' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('home')}
                  className="text-white hover:bg-green-500"
                >
                  <Home className="w-4 h-4 ml-2" />
                  الرئيسية
                </Button>
                <Button 
                  variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('dashboard')}
                  className="text-white hover:bg-green-500"
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  لوحة التحكم
                </Button>
                <Button 
                  variant={currentPage === 'add' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('add')}
                  className="text-white hover:bg-green-500"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مبادرة
                </Button>
              </nav>
              
              <div className="flex items-center gap-3 border-r border-green-500 pr-4">
                <div className="text-right">
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-xs text-green-100">{currentUser.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onLogout}
                  className="text-white hover:bg-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => onNavigate('login')}
              className="bg-white text-green-700 hover:bg-green-50"
            >
              تسجيل الدخول
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
