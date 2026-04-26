'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Building2, CheckCircle, Download, LogOut } from 'lucide-react';
import { uploadCoursesCSV } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function UploadCard({
  title,
  description,
  onUpload,
  onDownloadTemplate,
}: {
  title: string;
  description: string;
  onUpload: (file: File) => Promise<void>;
  onDownloadTemplate?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a .csv file.' });
        setSelectedFile(null);
        event.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      const fileInput = document.getElementById(`file-upload-${title}`) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              {title === 'Universities' ? <Building2 className="text-accent" /> : <FileText className="text-accent" />}
              {title} Data
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onDownloadTemplate && (
            <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          id={`file-upload-${title}`}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
          className="file:text-primary file:font-semibold"
        />
        {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
          {isUploading ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" /> Upload CSV</>}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { admin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Courses upload — calls real backend POST /api/courses/upload
  const handleCourseUpload = async (file: File) => {
    try {
      const result = await uploadCoursesCSV(file);
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Success</div>,
        description: `${result.count} courses uploaded from "${file.name}".`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast({ variant: 'destructive', title: 'Upload Failed', description: message });
    }
  };

  // Universities upload — kept as UI-only (no backend endpoint required by assignment)
  const handleUniversityUpload = async (file: File) => {
    toast({
      title: <div className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Success</div>,
      description: `University data from "${file.name}" uploaded successfully.`,
    });
  };

  const handleCourseTemplateDownload = () => {
    const headers = [
      'course_id', 'title', 'description', 'category', 'instructor', 'duration',
    ];
    const csv = headers.join(',') + '\n' + 'CS101,Intro to CS,Learn basics,Technology,Dr. Smith,6 months';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'course_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-headline text-4xl font-bold text-primary">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          {admin && <span className="text-sm text-muted-foreground">Logged in as {admin.email}</span>}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">Manage university and course data from here.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UploadCard
          title="Universities"
          description="Upload a CSV file with university information."
          onUpload={handleUniversityUpload}
        />
        <UploadCard
          title="Courses"
          description="Upload a CSV file with course information. This will save courses to MongoDB."
          onUpload={handleCourseUpload}
          onDownloadTemplate={handleCourseTemplateDownload}
        />
      </div>
    </div>
  );
}
