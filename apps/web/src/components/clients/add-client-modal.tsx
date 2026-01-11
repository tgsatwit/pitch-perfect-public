"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSaved: () => void;
  client?: any;
}

export function AddClientModal({ isOpen, onClose, onClientSaved, client }: AddClientModalProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [clientType, setClientType] = useState<"existing" | "prospective">("prospective");
  const [relationshipStartDate, setRelationshipStartDate] = useState("");
  const [currentMFI, setCurrentMFI] = useState("");
  const [searchStep, setSearchStep] = useState<"form" | "searching" | "results">("form");
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchUpdates, setSearchUpdates] = useState<string[]>([]);

  useEffect(() => {
    if (client) {
      setName(client.name || "");
      setWebsite(client.website || "");
      setClientType(client.clientType || "prospective");
      setRelationshipStartDate(client.relationshipStartDate || "");
      setCurrentMFI(client.currentMFI || "");
    } else {
      resetForm();
    }
  }, [client, isOpen]);

  const resetForm = () => {
    setName("");
    setWebsite("");
    setClientType("prospective");
    setRelationshipStartDate("");
    setCurrentMFI("");
    setSearchStep("form");
    setClientInfo(null);
    setSearchProgress(0);
    setSearchUpdates([]);
  };

  const validateForm = () => {
    if (!name.trim()) {
      alert("Company name is required");
      return false;
    }
    
    if (clientType === "existing" && !relationshipStartDate) {
      alert("Relationship start date is required for existing clients");
      return false;
    }
    
    if (clientType === "prospective" && !currentMFI.trim()) {
      alert("Current MFI is required for prospective clients");
      return false;
    }
    
    return true;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;
    
    setSearchStep("searching");
    setSearchUpdates([]);
    setSearchProgress(0);
    
    // Initial update
    setSearchUpdates(["Initializing client search..."]);
    setSearchProgress(10);

    try {
      // Prepare the input for the client-search agent
      const agentInput = {
        companyName: name,
        website,
        clientType,
        ...(clientType === "existing" ? { relationshipStartDate } : {}),
        ...(clientType === "prospective" ? { currentMFI } : {})
      };
      
      // Update progress
      setSearchUpdates(prev => [...prev, "Connecting to client-search agent..."]);
      setSearchProgress(25);
      
      // Call the client-search agent API endpoint
      const response = await fetch('/api/agents/client-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentInput),
      });
      
      // Update progress
      setSearchUpdates(prev => [...prev, "Processing company information..."]);
      setSearchProgress(60);
      
      if (!response.ok) {
        throw new Error(`Error from client-search agent: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Final update
      setSearchUpdates(prev => [...prev, "Client information retrieved successfully"]);
      setSearchProgress(100);
      
      // Set the client info from the agent's response
      // The LangGraph agent returns data in a nested structure
      // It could be either data.output or nested further in data.input/data.output
      let clientSearchResult;
      
      if (data.output) {
        clientSearchResult = data.output;
      } else if (data && data.input && data.output) {
        // This is the format when using StateGraph
        clientSearchResult = data.output;
      } else {
        // Fallback to whatever was returned
        clientSearchResult = data;
      }
      
      console.log("Client search result:", clientSearchResult);
      setClientInfo(clientSearchResult);
      setSearchStep("results");
    } catch (error) {
      console.error("Error searching for client:", error);
      setSearchUpdates(prev => [...prev, `Error: ${error instanceof Error ? error.message : "Failed to search for client information"}`]);
      
      // Fallback to local mock data if the agent call fails
      const fallbackClientInfo = {
        description: `${name} appears to be an organization operating in the Australian market.`,
        industry: "Unknown",
        founded: "Unknown",
        headquarters: "Australia (presumed)",
        keyProducts: ["Unknown"],
        recentNews: "No recent news available.",
      };
      
      setClientInfo(fallbackClientInfo);
      setSearchStep("results");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      console.log("Preparing client data for save...");
      const clientData = {
        name,
        website,
        clientType,
        profileStatus: "initial",
        ...(clientType === "existing" ? { relationshipStartDate } : { currentMFI }),
        ...(clientInfo ? { info: clientInfo } : {}),
        updatedAt: new Date(), // Use plain Date object instead of serverTimestamp
      };
      
      console.log("Client data prepared:", clientData);
      
      if (client) {
        console.log("Updating existing client with ID:", client.id);
        
        // Update existing client but don't overwrite profile status if it exists
        if (!client.profileStatus) {
          await updateDoc(doc(db, "clients", client.id), {
            ...clientData
          });
          console.log("Client updated successfully with new profile status");
        } else {
          // Preserve the existing profile status by removing it from clientData
          const { profileStatus, ...dataWithoutProfileStatus } = clientData;
          await updateDoc(doc(db, "clients", client.id), dataWithoutProfileStatus);
          console.log("Client updated successfully preserving existing profile status");
        }
      } else {
        // Add new client
        console.log("Creating new client...");
        
        // Prepare the new client document with createdAt field
        const newClient = {
          ...clientData,
          createdAt: new Date(), // Use plain Date object instead of serverTimestamp
          pitches: [],
        };
        
        console.log("New client document:", newClient);
        
        // Log the Firestore reference for debugging
        console.log("Firestore DB reference:", db);
        console.log("Clients collection reference:", collection(db, "clients"));
        
        // Use try/catch specifically for the addDoc operation
        try {
          const docRef = await addDoc(collection(db, "clients"), newClient);
          console.log("New client created with ID:", docRef.id);
        } catch (addError) {
          console.error("Error in addDoc operation:", addError);
          throw new Error(`Failed to create client: ${addError instanceof Error ? addError.message : "Unknown error"}`);
        }
      }
      
      console.log("Client saved successfully, notifying parent component");
      onClientSaved();
      resetForm();
    } catch (error) {
      console.error("Error saving client:", error);
      // Show a more detailed error message
      alert(`Error saving client: ${error instanceof Error ? error.message : "Unknown error"}. Please check console for details.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {client ? "Edit Client" : "Add New Client"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {searchStep === "form" 
              ? "Enter client details to find information" 
              : searchStep === "searching" 
                ? "Searching for client information..." 
                : "Review and save client information"}
          </p>
        </div>

        <div className="p-6">
          {searchStep === "form" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. company.com"
                />
              </div>
              
              <div>
                <Label>Client Type *</Label>
                <RadioGroup 
                  value={clientType} 
                  onValueChange={(value: "existing" | "prospective") => setClientType(value)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="cursor-pointer">Existing Client</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prospective" id="prospective" />
                    <Label htmlFor="prospective" className="cursor-pointer">Prospective Client</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {clientType === "existing" ? (
                <div>
                  <Label htmlFor="relationshipStartDate">Relationship Start Date *</Label>
                  <Input 
                    id="relationshipStartDate" 
                    type="date"
                    value={relationshipStartDate} 
                    onChange={(e) => setRelationshipStartDate(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="currentMFI">Current MFI *</Label>
                  <Input 
                    id="currentMFI" 
                    value={currentMFI} 
                    onChange={(e) => setCurrentMFI(e.target.value)}
                    placeholder="Enter current banking provider"
                  />
                </div>
              )}
            </div>
          )}

          {searchStep === "searching" && (
            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                ></div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {searchUpdates.map((update, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 mr-2"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{update}</p>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Using client-search agent to gather information about <span className="font-semibold">{name}</span>
              </p>
            </div>
          )}

          {searchStep === "results" && clientInfo && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {name}
                </h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-white">Description:</span>{" "}
                    {clientInfo.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Industry:</span>{" "}
                      {clientInfo.industry}
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Founded:</span>{" "}
                      {clientInfo.founded}
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Headquarters:</span>{" "}
                      {clientInfo.headquarters}
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {clientType === "existing" ? "Relationship Since:" : "Current MFI:"}
                      </span>{" "}
                      {clientType === "existing" ? relationshipStartDate : currentMFI}
                    </p>
                  </div>

                  {/* Market Position section */}
                  {clientInfo.marketPosition && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Market Position:</span>{" "}
                      {clientInfo.marketPosition}
                    </p>
                  )}
                  
                  {/* Key Products section */}
                  {clientInfo.keyProducts && clientInfo.keyProducts.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">Key Products/Services:</p>
                      <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 pl-2">
                        {clientInfo.keyProducts.map((product: string, index: number) => (
                          <li key={index}>{product}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Competitors section */}
                  {clientInfo.competitors && clientInfo.competitors.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">Key Competitors:</p>
                      <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 pl-2">
                        {clientInfo.competitors.map((competitor: string, index: number) => (
                          <li key={index}>{competitor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Recent News section */}
                  {clientInfo.recentNews && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                      <span className="font-medium text-slate-900 dark:text-white">Recent News:</span>{" "}
                      {clientInfo.recentNews}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add any additional information about this client"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              if (searchStep === "form") {
                onClose();
                resetForm();
              } else {
                setSearchStep("form");
              }
            }}
          >
            {searchStep === "form" ? "Cancel" : "Back"}
          </Button>
          
          {searchStep === "form" && (
            <Button
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white"
              onClick={handleSearch}
            >
              Search
            </Button>
          )}
          
          {searchStep === "results" && (
            <Button
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white"
              onClick={handleSave}
            >
              Save Client
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 