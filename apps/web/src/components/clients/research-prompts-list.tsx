"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Clock, Copy, ExternalLink, Trash2, Tag as TagIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { ResearchPromptData } from "@/types/research";
import { AIResearchModal } from "@/components/clients/ai-research-modal";
import { BrainCircuit } from "lucide-react";

interface ResearchPromptsListProps {
  prompts: ResearchPromptData[];
  onDelete?: (promptId: string) => void;
  onCopy?: (prompt: string) => void;
  onUse?: (promptData: ResearchPromptData) => void;
  clientName: string;
  clientId: string;
  onRefresh?: () => void;
}

export function ResearchPromptsList({
  prompts,
  onDelete,
  onCopy,
  onUse,
  clientName,
  clientId,
  onRefresh
}: ResearchPromptsListProps) {
  // Add state for tag filtering
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [tagFilterInput, setTagFilterInput] = useState("");
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<ResearchPromptData | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  
  // Function to copy a prompt to clipboard
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    if (onCopy) {
      onCopy(prompt);
    }
  };
  
  // Function to get category label
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      financial: "Financial Analysis",
      market: "Market Position", 
      esg: "ESG & Sustainability",
      risk: "Risk Assessment",
      innovation: "Innovation & Technology",
      leadership: "Leadership & Management",
      custom: "Custom Research"
    };
    
    return categories[category] || "Research";
  };
  
  // Get prompt parameter summary
  const getParameterSummary = (parameters: ResearchPromptData["parameters"]) => {
    return [
      `${parameters.depth.charAt(0).toUpperCase() + parameters.depth.slice(1)} depth`,
      `${parameters.tone.charAt(0).toUpperCase() + parameters.tone.slice(1)} tone`,
      `${parameters.format.charAt(0).toUpperCase() + parameters.format.slice(1)} format`,
    ];
  };
  
  // Sort prompts by timestamp, newest first
  const sortedPrompts = [...prompts].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  // Get all unique tags from prompts
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    prompts.forEach(prompt => {
      if (prompt.tags && Array.isArray(prompt.tags)) {
        prompt.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  };
  
  // Filter prompts by tag
  const filteredPrompts = sortedPrompts
    .filter(prompt => {
      // Filter by tag if active
      if (activeTagFilter) {
        return prompt.tags && Array.isArray(prompt.tags) && prompt.tags.includes(activeTagFilter);
      }
      // Filter by templates only if active
      if (showTemplatesOnly) {
        return prompt.tags && Array.isArray(prompt.tags) && prompt.tags.includes("template");
      }
      return true;
    });
  
  // Function to handle tag input for filtering
  const handleTagFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagFilterInput(e.target.value);
  };
  
  // Function to apply tag filter
  const applyTagFilter = (tag: string) => {
    setActiveTagFilter(tag);
    setTagFilterInput("");
    setShowTagFilter(false);
  };
  
  // Function to clear tag filter
  const clearTagFilter = () => {
    setActiveTagFilter(null);
  };
  
  // Get filtered tags based on input
  const filteredTags = getAllTags().filter(tag => 
    tag.toLowerCase().includes(tagFilterInput.toLowerCase())
  );
  
  // Add function to open AI modal
  const openAIModal = (prompt: ResearchPromptData) => {
    setSelectedPrompt(prompt);
    setAiModalOpen(true);
  };
  
  // Add function to handle AI completion
  const handleAIComplete = async (result: string, promptId?: string) => {
    // Call the onRefresh prop if provided
    if (onRefresh) {
      onRefresh();
    }
    console.log("AI research completed with result length:", result.length);
  };
  
  if (sortedPrompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#f8f9fa]/50 dark:bg-[#1a1a1a]/30 rounded-md border border-[#e0e0e5]/50 dark:border-[#222222]">
        <Sparkles className="h-10 w-10 text-[#4b5563] mb-4" />
        <h3 className="text-lg font-medium text-[#111111] dark:text-[#f2f2f2] mb-2">No Research Prompts</h3>
        <p className="text-[#4b5563] dark:text-[#9ca3af] max-w-md">
          Generate your first research prompt to gather more data about this client.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Tag filter controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {activeTagFilter && (
            <div className="flex items-center bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB] py-1 px-2 rounded-md text-xs mr-2">
              <TagIcon className="h-3 w-3 mr-1" />
              {activeTagFilter}
              <button
                onClick={clearTagFilter}
                className="ml-1 hover:bg-[#0F1C3F]/20 dark:hover:bg-[#D1D5DB]/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`flex items-center text-xs py-1 px-2 rounded-md ${
              showTagFilter 
                ? "bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB]" 
                : "bg-[#f8f9fa] text-[#4b5563] dark:bg-[#1a1a1a] dark:text-[#9ca3af]"
            }`}
          >
            <Filter className="h-3 w-3 mr-1" />
            Filter by tag
          </button>
          
          <button
            onClick={() => {
              setShowTemplatesOnly(!showTemplatesOnly);
              setActiveTagFilter(null);
            }}
            className={`flex items-center text-xs py-1 px-2 rounded-md ${
              showTemplatesOnly 
                ? "bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB]" 
                : "bg-[#f8f9fa] text-[#4b5563] dark:bg-[#1a1a1a] dark:text-[#9ca3af]"
            }`}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Templates only
          </button>
        </div>
        
        <div className="text-xs text-[#4b5563] dark:text-[#9ca3af]">
          {filteredPrompts.length} {filteredPrompts.length === 1 ? "prompt" : "prompts"}
        </div>
      </div>
      
      {/* Tag filter dropdown */}
      {showTagFilter && (
        <div className="bg-white dark:bg-[#161616] rounded-md shadow-md border border-[#e0e0e5]/50 dark:border-[#222222] p-3 mb-4">
          <div className="mb-2">
            <Input
              value={tagFilterInput}
              onChange={handleTagFilterChange}
              placeholder="Search tags..."
              className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616] text-sm h-8"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto py-1">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => applyTagFilter(tag)}
                  className={`flex items-center py-1 px-2 rounded-md text-xs ${
                    activeTagFilter === tag
                      ? "bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] text-white dark:from-[#D1D5DB] dark:to-[#9ca3af] dark:text-[#111111]"
                      : "bg-[#f8f9fa] text-[#111111] dark:bg-[#1a1a1a] dark:text-[#f2f2f2] hover:bg-[#f1f5f9] dark:hover:bg-[#222222]"
                  }`}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </button>
              ))
            ) : (
              <div className="text-xs text-[#4b5563] dark:text-[#9ca3af] py-1 px-2">
                No matching tags found
              </div>
            )}
          </div>
        </div>
      )}
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {filteredPrompts.map((prompt) => (
            <Card 
              key={prompt.id || prompt.title} 
              className={`bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border ${
                prompt.tags?.includes("template") 
                  ? "border-[#0F1C3F]/30 dark:border-[#D1D5DB]/30" 
                  : "border-[#e0e0e5]/50 dark:border-[#222222]"
              } rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB]">
                        {getCategoryLabel(prompt.category)}
                      </Badge>
                      
                      {prompt.tags?.includes("template") && (
                        <Badge className="bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB]">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Template
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-medium text-[#111111] dark:text-[#f2f2f2]">{prompt.title}</CardTitle>
                  </div>
                  <div className="flex items-center text-xs text-[#4b5563] dark:text-[#9ca3af] space-x-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{format(new Date(prompt.timestamp), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <CardDescription className="text-[#4b5563] dark:text-[#9ca3af]">
                  {getParameterSummary(prompt.parameters).join(" • ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] p-3 rounded-md max-h-32 overflow-hidden relative">
                  <p className="text-sm text-[#111111] dark:text-[#f2f2f2] line-clamp-3">
                    {prompt.prompt}
                  </p>
                  {prompt.prompt.length > 200 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f8f9fa] dark:from-[#1a1a1a] to-transparent"></div>
                  )}
                </div>
                
                {/* Display tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {prompt.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => applyTagFilter(tag)}
                        className="flex items-center bg-[#f8f9fa] dark:bg-[#1a1a1a] text-[#4b5563] dark:text-[#9ca3af] py-0.5 px-2 rounded-md text-xs hover:bg-[#f1f5f9] dark:hover:bg-[#222222]"
                      >
                        <TagIcon className="h-2.5 w-2.5 mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex space-x-1">
                  {prompt.parameters.includeCompetitors && (
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-[#f8f9fa] dark:bg-[#1a1a1a] border-[#e0e0e5]/50 dark:border-[#222222]">
                      Competitors
                    </Badge>
                  )}
                  {prompt.parameters.includeMarketTrends && (
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-[#f8f9fa] dark:bg-[#1a1a1a] border-[#e0e0e5]/50 dark:border-[#222222]">
                      Trends
                    </Badge>
                  )}
                  {prompt.parameters.includeCaseStudies && (
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-[#f8f9fa] dark:bg-[#1a1a1a] border-[#e0e0e5]/50 dark:border-[#222222]">
                      Case Studies
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyPrompt(prompt.prompt)}
                    className="h-8 px-2 text-[#0F1C3F] dark:text-[#D1D5DB] hover:bg-[#0F1C3F]/10 dark:hover:bg-[#D1D5DB]/10"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                  {onUse && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onUse(prompt)}
                      className="h-8 px-2 text-[#0F1C3F] dark:text-[#D1D5DB] hover:bg-[#0F1C3F]/10 dark:hover:bg-[#D1D5DB]/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Use
                    </Button>
                  )}
                  {onDelete && prompt.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(prompt.id as string)}
                      className="h-8 px-2 text-[#9f1239] dark:text-[#f43f5e] hover:bg-[#9f1239]/10 dark:hover:bg-[#f43f5e]/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openAIModal(prompt)}
                    className="h-8 px-2 text-[#0F1C3F] dark:text-[#D1D5DB] hover:bg-[#0F1C3F]/10 dark:hover:bg-[#D1D5DB]/10"
                  >
                    <BrainCircuit className="h-3.5 w-3.5 mr-1" />
                    Use AI
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
      {selectedPrompt && (
        <AIResearchModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          prompt={selectedPrompt}
          clientName={clientName}
          clientId={clientId}
          onAIComplete={(result) => handleAIComplete(result, selectedPrompt.id)}
        />
      )}
    </div>
  );
} 