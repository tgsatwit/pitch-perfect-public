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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles, Copy, Download, X, Plus, Tag as TagIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ResearchPromptData } from "@/types/research";

// Define the props for the ResearchPrompt component
interface ResearchPromptGeneratorProps {
  clientName: string;
  clientWebsite?: string;
  clientIndustry?: string;
  existingResearch?: any;
  onPromptGenerated?: (prompt: string) => void;
  onPromptSaved?: (promptData: ResearchPromptData) => void;
}

export function ResearchPromptGenerator({
  clientName,
  clientWebsite = "",
  clientIndustry = "",
  existingResearch = null,
  onPromptGenerated,
  onPromptSaved,
}: ResearchPromptGeneratorProps) {
  const [promptCategory, setPromptCategory] = useState("financial");
  const [promptTitle, setPromptTitle] = useState("");
  const [customFocus, setCustomFocus] = useState("");
  const [depth, setDepth] = useState<"basic" | "standard" | "deep">("standard");
  const [tone, setTone] = useState<"formal" | "conversational" | "technical">("formal");
  const [format, setFormat] = useState<"bullet" | "paragraph" | "narrative">("paragraph");
  const [timeframe, setTimeframe] = useState<"recent" | "historical" | "future">("recent");
  
  const [includeCompetitors, setIncludeCompetitors] = useState(true);
  const [includeMarketTrends, setIncludeMarketTrends] = useState(true);
  const [includeCaseStudies, setIncludeCaseStudies] = useState(false);
  
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [open, setOpen] = useState(false);
  
  // Add state for tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Function to generate the research prompt based on parameters
  const generatePrompt = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this could call an AI service
      // For now, we'll use template strings to construct the prompt
      
      const depthDescriptions = {
        basic: "high-level overview",
        standard: "comprehensive analysis",
        deep: "in-depth investigation"
      };
      
      const toneDescriptions = {
        formal: "using professional language",
        conversational: "in a conversational tone",
        technical: "with technical terminology"
      };
      
      const formatDescriptions = {
        bullet: "in a bulleted list format",
        paragraph: "in well-structured paragraphs",
        narrative: "as a narrative report"
      };
      
      const timeframeDescriptions = {
        recent: "focusing on recent developments (past 1-2 years)",
        historical: "including historical context and evolution",
        future: "with forward-looking projections and predictions"
      };
      
      // Category-specific content
      let categoryContent = "";
      
      switch (promptCategory) {
        case "financial":
          categoryContent = `financial performance, key financial metrics, revenue streams, profitability, and investment outlook`;
          break;
        case "market":
          categoryContent = `market position, market share, growth potential, and competitive landscape`;
          break;
        case "esg":
          categoryContent = `environmental initiatives, social responsibility programs, governance structure, and ESG ratings`;
          break;
        case "risk":
          categoryContent = `risk exposure, mitigation strategies, regulatory challenges, and compliance status`;
          break;
        case "innovation":
          categoryContent = `technological innovation, R&D investments, patents, and digital transformation initiatives`;
          break;
        case "leadership":
          categoryContent = `leadership team, executive experience, management style, and decision-making processes`;
          break;
        case "custom":
          categoryContent = customFocus;
          break;
      }
      
      // Optional sections
      const competitorsSection = includeCompetitors 
        ? `\n\nInclude a comparative analysis against key competitors in the industry.` 
        : "";
        
      const marketTrendsSection = includeMarketTrends 
        ? `\n\nAnalyze relevant market trends and how they impact ${clientName}.` 
        : "";
        
      const caseStudiesSection = includeCaseStudies 
        ? `\n\nProvide specific case studies or examples to illustrate key points.` 
        : "";
      
      // Additional context if we have it
      const industryContext = clientIndustry 
        ? `\n\nIndustry context: ${clientName} operates in the ${clientIndustry} industry.` 
        : "";
        
      const websiteContext = clientWebsite 
        ? `\n\nCompany website: ${clientWebsite}` 
        : "";
      
      // Build the full prompt
      const prompt = `Provide a ${depthDescriptions[depth]} of ${clientName}'s ${categoryContent}, ${toneDescriptions[tone]} and ${formatDescriptions[format]}, ${timeframeDescriptions[timeframe]}.${competitorsSection}${marketTrendsSection}${caseStudiesSection}${industryContext}${websiteContext}`;
      
      // Set a small delay to simulate AI processing
      setTimeout(() => {
        setGeneratedPrompt(prompt);
        setIsGenerating(false);
        if (onPromptGenerated) {
          onPromptGenerated(prompt);
        }
        setActiveTab("result");
      }, 1500);
      
    } catch (error) {
      console.error("Error generating prompt:", error);
      setIsGenerating(false);
    }
  };
  
  // Function to add a tag
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // Function to remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Function to handle tag input keydown (add tag on Enter)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Function to save the prompt
  const savePrompt = () => {
    if (!promptTitle.trim()) {
      alert("Please provide a title for your prompt");
      return;
    }
    
    const promptData: ResearchPromptData = {
      title: promptTitle,
      prompt: generatedPrompt,
      category: promptCategory,
      parameters: {
        depth,
        tone,
        format,
        timeframe,
        includeCompetitors,
        includeMarketTrends,
        includeCaseStudies,
        customFocus: promptCategory === "custom" ? customFocus : undefined
      },
      timestamp: new Date(),
      tags: tags,
    };
    
    if (onPromptSaved) {
      onPromptSaved(promptData);
    }
    
    setOpen(false);
  };
  
  // Function to copy the prompt to clipboard
  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-[#e0e0e5]/50 dark:border-[#222222] text-[#0F1C3F] dark:text-[#D1D5DB] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a] shadow-sm transition-colors rounded-md"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Research Prompt
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-3xl overflow-hidden bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-[#e0e0e5]/50 dark:border-[#222222] rounded-md shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[#111111] dark:text-[#f2f2f2]">Research Prompt Generator</DialogTitle>
          <DialogDescription className="text-[#4b5563] dark:text-[#9ca3af]">
            Create tailored research prompts for {clientName}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-[#f8f9fa] dark:bg-[#1a1a1a] p-1 rounded-md">
            <TabsTrigger value="builder" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-[#161616] data-[state=active]:text-[#0F1C3F] dark:data-[state=active]:text-[#D1D5DB]">
              Prompt Builder
            </TabsTrigger>
            <TabsTrigger value="result" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-[#161616] data-[state=active]:text-[#0F1C3F] dark:data-[state=active]:text-[#D1D5DB]" disabled={!generatedPrompt && !isGenerating}>
              Generated Prompt
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="py-4 space-y-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-title" className="text-[#111111] dark:text-[#f2f2f2]">Prompt Title</Label>
                  <Input 
                    id="prompt-title" 
                    placeholder="E.g., Financial Analysis 2023" 
                    value={promptTitle} 
                    onChange={(e) => setPromptTitle(e.target.value)} 
                    className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt-category" className="text-[#111111] dark:text-[#f2f2f2]">Research Category</Label>
                  <Select value={promptCategory} onValueChange={(value) => setPromptCategory(value)}>
                    <SelectTrigger className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#161616]">
                      <SelectItem value="financial">Financial Analysis</SelectItem>
                      <SelectItem value="market">Market Position</SelectItem>
                      <SelectItem value="esg">ESG & Sustainability</SelectItem>
                      <SelectItem value="risk">Risk Assessment</SelectItem>
                      <SelectItem value="innovation">Innovation & Technology</SelectItem>
                      <SelectItem value="leadership">Leadership & Management</SelectItem>
                      <SelectItem value="custom">Custom Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {promptCategory === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-focus" className="text-[#111111] dark:text-[#f2f2f2]">Custom Research Focus</Label>
                  <Textarea 
                    id="custom-focus" 
                    placeholder="Describe your custom research focus..." 
                    value={customFocus} 
                    onChange={(e) => setCustomFocus(e.target.value)} 
                    className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="research-depth" className="text-[#111111] dark:text-[#f2f2f2]">Research Depth</Label>
                  <Select value={depth} onValueChange={(value: "basic" | "standard" | "deep") => setDepth(value)}>
                    <SelectTrigger id="research-depth" className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]">
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#161616]">
                      <SelectItem value="basic">Basic Overview</SelectItem>
                      <SelectItem value="standard">Standard Analysis</SelectItem>
                      <SelectItem value="deep">Deep Investigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt-tone" className="text-[#111111] dark:text-[#f2f2f2]">Tone</Label>
                  <Select value={tone} onValueChange={(value: "formal" | "conversational" | "technical") => setTone(value)}>
                    <SelectTrigger id="prompt-tone" className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#161616]">
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="output-format" className="text-[#111111] dark:text-[#f2f2f2]">Output Format</Label>
                  <Select value={format} onValueChange={(value: "bullet" | "paragraph" | "narrative") => setFormat(value)}>
                    <SelectTrigger id="output-format" className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#161616]">
                      <SelectItem value="bullet">Bullet Points</SelectItem>
                      <SelectItem value="paragraph">Paragraphs</SelectItem>
                      <SelectItem value="narrative">Narrative Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-frame" className="text-[#111111] dark:text-[#f2f2f2]">Time Frame</Label>
                  <Select value={timeframe} onValueChange={(value: "recent" | "historical" | "future") => setTimeframe(value)}>
                    <SelectTrigger id="time-frame" className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616]">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#161616]">
                      <SelectItem value="recent">Recent (1-2 years)</SelectItem>
                      <SelectItem value="historical">Historical Context</SelectItem>
                      <SelectItem value="future">Future Outlook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3 bg-[#f8f9fa] dark:bg-[#1a1a1a] p-4 rounded-md">
                <h3 className="font-medium text-sm text-[#111111] dark:text-[#f2f2f2]">Additional Research Components</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-competitors"
                    checked={includeCompetitors}
                    onCheckedChange={setIncludeCompetitors}
                    className="data-[state=checked]:bg-[#0F1C3F]"
                  />
                  <Label htmlFor="include-competitors" className="text-[#111111] dark:text-[#f2f2f2]">Competitor Analysis</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-market-trends"
                    checked={includeMarketTrends}
                    onCheckedChange={setIncludeMarketTrends}
                    className="data-[state=checked]:bg-[#0F1C3F]"
                  />
                  <Label htmlFor="include-market-trends" className="text-[#111111] dark:text-[#f2f2f2]">Market Trends</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-case-studies"
                    checked={includeCaseStudies}
                    onCheckedChange={setIncludeCaseStudies}
                    className="data-[state=checked]:bg-[#0F1C3F]"
                  />
                  <Label htmlFor="include-case-studies" className="text-[#111111] dark:text-[#f2f2f2]">Include Case Studies/Examples</Label>
                </div>
              </div>
              
              {/* Tag input section */}
              <div className="space-y-3 bg-[#f8f9fa] dark:bg-[#1a1a1a] p-4 rounded-md">
                <h3 className="font-medium text-sm text-[#111111] dark:text-[#f2f2f2]">Tags</h3>
                <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] mb-2">Add tags to categorize this prompt</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map(tag => (
                    <div 
                      key={tag}
                      className="flex items-center bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB] py-1 px-2 rounded-md text-xs"
                    >
                      <TagIcon className="h-3 w-3 mr-1.5" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 hover:bg-[#0F1C3F]/20 dark:hover:bg-[#D1D5DB]/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex">
                  <Input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag..."
                    className="border-[#e0e0e5]/50 dark:border-[#222222] bg-white dark:bg-[#161616] text-sm rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button 
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="rounded-l-none bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] hover:opacity-90 text-white border-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="result" className="py-4 space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0F1C3F] dark:text-[#D1D5DB]" />
                <p className="mt-4 text-[#111111] dark:text-[#f2f2f2]">Generating your research prompt...</p>
              </div>
            ) : generatedPrompt ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-[#0F1C3F]/10 text-[#0F1C3F] dark:bg-[#D1D5DB]/10 dark:text-[#D1D5DB]">
                      {promptCategory === "custom" ? "Custom Research" : {
                        financial: "Financial Analysis",
                        market: "Market Position", 
                        esg: "ESG & Sustainability",
                        risk: "Risk Assessment",
                        innovation: "Innovation & Technology",
                        leadership: "Leadership & Management"
                      }[promptCategory]}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={copyPrompt}
                        className="border-[#e0e0e5]/50 dark:border-[#222222] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a]"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  {/* Display tags if any */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <div 
                          key={tag}
                          className="flex items-center bg-[#f8f9fa] dark:bg-[#1a1a1a] text-[#4b5563] dark:text-[#9ca3af] py-0.5 px-2 rounded-md text-xs"
                        >
                          <TagIcon className="h-2.5 w-2.5 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Card className="p-4 bg-[#f8f9fa] dark:bg-[#1a1a1a] border-[#e0e0e5]/50 dark:border-[#222222] rounded-md">
                  <p className="whitespace-pre-wrap text-[#111111] dark:text-[#f2f2f2]">{generatedPrompt}</p>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-[#4b5563] dark:text-[#9ca3af]">Configure your prompt parameters and click "Generate Prompt" to see the result.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {activeTab === "builder" ? (
            <Button 
              onClick={generatePrompt} 
              disabled={isGenerating || (promptCategory === "custom" && !customFocus)}
              className="bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] hover:opacity-90 text-white shadow-sm transition-colors rounded-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Prompt
                </>
              )}
            </Button>
          ) : generatedPrompt ? (
            <Button 
              onClick={savePrompt}
              className="bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] hover:opacity-90 text-white shadow-sm transition-colors rounded-md"
              disabled={!promptTitle.trim()}
            >
              Save Prompt
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 