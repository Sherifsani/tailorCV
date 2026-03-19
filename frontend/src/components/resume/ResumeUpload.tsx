import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  onUploaded: () => void;
}

export default function ResumeUpload({ onUploaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Parsing PDF...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop PDF here' : 'Upload Resume'}
            </p>
            <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-destructive text-xs mt-2">{error}</p>}
    </div>
  );
}
