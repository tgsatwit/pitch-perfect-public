"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function EditCompetitorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    website: "",
    industry: "",
    importance: "tertiary",
    notes: ""
  });

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
        
        const data = competitorDoc.data();
        setFormState({
          name: data.name || "",
          website: data.website || "",
          industry: data.industry || "",
          importance: data.importance || "tertiary",
          notes: data.notes || ""
        });
        
      } catch (error) {
        console.error("Error fetching competitor:", error);
        setError("Error loading competitor");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompetitor();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name) {
      toast.error("Competitor name is required");
      return;
    }
    
    setSaving(true);
    
    try {
      // Update in Firestore
      await updateDoc(doc(db, "competitors", params.id), {
        ...formState,
        lastUpdated: new Date().toISOString()
      });
      
      toast.success("Competitor updated successfully");
      router.push(`/competitors/${params.id}`);
    } catch (error) {
      console.error("Error updating competitor:", error);
      toast.error(`Failed to update competitor: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111111] dark:text-[#f2f2f2]">Edit Competitor</h1>
          <p className="text-[#4b5563] dark:text-[#9ca3af] mt-2">
            Loading competitor data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
          <p className="mt-2 text-[#4b5563] dark:text-[#9ca3af]">{error}</p>
          <Button 
            className="mt-6" 
            variant="outline"
            onClick={() => router.push("/competitors")}
          >
            Back to Competitors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          size="sm"
          className="p-0 h-8 w-8"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#111111] dark:text-[#f2f2f2]">Edit Competitor</h1>
          <p className="text-[#4b5563] dark:text-[#9ca3af] mt-2">
            Update competitor information
          </p>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-[#e0e0e5]/50 dark:border-[#222222] shadow-sm">
          <CardHeader>
            <CardTitle>Competitor Information</CardTitle>
            <CardDescription>
              Update the details for this competitor
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Westpac Australia"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="e.g., https://example.com"
                  value={formState.website}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  placeholder="e.g., Financial Services"
                  value={formState.industry}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="importance">Competitive Importance</Label>
                <Select 
                  value={formState.importance} 
                  onValueChange={(value) => handleSelectChange("importance", value)}
                >
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (Direct competitor)</SelectItem>
                    <SelectItem value="secondary">Secondary (Indirect competitor)</SelectItem>
                    <SelectItem value="tertiary">Tertiary (Market adjacent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional information or context..."
                  value={formState.notes}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0F1C3F] to-[#1A1A2E] hover:opacity-90 text-white"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 