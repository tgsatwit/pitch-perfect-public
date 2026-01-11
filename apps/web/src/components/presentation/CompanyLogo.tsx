import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Upload } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface CompanyLogoProps {
  onLogoSelected: (logoUrl: string) => void;
  companyName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  onLogoSelected, 
  companyName = 'Company',
  size = 'md'
}) => {
  const [uploading, setUploading] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [inputMode, setInputMode] = useState<'default' | 'url'>('default');
  
  // Sample company logos for quick selection
  const sampleLogos = [
    { name: 'Bank of America', url: 'https://logo.clearbit.com/bankofamerica.com' },
    { name: 'JP Morgan', url: 'https://logo.clearbit.com/jpmorgan.com' },
    { name: 'Wells Fargo', url: 'https://logo.clearbit.com/wellsfargo.com' },
    { name: 'Citi', url: 'https://logo.clearbit.com/citigroup.com' },
    { name: 'Goldman Sachs', url: 'https://logo.clearbit.com/goldmansachs.com' }
  ];
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploading(true);
      
      try {
        const storage = getStorage();
        const fileId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const filePath = `company-logos/${fileId}.${fileExtension}`;
        const storageRef = ref(storage, filePath);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        // Pass the URL back to the parent component
        onLogoSelected(downloadUrl);
      } catch (error) {
        console.error('Error uploading company logo:', error);
      } finally {
        setUploading(false);
      }
    }
  };
  
  const handleUrlSubmit = () => {
    if (customLogoUrl.trim()) {
      onLogoSelected(customLogoUrl);
      setInputMode('default');
      setCustomLogoUrl('');
    }
  };
  
  return (
    <div className="company-logo">
      <div className="grid grid-cols-3 gap-2 mb-2">
        {sampleLogos.map((logo) => (
          <button
            key={logo.name}
            className="p-2 border rounded-md flex flex-col items-center justify-center gap-1 hover:border-indigo-500 transition-colors"
            onClick={() => onLogoSelected(logo.url)}
          >
            <img 
              src={logo.url} 
              alt={`${logo.name} logo`} 
              className="w-10 h-10 object-contain" 
            />
            <span className="text-xs text-center text-slate-600 truncate w-full">
              {logo.name}
            </span>
          </button>
        ))}
        
        <button
          className="p-2 border rounded-md flex flex-col items-center justify-center gap-1 hover:border-indigo-500 transition-colors"
          onClick={() => setInputMode('url')}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-500">+</span>
          </div>
          <span className="text-xs text-center text-slate-600">
            Custom URL
          </span>
        </button>
      </div>
      
      {inputMode === 'url' && (
        <div className="flex gap-2 mt-2">
          <Input
            value={customLogoUrl}
            onChange={(e) => setCustomLogoUrl(e.target.value)}
            placeholder="Enter logo URL"
            className="text-xs flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleUrlSubmit}
            className="px-2"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          id="company-logo-upload"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('company-logo-upload')?.click()}
          disabled={uploading}
          className="w-full text-xs"
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? 'Uploading...' : 'Upload Logo'}
        </Button>
      </div>
    </div>
  );
}; 