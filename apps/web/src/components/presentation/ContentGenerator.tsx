import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, RotateCcw, CheckCircle2, FileText, Table, BarChart3 } from "lucide-react";
import { BankingAIService } from "./services/BankingAIService";
import { SlideType } from "./types";
import { PitchContext } from "@/app/pitches/types";
import { toast } from "@/hooks/use-toast";

interface ContentGeneratorProps {
  streamMessage: (params: any) => Promise<any>;
  threadId: string | null;
  onContentGenerated: (contentType: string, content: any) => void;
  pitchContext?: PitchContext;
  slideType: SlideType | string;
}

export function ContentGenerator({
  streamMessage,
  threadId,
  onContentGenerated,
  pitchContext,
  slideType
}: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("bulletPoints");
  const [audience, setAudience] = useState<"executive" | "technical" | "boardOfDirectors">("executive");
  const [bankingContext, setBankingContext] = useState<"retailBanking" | "commercialBanking" | "wealthManagement" | "investmentBanking">("commercialBanking");
  const [generationContext, setGenerationContext] = useState<Record<string, string>>({});
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("bar");
  const [comparisonSubject, setComparisonSubject] = useState("Banking Solutions");
  
  // Initialize BankingAIService
  const bankingAIService = new BankingAIService(streamMessage, threadId);
  
  const updateContext = (key: string, value: string) => {
    setGenerationContext(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const getSlideTypeIcon = () => {
    switch (slideType) {
      case 'title':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'table':
        return <Table className="h-5 w-5 text-indigo-500" />;
      case 'chart':
        return <BarChart3 className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-indigo-500" />;
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      let generatedContent;
      
      switch (activeTab) {
        case "bulletPoints":
          generatedContent = await bankingAIService.generateBulletPoints(
            slideType, 
            generationContext,
            pitchContext
          );
          break;
          
        case "chartData":
          generatedContent = await bankingAIService.generateChartData(
            chartType,
            generationContext,
            pitchContext
          );
          break;
          
        case "tableData":
          generatedContent = await bankingAIService.generateTableData(
            comparisonSubject,
            generationContext,
            pitchContext
          );
          break;
          
        default:
          // Generate generic slide content
          const result = await bankingAIService.generateSlideContent({
            slideType,
            elementType: activeTab as any,
            audience,
            bankingContext,
            context: generationContext,
            pitchContext
          });
          generatedContent = result.content;
      }
      
      // Pass the generated content to parent
      onContentGenerated(activeTab, generatedContent);
      
      toast({
        title: "Content Generated",
        description: "AI-generated content is ready to use.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Determine available tabs based on slide type
  const getAvailableTabs = () => {
    const commonTabs = [
      { id: "bulletPoints", label: "Bullet Points", icon: <FileText className="h-4 w-4" /> }
    ];
    
    if (slideType === 'chart') {
      commonTabs.push({ 
        id: "chartData", 
        label: "Chart Data", 
        icon: <BarChart3 className="h-4 w-4" /> 
      });
    }
    
    if (slideType === 'table') {
      commonTabs.push({ 
        id: "tableData", 
        label: "Table Data", 
        icon: <Table className="h-4 w-4" /> 
      });
    }
    
    // All slides can have generic content too
    commonTabs.push({ 
      id: "genericContent", 
      label: "General Content", 
      icon: <FileText className="h-4 w-4" /> 
    });
    
    return commonTabs;
  };
  
  const availableTabs = getAvailableTabs();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          {getSlideTypeIcon()}
          <div className="ml-2">
            <CardTitle className="text-lg">Generate Content</CardTitle>
            <CardDescription>AI-powered content for {slideType} slides</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="bulletPoints">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Focus Area</label>
                <Input 
                  placeholder="What should the bullets focus on?" 
                  value={generationContext.focus || ''}
                  onChange={(e) => updateContext('focus', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Target Audience</label>
                <Select 
                  value={audience} 
                  onValueChange={(value) => setAudience(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">C-Suite Executives</SelectItem>
                    <SelectItem value="technical">Technical Decision Makers</SelectItem>
                    <SelectItem value="boardOfDirectors">Board of Directors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Banking Context</label>
                <Select 
                  value={bankingContext} 
                  onValueChange={(value) => setBankingContext(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select banking context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retailBanking">Retail Banking</SelectItem>
                    <SelectItem value="commercialBanking">Commercial Banking</SelectItem>
                    <SelectItem value="wealthManagement">Wealth Management</SelectItem>
                    <SelectItem value="investmentBanking">Investment Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chartData">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Chart Type</label>
                <Select 
                  value={chartType} 
                  onValueChange={(value) => setChartType(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Data Context</label>
                <Input 
                  placeholder="What data should the chart show?" 
                  value={generationContext.dataContext || ''}
                  onChange={(e) => updateContext('dataContext', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Key Message</label>
                <Input 
                  placeholder="What key message should the chart convey?" 
                  value={generationContext.keyMessage || ''}
                  onChange={(e) => updateContext('keyMessage', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tableData">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Comparison Subject</label>
                <Input 
                  placeholder="What are you comparing?" 
                  value={comparisonSubject}
                  onChange={(e) => setComparisonSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Competitors to Include</label>
                <Input 
                  placeholder="List primary competitors to include" 
                  value={generationContext.competitors || ''}
                  onChange={(e) => updateContext('competitors', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Key Comparison Factors</label>
                <Textarea 
                  placeholder="What factors should be compared?" 
                  value={generationContext.factors || ''}
                  onChange={(e) => updateContext('factors', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="genericContent">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Content Focus</label>
                <Textarea 
                  placeholder="What should this content focus on?" 
                  value={generationContext.contentFocus || ''}
                  onChange={(e) => updateContext('contentFocus', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Target Audience</label>
                <Select 
                  value={audience} 
                  onValueChange={(value) => setAudience(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">C-Suite Executives</SelectItem>
                    <SelectItem value="technical">Technical Decision Makers</SelectItem>
                    <SelectItem value="boardOfDirectors">Board of Directors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Banking Context</label>
                <Select 
                  value={bankingContext} 
                  onValueChange={(value) => setBankingContext(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select banking context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retailBanking">Retail Banking</SelectItem>
                    <SelectItem value="commercialBanking">Commercial Banking</SelectItem>
                    <SelectItem value="wealthManagement">Wealth Management</SelectItem>
                    <SelectItem value="investmentBanking">Investment Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setGenerationContext({});
          setChartType("bar");
          setComparisonSubject("Banking Solutions");
        }}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ContentGenerator; 