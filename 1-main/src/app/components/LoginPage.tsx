import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Sprout, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface LoginPageProps {
  onLoginSuccess: (user: any, accessToken: string) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) {
        setError('فشل تسجيل الدخول: ' + authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        const userInfo = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'مستخدم'
        };
        onLoginSuccess(userInfo, data.session.access_token);
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء تسجيل الدخول');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    if (signupData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b32230e/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          name: signupData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError('فشل التسجيل: ' + data.error);
        setLoading(false);
        return;
      }

      setSuccess('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول');
      setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
      
      // Auto switch to login after 2 seconds
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError('حدث خطأ أثناء التسجيل');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-4 rounded-full">
              <Sprout className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">المبادرات الزراعية</h1>
          <p className="text-gray-600">نظام إدارة المبادرات الزراعية</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'أدخل بياناتك للوصول إلى لوحة التحكم' 
                : 'قم بإنشاء حساب جديد لإدارة المبادرات'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">البريد الإلكتروني</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">الاسم الكامل</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">تأكيد كلمة المرور</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
