import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected file
  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload the image to Firebase Storage
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const fileId = uuidv4();
      const fileExtension = selectedFile.name.split('.').pop();
      const filePath = `presentation-images/${fileId}.${fileExtension}`;
      const storageRef = ref(storage, filePath);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, selectedFile);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      // Pass the URL back to the parent component
      onImageUploaded(downloadUrl);
      
      // Clear the selection after successful upload
      handleClearSelection();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`image-upload-container ${className}`}>
      {!previewUrl ? (
        // Upload UI when no image is selected
        <div className="flex flex-col items-center border-2 border-dashed border-slate-200 rounded-md p-6 transition-colors hover:border-slate-300">
          <ImageIcon className="h-10 w-10 text-slate-400 mb-3" />
          <p className="text-sm text-slate-600 mb-2">Select an image to add to your slide</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="slide-image-upload"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
        </div>
      ) : (
        // Preview UI when image is selected
        <div className="flex flex-col border rounded-md overflow-hidden">
          <div className="relative bg-slate-50 p-2">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-48 max-w-full mx-auto object-contain rounded"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white"
              onClick={handleClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 border-t bg-white flex justify-between items-center">
            <div className="text-xs text-slate-500 truncate max-w-[150px]">
              {selectedFile?.name}
            </div>
            <Button 
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="ml-2"
            >
              {uploading ? 'Uploading...' : 'Add to Slide'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 