"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, BarChart3, Briefcase, Users, Target, DollarSign, Globe, Building, Clock, ChevronLeft, Edit, RefreshCw, Loader2, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

// Define competitor type interface
interface CompetitorData {
  id: string;
  name?: string;
  website?: string;
  industry?: string;
  primaryCompetitor?: boolean;
  analysisStatus?: string;
  lastUpdated?: string;
  analysis?: {
    summary?: string;
    findings?: {
      swot?: {
        strengths?: string[];
        weaknesses?: string[];
        opportunities?: string[];
        threats?: string[];
      };
      products?: {
        mainProducts?: string[];
        features?: string[];
        uniqueSellingPoints?: string[];
        pricing?: string;
      };
      financials?: {
        revenue?: string;
        funding?: string;
        valuation?: string;
        growth?: string;
        profitability?: string;
      };
      executives?: {
        key_people?: Array<{
          name: string;
          position: string;
          background?: string;
        }>;
      };
    };
    competitiveAnalysis?: string;
  };
  notes?: string;
}

// Summary section component
const SummarySection = ({ competitor, analysis }: { 
  competitor: CompetitorData, 
  analysis: CompetitorData['analysis'] | null 
}) => {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle>Overview</CardTitle>
            </div>
            {competitor.website && (
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <CardDescription>Key information about {competitor.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {analysis ? (
            <div>
              {analysis.summary ? (
                <div>
                  <p className="whitespace-pre-line">{analysis.summary}</p>
                </div>
              ) : (
                <p>No summary available yet. Run a full analysis to generate a summary.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </CardContent>
      </Card>
      
      {analysis && analysis.findings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* SWOT Analysis Card */}
          {analysis.findings.swot && (
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle>SWOT Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-5 pb-2">
                <div className="space-y-4">
                  {analysis.findings.swot.strengths && analysis.findings.swot.strengths.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Strengths</h3>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {analysis.findings.swot.strengths.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.findings.swot.weaknesses && analysis.findings.swot.weaknesses.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Weaknesses</h3>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {analysis.findings.swot.weaknesses.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Key Products Card */}
          {analysis.findings.products && (
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  <CardTitle>Key Products</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {analysis.findings.products.mainProducts && analysis.findings.products.mainProducts.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.findings.products.mainProducts.map((product: string, i: number) => (
                      <li key={i}>{product}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No product information available</p>
                )}
                
                {analysis.findings.products.pricing && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-1">Pricing Strategy</h3>
                    <p className="text-sm">{analysis.findings.products.pricing}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Market Position Card */}
          {analysis.competitiveAnalysis && (
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <CardTitle>Market Position</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-sm">{analysis.competitiveAnalysis}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default function CompetitorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [competitor, setCompetitor] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CompetitorData['analysis'] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch competitor data
  useEffect(() => {
    async function fetchCompetitor() {
      try {
        const competitorDoc = await getDoc(doc(db, "competitors", params.id));
        
        if (!competitorDoc.exists()) {
          setError("Competitor not found");
          setLoading(false);
          return;
        }
        
        const competitorData = {
          id: competitorDoc.id,
          ...competitorDoc.data()
        } as CompetitorData;
        
        setCompetitor(competitorData);
        
        // Check if analysis exists
        if (competitorData.analysis) {
          setAnalysis(competitorData.analysis);
        }
        
      } catch (error) {
        console.error("Error fetching competitor:", error);
        setError("Error loading competitor");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompetitor();
  }, [params.id]);

  const runCompetitorAnalysis = async () => {
    if (!competitor) return;
    
    setAnalyzing(true);
    try {
      // Prepare the input for the competitor analysis
      const input = {
        competitorName: competitor.name,
        website: competitor.website,
        pitchContext: {
          industry: competitor.industry,
        },
        focusAreas: {
          financial: true,
          news: true,
          executiveTeam: true,
          products: true,
          pricing: true,
          marketPosition: true,
          pitchApproach: true
        },
        newsTimeFrame: 6,
        customQueries: competitor.notes
      };
      
      // Update competitor status
      await updateDoc(doc(db, "competitors", competitor.id), {
        analysisStatus: "analyzing",
        lastUpdated: new Date().toISOString()
      });
      
      // Call the competitor analysis API
      const response = await fetch("/api/agents/competitor-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update the competitor with the analysis results
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Store the analysis results
      await updateDoc(doc(db, "competitors", competitor.id), {
        analysis: result,
        analysisStatus: "complete",
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setAnalysis(result);
      setCompetitor({
        ...competitor,
        analysisStatus: "complete"
      });
      
      toast.success("Competitor analysis completed successfully");
    } catch (error) {
      console.error("Error in competitor analysis:", error);
      
      // Update status to error
      await updateDoc(doc(db, "competitors", competitor.id), {
        analysisStatus: "error",
        lastUpdated: new Date().toISOString()
      });
      
      setCompetitor({
        ...competitor,
        analysisStatus: "error"
      });
      
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        {/* Gradient header background */}
        <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-3xl" />
        
        <div className="container mx-auto px-6 pt-10 relative">
          <div className="animate-pulse space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div>
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
                </div>
              </CardHeader>
            </Card>
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="relative min-h-screen">
        {/* Gradient header background */}
        <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-red-600 to-red-700 rounded-b-3xl" />
        
        <div className="container mx-auto px-6 pt-10 relative">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
                <p className="mt-2 text-[#4b5563] dark:text-[#9ca3af]">{error || "Competitor not found"}</p>
                <Button 
                  className="mt-6" 
                  variant="outline"
                  onClick={() => router.push("/competitors")}
                >
                  Back to Competitors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Format the date if it exists
  const formattedDate = competitor.lastUpdated 
    ? new Date(competitor.lastUpdated).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      }) 
    : 'Not available';

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Gradient header background */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-10" />
      
      <div className="w-full px-6 py-8 relative">
        {/* Back button */}
        <div className="mb-4">
          <Link 
            href="/competitors" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Competitors
          </Link>
        </div>
        
        {/* Competitor Profile Card - Ensure it has light mode styling */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
              <div className="flex items-center gap-4">
                {/* Competitor avatar/initial */}
                <div className="w-16 h-16 rounded-md bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {competitor?.name?.charAt(0) || "?"}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{competitor?.name || "Competitor Not Found"}</h1>
                  <div className="flex items-center text-slate-600 mt-1">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{competitor?.industry || "Industry not specified"}</span>
                  </div>
                  {competitor?.website && (
                    <a 
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-500 mt-1"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      {competitor.website.replace(/^https?:\/\/(www\.)?/, "")}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  {competitor?.primaryCompetitor && (
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Primary Competitor
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/competitors/${params.id}/edit`}>
                  <Button variant="outline" className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button onClick={runCompetitorAnalysis} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Analysis Status Indicator */}
            <div className="mt-6">
              <div className="text-sm font-medium text-slate-600 mb-2">Analysis Status</div>
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full ${
                    competitor?.analysisStatus === "complete" 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                      : competitor?.analysisStatus === "error"
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : competitor?.analysisStatus === "analyzing"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600" 
                      : "bg-gradient-to-r from-slate-400 to-slate-500"
                  }`}
                  style={{ 
                    width: competitor?.analysisStatus === "complete" 
                      ? "100%" 
                      : competitor?.analysisStatus === "analyzing" 
                      ? "60%" 
                      : "0%" 
                  }}
                />
              </div>
              <div className="text-right text-xs font-medium mt-1 text-slate-600">
                {competitor?.analysisStatus === "complete" && "Complete"}
                {competitor?.analysisStatus === "analyzing" && "In Progress"}
                {competitor?.analysisStatus === "error" && "Error"}
                {(!competitor?.analysisStatus || competitor?.analysisStatus === "initial") && "Not Started"}
              </div>
            </div>

            {/* Last updated timestamp */}
            <div className="mt-4 text-sm text-slate-500">
              <Clock className="h-3 w-3 inline-block mr-1" />
              Updated {competitor?.lastUpdated 
                ? formatDistanceToNow(new Date(competitor.lastUpdated), { addSuffix: true })
                : "never"
              }
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-8">
          <TabsList className="inline-flex h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Summary</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Financials</span>
            </TabsTrigger>
            <TabsTrigger value="executives" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Executives</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-8">
            <SummarySection competitor={competitor} analysis={analysis} />
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <CardTitle>Products & Offerings</CardTitle>
                  </div>
                  <CardDescription>Key products and services offered</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {competitor.analysisStatus === "complete" && analysis?.findings?.products ? (
                    <div className="space-y-4">
                      {analysis.findings.products.mainProducts && analysis.findings.products.mainProducts.length > 0 ? (
                        <div>
                          <h3 className="font-medium mb-2">Main Products</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.findings.products.mainProducts.map((product: string, index: number) => (
                              <li key={index}>{product}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No product information available</p>
                      )}
                      
                      {analysis.findings.products.features && analysis.findings.products.features.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Key Features</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.findings.products.features.map((feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.findings.products.uniqueSellingPoints && analysis.findings.products.uniqueSellingPoints.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Unique Selling Points</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {analysis.findings.products.uniqueSellingPoints.map((usp: string, index: number) => (
                              <li key={index}>{usp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.findings.products.pricing && (
                        <div>
                          <h3 className="font-medium mb-2">Pricing</h3>
                          <p>{analysis.findings.products.pricing}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">
                        Run an analysis to see product details
                      </p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                        onClick={runCompetitorAnalysis}
                        disabled={analyzing || competitor.analysisStatus === "analyzing"}
                      >
                        {analyzing || competitor.analysisStatus === "analyzing" 
                          ? "Analysis in Progress..." 
                          : "Run Analysis"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financial">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                    <CardTitle>Financial Information</CardTitle>
                  </div>
                  <CardDescription>Revenue, profitability, and growth trends</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {competitor.analysisStatus === "complete" && analysis?.findings?.financials ? (
                    <div className="space-y-4">
                      {analysis.findings.financials.revenue && (
                        <div>
                          <h3 className="font-medium mb-1">Revenue</h3>
                          <p className="text-gray-700 dark:text-gray-300">{analysis.findings.financials.revenue}</p>
                        </div>
                      )}
                      
                      {analysis.findings.financials.funding && (
                        <div>
                          <h3 className="font-medium mb-1">Funding</h3>
                          <p className="text-gray-700 dark:text-gray-300">{analysis.findings.financials.funding}</p>
                        </div>
                      )}
                      
                      {analysis.findings.financials.valuation && (
                        <div>
                          <h3 className="font-medium mb-1">Valuation</h3>
                          <p className="text-gray-700 dark:text-gray-300">{analysis.findings.financials.valuation}</p>
                        </div>
                      )}
                      
                      {analysis.findings.financials.growth && (
                        <div>
                          <h3 className="font-medium mb-1">Growth</h3>
                          <p className="text-gray-700 dark:text-gray-300">{analysis.findings.financials.growth}</p>
                        </div>
                      )}
                      
                      {analysis.findings.financials.profitability && (
                        <div>
                          <h3 className="font-medium mb-1">Profitability</h3>
                          <p className="text-gray-700 dark:text-gray-300">{analysis.findings.financials.profitability}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">
                        Run an analysis to see financial information
                      </p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                        onClick={runCompetitorAnalysis}
                        disabled={analyzing || competitor.analysisStatus === "analyzing"}
                      >
                        {analyzing || competitor.analysisStatus === "analyzing" 
                          ? "Analysis in Progress..." 
                          : "Run Analysis"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="executives">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <CardTitle>Executive Team</CardTitle>
                  </div>
                  <CardDescription>Key leadership and management</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {competitor.analysisStatus === "complete" && analysis?.findings?.executives?.key_people ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.findings.executives.key_people.map((person: any, index: number) => (
                        <Card key={index} className="border border-gray-100 dark:border-gray-700">
                          <CardContent className="p-4">
                            <h3 className="font-medium">{person.name}</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{person.position}</p>
                            {person.background && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{person.background}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">
                        Run an analysis to see executive information
                      </p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                        onClick={runCompetitorAnalysis}
                        disabled={analyzing || competitor.analysisStatus === "analyzing"}
                      >
                        {analyzing || competitor.analysisStatus === "analyzing" 
                          ? "Analysis in Progress..." 
                          : "Run Analysis"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 