"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/components/clients/clients-table";
import { AddClientModal } from "@/components/clients/add-client-modal";
import { collection, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, RefreshCw, Users, UserPlus, FileSearch, Presentation, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

function ClientsPageContent() {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      console.log("Attempting to fetch clients from Firestore...");
      const clientsCollection = collection(db, "clients");
      
      // Log the Firestore reference to check it's configured correctly
      console.log("Firestore DB reference:", db);
      console.log("Clients collection reference:", clientsCollection);
      
      const clientsSnapshot = await getDocs(clientsCollection);
      console.log("Clients snapshot received:", clientsSnapshot.size, "documents");
      
      const clientsList = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Clients list processed:", clientsList.length, "clients");
      setClients(clientsList);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Show user friendly error
      alert(`Error loading clients: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteDoc(doc(db, "clients", clientId));
        setClients(clients.filter(client => client.id !== clientId));
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const handleClientSaved = () => {
    setIsModalOpen(false);
    fetchClients();
  };

  // Count clients with different profile statuses
  const getProfileStatusCounts = () => {
    return {
      initial: clients.filter(c => !c.profileStatus || c.profileStatus === "initial").length,
      researching: clients.filter(c => c.profileStatus === "researching").length,
      complete: clients.filter(c => c.profileStatus === "complete").length,
      error: clients.filter(c => c.profileStatus === "error").length
    };
  };

  const statusCounts = getProfileStatusCounts();

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-16 bg-white">
      {/* Gradient header background */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-b-3xl opacity-10" />
      
      <div className="w-full px-6 pt-10 relative">
        {/* Header section matching competitors page */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Institutional Clients</h1>
            <p className="text-slate-600 mt-1">
              Manage your institutional clients and prospects
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative max-w-xs">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 placeholder-slate-400 pl-10"
              />
            </div>
            <Button 
              onClick={handleAddClient}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
            <Button 
              onClick={fetchClients}
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
          <Card className="bg-white shadow-md border border-slate-200">
            <CardContent className="p-0">
              <div className="flex items-center p-6">
                <div className="rounded-full p-3 bg-indigo-100 mr-4">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Clients</p>
                  <p className="text-2xl font-bold text-slate-900">{clients.filter(c => c.clientType === "existing").length}</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md border border-slate-200">
            <CardContent className="p-0">
              <div className="flex items-center p-6">
                <div className="rounded-full p-3 bg-purple-100 mr-4">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Prospects</p>
                  <p className="text-2xl font-bold text-slate-900">{clients.filter(c => c.clientType === "prospective").length}</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md border border-slate-200">
            <CardContent className="p-0">
              <div className="flex items-center p-6">
                <div className="rounded-full p-3 bg-cyan-100 mr-4">
                  <FileSearch className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Research Complete</p>
                  <p className="text-2xl font-bold text-slate-900">{statusCounts.complete}</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md border border-slate-200">
            <CardContent className="p-0">
              <div className="flex items-center p-6">
                <div className="rounded-full p-3 bg-blue-100 mr-4">
                  <Presentation className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Pitches</p>
                  <p className="text-2xl font-bold text-slate-900">{clients.reduce((acc, client) => acc + (client.pitches?.length || 0), 0)}</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card className="bg-white shadow-md border border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            <ClientsTable 
              clients={filteredClients} 
              loading={loading} 
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          </CardContent>
        </Card>

        <AddClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onClientSaved={handleClientSaved}
          client={selectedClient}
        />
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
      <ClientsPageContent />
  );
} 