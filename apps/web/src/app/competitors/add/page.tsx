"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function AddCompetitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    website: "",
    industry: "",
    importance: "tertiary", // default: tertiary (options: primary, secondary, tertiary)
    notes: ""
  });

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
    
    setLoading(true);
    
    try {
      // Save to Firestore
      await addDoc(collection(db, "competitors"), {
        ...formState,
        analysisStatus: "initial",
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      toast.success("Competitor added successfully");
      router.push("/competitors");
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast.error(`Failed to add competitor: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111] dark:text-[#f2f2f2]">Add Competitor</h1>
        <p className="text-[#4b5563] dark:text-[#9ca3af] mt-2">
          Add a new competitor to track and analyze
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-[#e0e0e5]/50 dark:border-[#222222] shadow-sm">
          <CardHeader>
            <CardTitle>Competitor Information</CardTitle>
            <CardDescription>
              Enter basic details about the competitor. You can run a full analysis after adding.
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
                <p className="text-sm text-[#4b5563] dark:text-[#9ca3af]">
                  Including a website helps the AI gather more accurate information
                </p>
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
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Competitor"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 