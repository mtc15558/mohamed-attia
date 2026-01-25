import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Header } from '@/app/components/Header';
import { HomePage } from '@/app/components/HomePage';
import { LoginPage } from '@/app/components/LoginPage';
import { DashboardPage } from '@/app/components/DashboardPage';
import { AddInitiativePage } from '@/app/components/AddInitiativePage';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Fetch data when logged in
  useEffect(() => {
    if (currentUser) {
      fetchInitiatives();
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && session.access_token) {
        const userInfo = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'مستخدم'
        };
        setCurrentUser(userInfo);
        setAccessToken(session.access_token);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitiatives = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b32230e/initiatives`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInitiatives(data.initiatives || []);
      } else {
        console.error('Failed to fetch initiatives');
        toast.error('فشل تحميل المبادرات');
      }
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      toast.error('حدث خطأ أثناء تحميل المبادرات');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b32230e/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    setAccessToken(token);
    setCurrentPage('home');
    toast.success(`مرحباً ${user.name}!`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setAccessToken('');
      setCurrentPage('home');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchInitiatives();
    fetchStatistics();
  };

  const handleAddSuccess = () => {
    handleRefresh();
    setCurrentPage('dashboard');
    toast.success('تم إضافة المبادرة بنجاح!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {currentPage !== 'login' && (
        <Header
          currentUser={currentUser}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentPage === 'home' && (
        <HomePage
          initiatives={initiatives}
          stats={stats}
          onNavigate={handleNavigate}
          currentUser={currentUser}
        />
      )}

      {currentPage === 'dashboard' && currentUser && (
        <DashboardPage
          initiatives={initiatives}
          accessToken={accessToken}
          onRefresh={handleRefresh}
        />
      )}

      {currentPage === 'add' && currentUser && (
        <AddInitiativePage
          accessToken={accessToken}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}
