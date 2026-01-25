import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface DashboardPageProps {
  initiatives: any[];
  accessToken: string;
  onRefresh: () => void;
}

export function DashboardPage({ initiatives, accessToken, onRefresh }: DashboardPageProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    targetArea: '',
    beneficiaries: 0,
    budget: 0
  });

  const categories = [
    'ري وموارد مائية',
    'تربية حيوانية',
    'زراعة عضوية',
    'تقنيات حديثة',
    'تدريب وتوعية',
    'أخرى'
  ];

  const categoryColors: Record<string, string> = {
    'ري وموارد مائية': 'bg-blue-100 text-blue-800',
    'تربية حيوانية': 'bg-amber-100 text-amber-800',
    'زراعة عضوية': 'bg-green-100 text-green-800',
    'تقنيات حديثة': 'bg-purple-100 text-purple-800',
    'تدريب وتوعية': 'bg-pink-100 text-pink-800',
    'أخرى': 'bg-gray-100 text-gray-800'
  };

  const handleView = (initiative: any) => {
    setSelectedInitiative(initiative);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (initiative: any) => {
    setSelectedInitiative(initiative);
    setEditData({
      title: initiative.title,
      description: initiative.description,
      category: initiative.category,
      status: initiative.status,
      targetArea: initiative.targetArea || '',
      beneficiaries: initiative.beneficiaries || 0,
      budget: initiative.budget || 0
    });
    setIsEditDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = (initiative: any) => {
    setSelectedInitiative(initiative);
    setIsDeleteDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const submitEdit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b32230e/initiatives/${selectedInitiative.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(editData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError('فشل تحديث المبادرة: ' + data.error);
        setLoading(false);
        return;
      }

      setSuccess('تم تحديث المبادرة بنجاح');
      setTimeout(() => {
        setIsEditDialogOpen(false);
        onRefresh();
      }, 1500);
    } catch (err) {
      setError('حدث خطأ أثناء تحديث المبادرة');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b32230e/initiatives/${selectedInitiative.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError('فشل حذف المبادرة: ' + data.error);
        setLoading(false);
        return;
      }

      setIsDeleteDialogOpen(false);
      onRefresh();
    } catch (err) {
      setError('حدث خطأ أثناء حذف المبادرة');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter initiatives
  const filteredInitiatives = initiatives.filter((initiative) => {
    const matchesSearch = initiative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         initiative.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || initiative.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || initiative.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">إدارة جميع المبادرات الزراعية</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>البحث</Label>
              <Input
                placeholder="ابحث في المبادرات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Label>التصنيف</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initiatives List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredInitiatives.map((initiative) => (
          <Card key={initiative.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Badge className={categoryColors[initiative.category] || categoryColors['أخرى']}>
                      {initiative.category}
                    </Badge>
                    <Badge variant={initiative.status === 'active' ? 'default' : 'secondary'}>
                      {initiative.status === 'active' ? 'نشط' : 'مكتمل'}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{initiative.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {initiative.description}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(initiative)}
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(initiative)}
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(initiative)}
                    title="حذف"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {initiative.targetArea && (
                  <div>
                    <span className="text-gray-600">المنطقة:</span>
                    <p className="font-medium">{initiative.targetArea}</p>
                  </div>
                )}
                {initiative.beneficiaries > 0 && (
                  <div>
                    <span className="text-gray-600">المستفيدون:</span>
                    <p className="font-medium">{initiative.beneficiaries.toLocaleString('ar-EG')}</p>
                  </div>
                )}
                {initiative.budget > 0 && (
                  <div>
                    <span className="text-gray-600">الميزانية:</span>
                    <p className="font-medium">{initiative.budget.toLocaleString('ar-EG')} جنيه</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <p className="font-medium">
                    {new Date(initiative.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInitiatives.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl text-gray-500">لا توجد مبادرات تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedInitiative?.title}</DialogTitle>
            <DialogDescription>تفاصيل المبادرة</DialogDescription>
          </DialogHeader>
          
          {selectedInitiative && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={categoryColors[selectedInitiative.category]}>
                  {selectedInitiative.category}
                </Badge>
                <Badge variant={selectedInitiative.status === 'active' ? 'default' : 'secondary'}>
                  {selectedInitiative.status === 'active' ? 'نشط' : 'مكتمل'}
                </Badge>
              </div>
              
              <div>
                <Label>الوصف</Label>
                <p className="mt-1 text-gray-700">{selectedInitiative.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedInitiative.targetArea && (
                  <div>
                    <Label>المنطقة المستهدفة</Label>
                    <p className="mt-1 font-medium">{selectedInitiative.targetArea}</p>
                  </div>
                )}
                
                {selectedInitiative.beneficiaries > 0 && (
                  <div>
                    <Label>عدد المستفيدين</Label>
                    <p className="mt-1 font-medium">
                      {selectedInitiative.beneficiaries.toLocaleString('ar-EG')}
                    </p>
                  </div>
                )}
                
                {selectedInitiative.budget > 0 && (
                  <div>
                    <Label>الميزانية</Label>
                    <p className="mt-1 font-medium">
                      {selectedInitiative.budget.toLocaleString('ar-EG')} جنيه
                    </p>
                  </div>
                )}
                
                <div>
                  <Label>تاريخ الإنشاء</Label>
                  <p className="mt-1 font-medium">
                    {new Date(selectedInitiative.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المبادرة</DialogTitle>
            <DialogDescription>تعديل بيانات المبادرة</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">عنوان المبادرة *</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">الوصف *</Label>
              <Textarea
                id="edit-description"
                rows={4}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">التصنيف *</Label>
                <Select value={editData.category} onValueChange={(value) => setEditData({ ...editData, category: value })}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-status">الحالة</Label>
                <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-targetArea">المنطقة المستهدفة</Label>
              <Input
                id="edit-targetArea"
                value={editData.targetArea}
                onChange={(e) => setEditData({ ...editData, targetArea: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-beneficiaries">عدد المستفيدين</Label>
                <Input
                  id="edit-beneficiaries"
                  type="number"
                  min="0"
                  value={editData.beneficiaries}
                  onChange={(e) => setEditData({ ...editData, beneficiaries: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="edit-budget">الميزانية (جنيه)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  min="0"
                  value={editData.budget}
                  onChange={(e) => setEditData({ ...editData, budget: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>
              إلغاء
            </Button>
            <Button onClick={submitEdit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التعديلات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المبادرة "{selectedInitiative?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف المبادرة'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
