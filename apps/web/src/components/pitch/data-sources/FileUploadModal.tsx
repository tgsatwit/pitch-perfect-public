"use client";

import React, { ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUp } from "lucide-react";

interface FileUploadModalProps {
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  filesToUpload: FileList | null;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  handleFileChange, 
  filesToUpload 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload RFPs, proposals, or other relevant files for your pitch.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <label 
            htmlFor="additional-docs-modal" 
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-indigo-400 transition-colors duration-200"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-10 h-10 mb-2 text-indigo-500" />
              <p className="text-sm text-slate-500">
                <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">Upload relevant documents (RFPs, past proposals, etc.)</p>
            </div>
            <Input type="file" id="additional-docs-modal" name="additionalDocs" multiple className="hidden" onChange={handleFileChange} />
          </label>
          {filesToUpload && filesToUpload.length > 0 && (
            <div className="text-sm text-slate-600">
              <div className="font-medium mb-1">Selected files:</div>
              <ul className="list-disc pl-5 space-y-1">
                {Array.from(filesToUpload).map((file, index) => (
                  <li key={index} className="text-xs">{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};