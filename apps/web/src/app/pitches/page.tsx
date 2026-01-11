"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";
import { useThreadContext } from "@/contexts/ThreadProvider";
import {
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  where,
  doc,
  deleteDoc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Loader2, Plus, RefreshCw, MoreHorizontal, Trash2, TrashIcon, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";

// Competitor type definition
interface Competitor {
  id: string;
  name: string;
}

// Pitch type definition based on the fields we want to display
interface Pitch {
  id: string;
  clientId: string;
  clientName: string;
  competitorsSelected: Record<string, boolean>;
  pitchStage: string;
  langGraphThreadId: string;
  createdAt: Timestamp;
}

export default function PitchPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const { threadId } = useThreadContext();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [competitors, setCompetitors] = useState<Record<string, Competitor>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedPitches, setSelectedPitches] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all competitors to get their names
  const fetchCompetitors = async () => {
    try {
      const competitorsRef = collection(db, "competitors");
      const competitorsSnapshot = await getDocs(competitorsRef);
      
      const competitorsData: Record<string, Competitor> = {};
      competitorsSnapshot.forEach((doc) => {
        const data = doc.data();
        competitorsData[doc.id] = {
          id: doc.id,
          name: data.name || "Unknown Competitor",
        };
      });
      
      setCompetitors(competitorsData);
    } catch (error) {
      console.error("Error fetching competitors:", error);
    }
  };

  const fetchPitches = async () => {
    try {
      setLoading(true);
      const pitchesRef = collection(db, "pitches");
      const q = query(pitchesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const pitchesData: Pitch[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pitchesData.push({
          id: doc.id,
          clientId: data.clientId || "",
          clientName: data.clientName || "",
          competitorsSelected: data.competitorsSelected || {},
          pitchStage: data.pitchStage || "stage1",
          langGraphThreadId: data.langGraphThreadId || "",
          createdAt: data.createdAt || Timestamp.now(),
        });
      });

      setPitches(pitchesData);
      // Clear any selections when refreshing
      setSelectedPitches([]);
    } catch (error) {
      console.error("Error fetching pitches:", error);
      toast.error("Failed to load pitches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchCompetitors().then(() => fetchPitches());
  }, [user, router]);

  // Filter pitches based on search query and stage filter
  const filteredPitches = pitches.filter((pitch) => {
    const matchesSearch =
      searchQuery === "" ||
      pitch.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pitch.langGraphThreadId &&
        pitch.langGraphThreadId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage =
      stageFilter === "all" || pitch.pitchStage === stageFilter;

    return matchesSearch && matchesStage;
  });

  // Map pitch stages to display names
  const getPitchStageDisplay = (stage: string) => {
    const stageMap: Record<string, string> = {
      "stage1": "Stage 1",
      "stage2": "Stage 2",
      "stage3": "Stage 3",
      "stage4": "Stage 4"
    };
    return stageMap[stage] || stage;
  };

  // Get competitor names from IDs
  const getCompetitorNames = (competitorsSelected: Record<string, boolean>) => {
    const selectedCompetitorIds = Object.keys(competitorsSelected || {}).filter(
      (id) => competitorsSelected[id]
    );
    
    if (selectedCompetitorIds.length === 0) return "None";
    
    return selectedCompetitorIds
      .map((id) => competitors[id]?.name || "Unknown")
      .join(", ");
  };

  // Handle individual pitch deletion
  const handleDeletePitch = async () => {
    if (!pitchToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "pitches", pitchToDelete));
      setPitches(pitches.filter((pitch) => pitch.id !== pitchToDelete));
      toast.success("Pitch deleted successfully");
    } catch (error) {
      console.error("Error deleting pitch:", error);
      toast.error("Failed to delete pitch");
    } finally {
      setIsDeleting(false);
      setPitchToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedPitches.length === 0) return;
    
    try {
      setIsDeleting(true);
      const batch = writeBatch(db);
      
      selectedPitches.forEach((pitchId) => {
        const pitchRef = doc(db, "pitches", pitchId);
        batch.delete(pitchRef);
      });
      
      await batch.commit();
      
      // Update local state
      setPitches(pitches.filter((pitch) => !selectedPitches.includes(pitch.id)));
      setSelectedPitches([]);
      toast.success(`${selectedPitches.length} pitches deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting pitches:", error);
      toast.error("Failed to delete selected pitches");
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  // Toggle selection of a pitch
  const togglePitchSelection = (pitchId: string) => {
    setSelectedPitches((prev) => 
      prev.includes(pitchId)
        ? prev.filter((id) => id !== pitchId)
        : [...prev, pitchId]
    );
  };

  // Toggle selection of all displayed pitches
  const toggleSelectAll = () => {
    if (selectedPitches.length === filteredPitches.length) {
      setSelectedPitches([]);
    } else {
      setSelectedPitches(filteredPitches.map((pitch) => pitch.id));
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
            <h1 className="text-3xl font-bold text-slate-900">Pitch Library</h1>
            <p className="text-slate-600 mt-1">
              Browse and manage your pitch library
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative max-w-xs">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search by client or thread ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 placeholder-slate-400 pl-10"
              />
            </div>
            
            <Button 
              asChild
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              <Link href="/pitches/new">
                <Plus className="h-4 w-4 mr-2" />
                New Pitch
              </Link>
            </Button>
            
            <Button 
              onClick={() => {
                fetchCompetitors().then(() => fetchPitches());
              }}
              variant="outline"
              className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {selectedPitches.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-600"
                disabled={isDeleting}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Selected ({selectedPitches.length})
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-4 mb-6">
          <Select
            value={stageFilter}
            onValueChange={setStageFilter}
          >
            <SelectTrigger className="w-[180px] bg-white border-slate-300">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="stage1">Stage 1</SelectItem>
              <SelectItem value="stage2">Stage 2</SelectItem>
              <SelectItem value="stage3">Stage 3</SelectItem>
              <SelectItem value="stage4">Stage 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Pitches Table */}
        <Card className="bg-white shadow-md border border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <span className="ml-2 text-slate-600">Loading pitches...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedPitches.length === filteredPitches.length && filteredPitches.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="text-slate-600">
                        Client
                      </TableHead>
                      <TableHead className="text-slate-600">
                        Competitors
                      </TableHead>
                      <TableHead className="text-slate-600">
                        Pitch Stage
                      </TableHead>
                      <TableHead className="text-slate-600">
                        LangGraph Thread ID
                      </TableHead>
                      <TableHead className="text-slate-600">
                        Created Date
                      </TableHead>
                      <TableHead className="text-right text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPitches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-slate-500">
                          No pitches found. Create your first pitch to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPitches.map((pitch) => (
                        <TableRow 
                          key={pitch.id}
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedPitches.includes(pitch.id)}
                              onCheckedChange={() => togglePitchSelection(pitch.id)}
                              aria-label={`Select ${pitch.clientName}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            <Link
                              href={
                                pitch.pitchStage === 'stage4'
                                  ? `/pitches/${pitch.id}`
                                  : `/pitches/new?pitchId=${pitch.id}`
                              }
                              className="hover:text-indigo-600"
                            >
                              {pitch.clientName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {getCompetitorNames(pitch.competitorsSelected)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                pitch.pitchStage === "stage4"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                pitch.pitchStage === "stage4"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {getPitchStageDisplay(pitch.pitchStage)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-slate-600">
                            {pitch.langGraphThreadId || "None"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {pitch.createdAt
                              ? format(
                                  pitch.createdAt.toDate(),
                                  "MMM d, yyyy HH:mm"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const href =
                                        pitch.pitchStage === 'stage4'
                                          ? `/pitches/${pitch.id}`
                                          : `/pitches/new?pitchId=${pitch.id}`;
                                      router.push(href);
                                    }}
                                    className="cursor-pointer focus:text-indigo-600"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPitchToDelete(pitch.id);
                                      setShowDeleteConfirm(true);
                                    }}
                                    className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
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

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pitch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pitch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePitch}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Pitches</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPitches.length} selected pitches? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting
                </>
              ) : (
                "Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
