import { Leaf, Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface HomePageProps {
  initiatives: any[];
  stats: any;
  onNavigate: (page: string) => void;
  currentUser: any;
}

export function HomePage({ initiatives, stats, onNavigate, currentUser }: HomePageProps) {
  const features = [
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      title: 'الزراعة المستدامة',
      description: 'تعزيز ممارسات زراعية صديقة للبيئة تحافظ على الموارد الطبيعية للأجيال القادمة'
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: 'دعم المزارعين',
      description: 'تمكين المزارعين من خلال التدريب والموارد والتقنيات الحديثة'
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-purple-600" />,
      title: 'التنمية الاقتصادية',
      description: 'تحسين الإنتاجية الزراعية وزيادة الدخل للمجتمعات الريفية'
    },
    {
      icon: <Award className="w-12 h-12 text-orange-600" />,
      title: 'الجودة والابتكار',
      description: 'تطبيق أحدث التقنيات والابتكارات في القطاع الزراعي'
    }
  ];

  const categoryColors: Record<string, string> = {
    'ري وموارد مائية': 'bg-blue-100 text-blue-800',
    'تربية حيوانية': 'bg-amber-100 text-amber-800',
    'زراعة عضوية': 'bg-green-100 text-green-800',
    'تقنيات حديثة': 'bg-purple-100 text-purple-800',
    'تدريب وتوعية': 'bg-pink-100 text-pink-800',
    'أخرى': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              دور القطاع الزراعي في تدعيم التنمية الزراعية
            </h1>
            <p className="text-xl mb-8 text-green-100">
              نعمل على تطوير القطاع الزراعي من خلال مبادرات مبتكرة تهدف إلى تحقيق التنمية المستدامة
              ودعم المزارعين وتحسين الإنتاجية الزراعية
            </p>
            {currentUser && (
              <Button 
                size="lg"
                onClick={() => onNavigate('add')}
                className="bg-white text-green-700 hover:bg-green-50 text-lg px-8"
              >
                إضافة مبادرة جديدة
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {stats && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center border-t-4 border-t-green-600">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-green-600">
                    {stats.totalInitiatives}
                  </CardTitle>
                  <CardDescription className="text-lg">إجمالي المبادرات</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center border-t-4 border-t-blue-600">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-blue-600">
                    {stats.activeInitiatives}
                  </CardTitle>
                  <CardDescription className="text-lg">مبادرات نشطة</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center border-t-4 border-t-purple-600">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-purple-600">
                    {stats.totalBeneficiaries?.toLocaleString('ar-EG')}
                  </CardTitle>
                  <CardDescription className="text-lg">المستفيدون</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center border-t-4 border-t-orange-600">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-orange-600">
                    {(stats.totalBudget / 1000000).toFixed(1)} م
                  </CardTitle>
                  <CardDescription className="text-lg">الميزانية (جنيه)</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            أهدافنا الرئيسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Initiatives */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800">أحدث المبادرات</h2>
            {currentUser && (
              <Button onClick={() => onNavigate('dashboard')}>
                عرض جميع المبادرات
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.slice(0, 6).map((initiative) => (
              <Card key={initiative.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={categoryColors[initiative.category] || categoryColors['أخرى']}>
                      {initiative.category}
                    </Badge>
                    <Badge variant={initiative.status === 'active' ? 'default' : 'secondary'}>
                      {initiative.status === 'active' ? 'نشط' : 'مكتمل'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{initiative.title}</CardTitle>
                  <CardDescription>{initiative.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {initiative.targetArea && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">المنطقة المستهدفة:</span>
                        <span className="font-medium">{initiative.targetArea}</span>
                      </div>
                    )}
                    {initiative.beneficiaries > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">المستفيدون:</span>
                        <span className="font-medium">{initiative.beneficiaries.toLocaleString('ar-EG')}</span>
                      </div>
                    )}
                    {initiative.budget > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الميزانية:</span>
                        <span className="font-medium">{initiative.budget.toLocaleString('ar-EG')} جنيه</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {initiatives.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500 mb-4">لا توجد مبادرات حالياً</p>
              {currentUser && (
                <Button onClick={() => onNavigate('add')}>
                  إضافة أول مبادرة
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">مشروع تخرج: دور القطاع الزراعي في تدعيم التنمية الزراعية</p>
          <p className="text-gray-400">© 2026 جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
