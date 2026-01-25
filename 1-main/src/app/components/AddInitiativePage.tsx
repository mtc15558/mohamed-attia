import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { PlusCircle, Loader2, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface AddInitiativePageProps {
  accessToken: string;
  onSuccess: () => void;
}

export function AddInitiativePage({ accessToken, onSuccess }: AddInitiativePageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'active',
    targetArea: '',
    beneficiaries: '',
    budget: ''
  });

  const categories = [
    'ري وموارد مائية',
    'تربية حيوانية',
    'زراعة عضوية',
    'تقنيات حديثة',
    'تدريب وتوعية',
    'أخرى'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!formData.title || !formData.description || !formData.category) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b32230e/initiatives`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            status: formData.status,
            targetArea: formData.targetArea,
            beneficiaries: parseInt(formData.beneficiaries) || 0,
            budget: parseInt(formData.budget) || 0
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError('فشل إضافة المبادرة: ' + data.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        status: 'active',
        targetArea: '',
        beneficiaries: '',
        budget: ''
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError('حدث خطأ أثناء إضافة المبادرة');
      console.error('Add initiative error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      status: 'active',
      targetArea: '',
      beneficiaries: '',
      budget: ''
    });
    setError('');
    setSuccess(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <PlusCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">إضافة مبادرة جديدة</h1>
          <p className="text-gray-600">أضف مبادرة زراعية جديدة لتعزيز التنمية المستدامة</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات المبادرة</CardTitle>
            <CardDescription>
              يرجى ملء جميع المعلومات المطلوبة عن المبادرة الزراعية
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription className="mr-2">
                  تم إضافة المبادرة بنجاح! جاري التحويل إلى لوحة التحكم...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  المعلومات الأساسية
                </h3>

                <div>
                  <Label htmlFor="title">عنوان المبادرة *</Label>
                  <Input
                    id="title"
                    placeholder="مثال: مبادرة تطوير نظم الري الحديثة"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف المبادرة *</Label>
                  <Textarea
                    id="description"
                    placeholder="اكتب وصفاً تفصيلياً عن المبادرة وأهدافها..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="اختر التصنيف المناسب" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">حالة المبادرة</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  معلومات إضافية
                </h3>

                <div>
                  <Label htmlFor="targetArea">المنطقة المستهدفة</Label>
                  <Input
                    id="targetArea"
                    placeholder="مثال: محافظة الفيوم - مركز إطسا"
                    value={formData.targetArea}
                    onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="beneficiaries">عدد المستفيدين المتوقع</Label>
                    <Input
                      id="beneficiaries"
                      type="number"
                      min="0"
                      placeholder="مثال: 500"
                      value={formData.beneficiaries}
                      onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget">الميزانية المتوقعة (جنيه)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      placeholder="مثال: 1000000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تم الإضافة بنجاح
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 ml-2" />
                      إضافة المبادرة
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={loading || success}
                >
                  إعادة تعيين
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">نصائح لإضافة مبادرة ناجحة</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900">
            <ul className="list-disc list-inside space-y-2">
              <li>اختر عنواناً واضحاً ومعبراً عن المبادرة</li>
              <li>قدم وصفاً تفصيلياً يشرح أهداف المبادرة والفوائد المتوقعة</li>
              <li>حدد التصنيف المناسب ليسهل العثور على المبادرة</li>
              <li>أضف معلومات دقيقة عن المستفيدين والميزانية إن أمكن</li>
              <li>يمكنك تعديل المبادرة لاحقاً من لوحة التحكم</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
