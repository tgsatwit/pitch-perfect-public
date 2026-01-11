import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlideData } from './types';
import { SlideTemplates, TemplateOptions } from './SlideTemplates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: SlideData) => void;
  clientName?: string;
  bankName?: string;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  onTemplateSelect,
  clientName = '',
  bankName = ''
}) => {
  const [localClientName, setLocalClientName] = useState(clientName);
  const [localBankName, setLocalBankName] = useState(bankName);

  const handleTemplateSelect = (template: SlideData) => {
    onTemplateSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select a Banking Slide Template</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              value={localClientName}
              onChange={(e) => setLocalClientName(e.target.value)}
              placeholder="Enter client name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input
              id="bank-name"
              value={localBankName}
              onChange={(e) => setLocalBankName(e.target.value)}
              placeholder="Enter bank name"
              className="mt-1"
            />
          </div>
        </div>
        
        <SlideTemplates 
          onSelectTemplate={handleTemplateSelect}
          clientName={localClientName || 'Your Client'}
          bankName={localBankName || 'Your Bank'}
        />
      </DialogContent>
    </Dialog>
  );
};

interface TemplateSelectorProps {
  onTemplateSelect: (template: SlideData) => void;
  clientName?: string;
  bankName?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  clientName,
  bankName
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <span>Banking Templates</span>
      </Button>
      
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTemplateSelect={onTemplateSelect}
        clientName={clientName}
        bankName={bankName}
      />
    </>
  );
}; 