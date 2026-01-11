"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Copy, Download, Sparkles, Wand2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResearchPromptData } from "@/types/research";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface AIResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: ResearchPromptData;
  clientName: string;
  clientId: string;
  onAIComplete?: (result: string) => void;
}

export function AIResearchModal({
  isOpen,
  onClose,
  prompt,
  clientName,
  clientId,
  onAIComplete
}: AIResearchModalProps) {
  const [result, setResult] = useState<string | null>(prompt.aiResponse || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const processPrompt = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Process the prompt by replacing company name
      const processedPrompt = prompt.prompt.replace(/\[COMPANY\]/g, clientName);
      
      const response = await fetch("/api/ai/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: prompt.id,
          prompt: processedPrompt,
          clientId,
          clientName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      setResult(data.result);
      
      if (onAIComplete) {
        onAIComplete(data.result);
      }
      
    } catch (err) {
      console.error("Error processing AI research:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };
  
  const downloadAsPDF = () => {
    // This is a placeholder for PDF download functionality
    // In a real implementation, you would use a library like jsPDF
    alert("PDF download functionality would be implemented here");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl overflow-hidden bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-[#e0e0e5]/50 dark:border-[#222222] rounded-md shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[#111111] dark:text-[#f2f2f2] flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-[#0F1C3F] dark:text-[#D1D5DB]" /> 
            AI Research Results
          </DialogTitle>
          <DialogDescription className="text-[#4b5563] dark:text-[#9ca3af]">
            {result ? "Results generated for" : "Generate AI research for"} {clientName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-[#0F1C3F]/20 border-t-[#0F1C3F] animate-spin dark:border-[#D1D5DB]/20 dark:border-t-[#D1D5DB]"></div>
                <Wand2 className="h-8 w-8 text-[#0F1C3F] dark:text-[#D1D5DB] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-6 text-[#111111] dark:text-[#f2f2f2] font-medium">Processing your research...</p>
              <p className="text-sm text-[#4b5563] dark:text-[#9ca3af] mt-2">
                Analyzing data for {clientName} based on your prompt
              </p>
            </div>
          ) : error ? (
            <div className="bg-[#fef2f2] dark:bg-[#1f1315] text-[#b91c1c] dark:text-[#f87171] p-4 rounded-md">
              <p className="font-medium">Error processing research</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#4b5563] dark:text-[#9ca3af]">
                  {prompt.lastProcessedAt && `Generated: ${format(new Date(prompt.lastProcessedAt), "MMM d, yyyy, h:mm a")}`}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={copyToClipboard}
                    className="border-[#e0e0e5]/50 dark:border-[#222222] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a]"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={downloadAsPDF}
                    className="border-[#e0e0e5]/50 dark:border-[#222222] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a]"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[500px] overflow-y-auto pr-4">
                <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#e0e0e5]/50 dark:border-[#222222] rounded-md p-6">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-10 w-10 text-[#0F1C3F]/70 dark:text-[#D1D5DB]/70 mb-4" />
              <h3 className="text-lg font-medium text-[#111111] dark:text-[#f2f2f2] mb-1">Ready to generate research</h3>
              <p className="text-[#4b5563] dark:text-[#9ca3af] max-w-md mb-6">
                Click the "Generate AI Research" button to process this prompt using AI.
              </p>
              <p className="bg-[#f8f9fa] dark:bg-[#1a1a1a] p-4 rounded-md text-sm text-[#111111] dark:text-[#f2f2f2] max-w-lg text-left">
                <span className="font-medium">Prompt:</span> {prompt.prompt.replace(/\[COMPANY\]/g, clientName)}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {!result && !isLoading ? (
            <Button 
              onClick={processPrompt} 
              disabled={isLoading}
              className="bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] hover:opacity-90 text-white shadow-sm transition-colors rounded-md"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Research
            </Button>
          ) : error ? (
            <Button 
              onClick={processPrompt} 
              disabled={isLoading}
              className="bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] hover:opacity-90 text-white shadow-sm transition-colors rounded-md"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Retry
            </Button>
          ) : (
            <Button 
              onClick={onClose}
              className="bg-[#f8f9fa] hover:bg-[#f1f5f9] text-[#111111] dark:bg-[#1a1a1a] dark:hover:bg-[#222222] dark:text-[#f2f2f2] shadow-sm transition-colors rounded-md border border-[#e0e0e5]/50 dark:border-[#222222]"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 