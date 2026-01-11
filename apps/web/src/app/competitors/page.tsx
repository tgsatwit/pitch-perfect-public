"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  FileSearch, 
  Users, 
  Target, 
  BarChart3, 
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";

// Status component for the dashboard
function CompetitorStatus({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: string; 
  color: string;
}) {
  const getIcon = () => {
    switch(icon) {
      case "target": return <Target className="h-5 w-5" />;
      case "fileSearch": return <FileSearch className="h-5 w-5" />;
      case "users": return <Users className="h-5 w-5" />;
      case "barChart": return <BarChart3 className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };
  
  const getBgColor = () => {
    switch(color) {
      case "blue": return "bg-white";
      case "purple": return "bg-white";
      case "green": return "bg-white";
      case "amber": return "bg-white";
      default: return "bg-white";
    }
  };
  
  const getTextColor = () => {
    switch(color) {
      case "blue": return "text-indigo-600";
      case "purple": return "text-purple-600";
      case "green": return "text-cyan-600";
      case "amber": return "text-blue-600";
      default: return "text-indigo-600";
    }
  };
  
  const getIconBgColor = () => {
    switch(color) {
      case "blue": return "bg-indigo-100";
      case "purple": return "bg-purple-100";
      case "green": return "bg-cyan-100";
      case "amber": return "bg-blue-100";
      default: return "bg-indigo-100";
    }
  };
  
  return (
    <div className={`${getBgColor()} shadow-md border border-slate-200 rounded-md p-6 flex items-center`}>
      <div className={`${getIconBgColor()} rounded-full p-3 mr-4`}>
        <div className={getTextColor()}>
          {getIcon()}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-slate-900 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function CompetitorsPageContent() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [analyzingCompetitors, setAnalyzingCompetitors] = useState<Record<string, boolean>>({});

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      console.log("Attempting to fetch competitors from Firestore...");
      const competitorsCollection = collection(db, "competitors");
      
      const competitorsSnapshot = await getDocs(competitorsCollection);
      console.log("Competitors snapshot received:", competitorsSnapshot.size, "documents");
      
      const competitorsList = competitorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Competitors list processed:", competitorsList.length, "competitors");
      setCompetitors(competitorsList);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      // Show user friendly error
      alert(`Error loading competitors: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredCompetitors = competitors.filter((competitor) =>
    competitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competitor.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competitor.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "lastUpdated") {
      aValue = a.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
      bValue = b.lastUpdated ? new Date(b.lastUpdated) : new Date(0);
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleDeleteCompetitor = async (competitorId: string) => {
    if (window.confirm("Are you sure you want to delete this competitor?")) {
      try {
        await deleteDoc(doc(db, "competitors", competitorId));
        setCompetitors(competitors.filter(competitor => competitor.id !== competitorId));
        toast.success("Competitor deleted successfully");
      } catch (error) {
        console.error("Error deleting competitor:", error);
        toast.error("Failed to delete competitor");
      }
    }
  };

  const startAnalysis = async (competitor: any) => {
    // Skip if analysis is already in progress or completed
    if (competitor.analysisStatus === "analyzing" || competitor.analysisStatus === "complete") {
      return;
    }

    // Mark this competitor as currently analyzing
    setAnalyzingCompetitors(prev => ({
      ...prev,
      [competitor.id]: true
    }));

    try {
      // First update the competitor's analysis status
      await updateDoc(doc(db, "competitors", competitor.id), {
        analysisStatus: "analyzing",
        lastUpdated: new Date().toISOString()
      });
      
      // Call the competitor-analysis agent API
      const response = await fetch('/api/agents/competitor-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitorId: competitor.id,
          companyName: competitor.name,
          website: competitor.website,
          industry: competitor.industry || "",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error from competitor-analysis agent: ${response.statusText}`);
      }
      
      const analysisData = await response.json();
      
      // Update the competitor with the analysis results
      await updateDoc(doc(db, "competitors", competitor.id), {
        analysis: analysisData,
        analysisStatus: "complete",
        lastUpdated: new Date().toISOString()
      });
      
      toast.success(`Analysis completed for ${competitor.name}`);
    } catch (error) {
      console.error("Error during competitor analysis:", error);
      
      // Update to error state
      await updateDoc(doc(db, "competitors", competitor.id), {
        analysisStatus: "error",
        lastUpdated: new Date().toISOString()
      });
      
      toast.error(`Analysis failed for ${competitor.name}`);
    } finally {
      // Update the UI to show it's no longer analyzing
      setAnalyzingCompetitors(prev => ({
        ...prev,
        [competitor.id]: false
      }));
      
      // Refresh competitors list
      fetchCompetitors();
    }
  };

  // Count competitors with different status
  const getAnalysisStatusCounts = () => {
    return {
      initial: competitors.filter(c => !c.analysisStatus || c.analysisStatus === "initial").length,
      analyzing: competitors.filter(c => c.analysisStatus === "analyzing").length,
      complete: competitors.filter(c => c.analysisStatus === "complete").length,
      error: competitors.filter(c => c.analysisStatus === "error").length
    };
  };

  const statusCounts = getAnalysisStatusCounts();

  // Get the appropriate badge for analysis status
  const getAnalysisStatusBadge = (competitor: any) => {
    const status = competitor.analysisStatus;
    
    switch(status) {
      case "analyzing":
        return (
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
            <span className="text-amber-600">In Progress</span>
          </div>
        );
      case "complete":
        return (
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-600">Completed</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2"></span>
            <span className="text-red-600">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-slate-400 mr-2"></span>
            <span className="text-slate-600">Not Started</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen pb-16 bg-white">
      {/* Gradient header background */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-b-3xl opacity-10" />
      
      <div className="w-full px-6 pt-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Competitors Analysis</h1>
            <p className="text-slate-600 mt-1">
              Research and analyze your competitors
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative max-w-xs">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search competitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 placeholder-slate-400 pl-10"
              />
            </div>
            
            <Link href="/competitors/add">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </Link>
            
            <Button 
              onClick={fetchCompetitors}
              variant="outline"
              className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CompetitorStatus 
            title="Total Competitors" 
            value={competitors.length} 
            icon="target" 
            color="blue" 
          />
          <CompetitorStatus 
            title="Analyzed" 
            value={competitors.filter(c => c.analysisStatus === 'complete').length} 
            icon="fileSearch" 
            color="green" 
          />
          <CompetitorStatus 
            title="In Progress" 
            value={competitors.filter(c => c.analysisStatus === 'analyzing').length} 
            icon="barChart" 
            color="amber" 
          />
          <CompetitorStatus 
            title="Needs Analysis" 
            value={competitors.filter(c => !c.analysisStatus || c.analysisStatus === 'initial' || c.analysisStatus === 'error').length} 
            icon="users" 
            color="purple" 
          />
        </div>
        
        {/* Competitors Table */}
        <Card className="bg-white shadow-md border border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <span className="ml-2 text-slate-600">Loading competitors...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead
                        className="text-slate-600 cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort("name")}
                      >
                        Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        className="text-slate-600 cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort("industry")}
                      >
                        Industry {sortField === "industry" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="text-slate-600">Website</TableHead>
                      <TableHead
                        className="text-slate-600 cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort("analysisStatus")}
                      >
                        Analysis Status {sortField === "analysisStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        className="text-slate-600 cursor-pointer hover:text-indigo-600"
                        onClick={() => handleSort("lastUpdated")}
                      >
                        Last Updated {sortField === "lastUpdated" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="text-right text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCompetitors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500">
                          No competitors found. Add your first competitor to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedCompetitors.map((competitor) => (
                        <TableRow 
                          key={competitor.id}
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          <TableCell className="font-medium text-slate-900">
                            <Link href={`/competitors/${competitor.id}`} className="hover:text-indigo-600">
                              {competitor.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-slate-600">{competitor.industry || "-"}</TableCell>
                          <TableCell className="text-slate-600">
                            {competitor.website ? (
                              <a 
                                href={competitor.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-indigo-600 hover:text-indigo-500"
                              >
                                {competitor.website.replace(/^https?:\/\/(www\.)?/, "")}
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {getAnalysisStatusBadge(competitor)}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {competitor.lastUpdated 
                              ? formatDistanceToNow(new Date(competitor.lastUpdated), { addSuffix: true }) 
                              : "Never"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                              {(!competitor.analysisStatus || competitor.analysisStatus === "initial" || competitor.analysisStatus === "error") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                                  onClick={() => startAnalysis(competitor)}
                                  disabled={analyzingCompetitors[competitor.id]}
                                >
                                  {analyzingCompetitors[competitor.id] ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                      Analyzing...
                                    </>
                                  ) : (
                                    <>
                                      <FileSearch className="h-3 w-3 mr-2" />
                                      Analyze
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    className="hover:bg-slate-100 cursor-pointer"
                                    onClick={() => window.location.href = `/competitors/${competitor.id}`}
                                  >
                                    <FileSearch className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="hover:bg-slate-100 cursor-pointer"
                                    onClick={() => window.location.href = `/competitors/${competitor.id}/edit`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                    onClick={() => handleDeleteCompetitor(competitor.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CompetitorsPage() {
  return (
      <CompetitorsPageContent />
  );
} 