"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Loader2, FileSearch, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";

interface ClientsTableProps {
  clients: any[];
  loading: boolean;
  onEdit: (client: any) => void;
  onDelete: (clientId: string) => void;
}

export function ClientsTable({ clients, loading, onEdit, onDelete }: ClientsTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [researchingClients, setResearchingClients] = useState<Record<string, boolean>>({});

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "createdAt") {
      aValue = a.createdAt?.toDate?.() || new Date(a.createdAt);
      bValue = b.createdAt?.toDate?.() || new Date(b.createdAt);
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Helper to display profile status with appropriate styling
  const getProfileStatusBadge = (client: any) => {
    const status = client.profileStatus || "initial";
    
    switch(status) {
      case "researching":
        return (
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
            <span className="text-amber-600">Researching</span>
          </div>
        );
      case "complete":
        return (
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-600">Complete</span>
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

  const startResearch = async (client: any) => {
    // Skip if research is already in progress or completed
    if (client.profileStatus === "researching" || client.profileStatus === "complete") {
      return;
    }

    // Mark this client as currently researching
    setResearchingClients(prev => ({
      ...prev,
      [client.id]: true
    }));

    try {
      // First update the client's profile status
      await updateDoc(doc(db, "clients", client.id), {
        profileStatus: "researching",
        updatedAt: new Date().toISOString()
      });
      
      // Call the client-research agent API
      const response = await fetch('/api/agents/client-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          companyName: client.name,
          website: client.website,
          industry: client.industry || client.sector || "",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error from client-research agent: ${response.statusText}`);
      }
      
      const researchData = await response.json();
      
      // Update the client with the research results
      await updateDoc(doc(db, "clients", client.id), {
        research: researchData,
        profileStatus: "complete",
        lastResearchCompleteTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Update the client in the local state to reflect the change
      client.profileStatus = "complete";
      client.research = researchData;
      client.lastResearchCompleteTime = new Date().toISOString();
      client.updatedAt = new Date().toISOString();
      
      toast.success(`Research completed for ${client.name}`);
    } catch (error) {
      console.error("Error during client research:", error);
      
      // Update to error state
      await updateDoc(doc(db, "clients", client.id), {
        profileStatus: "error",
        updatedAt: new Date().toISOString()
      });
      
      // Update the client in the local state
      client.profileStatus = "error";
      client.updatedAt = new Date().toISOString();
      
      toast.error(`Research failed for ${client.name}`);
    } finally {
      // Clear researching status
      setResearchingClients(prev => ({
        ...prev,
        [client.id]: false
      }));
      
      // Force a re-render
      setSortField(prevField => prevField);
    }
  };

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="ml-2 text-slate-600">Loading clients...</span>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead
                className="text-slate-600 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort("name")}
              >
                Company Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="text-slate-600 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort("website")}
              >
                Website {sortField === "website" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="text-slate-600 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort("profileStatus")}
              >
                Status {sortField === "profileStatus" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="text-slate-600 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort("clientType")}
              >
                Profile {sortField === "clientType" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="text-slate-600 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort("createdAt")}
              >
                Added On {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-right text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
                  No clients found. Add your first client to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedClients.map((client) => (
                <TableRow 
                  key={client.id}
                  className="border-slate-200 hover:bg-slate-50"
                >
                  <TableCell className="font-medium text-slate-900">
                    <Link href={`/clients/${client.id}`} className="hover:text-indigo-600">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {client.website ? (
                      <a 
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-500"
                      >
                        {client.website.replace(/^https?:\/\/(www\.)?/, "")}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {getProfileStatusBadge(client)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {client.clientType === "existing" ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Existing Client
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Prospective Client
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {client.createdAt 
                      ? formatDistanceToNow(
                          client.createdAt?.toDate?.() || new Date(client.createdAt),
                          { addSuffix: true }
                        ) 
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Run Research button - only shown for initial or error status */}
                      {(!client.profileStatus || client.profileStatus === "initial" || client.profileStatus === "error") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                          onClick={() => startResearch(client)}
                          disabled={researchingClients[client.id]}
                        >
                          {researchingClients[client.id] ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Researching...
                            </>
                          ) : (
                            <>
                              <FileSearch className="h-3 w-3 mr-2" />
                              Research
                            </>
                          )}
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/clients/${client.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(client)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(client.id)}
                            className="text-red-600"
                          >
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
      )}
    </div>
  );
} 