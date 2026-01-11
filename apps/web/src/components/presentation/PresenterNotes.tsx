import React, { useState } from 'react';
import { MessageCircle, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SlideData } from './types';

interface PresenterNotesProps {
  slide: SlideData;
  notes: string;
  onSaveNotes: (slideId: string, notes: string) => void;
  onClose?: () => void;
}

export const PresenterNotes: React.FC<PresenterNotesProps> = ({
  slide,
  notes: initialNotes,
  onSaveNotes,
  onClose
}) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveNotes(slide.id, notes);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving presenter notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
          Presenter Notes: {slide.content.title || 'Untitled Slide'}
        </h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for the presenter here..."
          className="min-h-[150px] resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          These notes will be visible only to the presenter during the presentation.
        </p>
      </div>

      <div className="flex items-center justify-end space-x-2">
        {onClose && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="flex items-center"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save Notes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}; 