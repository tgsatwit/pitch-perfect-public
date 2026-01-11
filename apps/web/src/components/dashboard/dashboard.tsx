"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, FileText, Target, Library, Mic, Presentation, Play } from "lucide-react";

export function DashboardComponent() {
  const router = useRouter();

  const navigateToCanvas = () => {
    router.push("/pitches/new");
  };

  const navigateToClients = () => {
    router.push("/clients");
  };

  const navigateToCompetitors = () => {
    router.push("/competitors");
  };

  const navigateToLibrary = () => {
    router.push("/pitches");
  };

  const navigateToPresentation = () => {
    router.push("/pitches/present");
  };

  const navigateToBullpen = () => {
    console.log("Navigate to Bull Pen");
  };

  return (
    <div className="flex flex-col py-12 px-6 md:px-12 bg-white text-slate-900">

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center gradient-heading">Your Pitch Development Toolkit</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <style jsx>{`
            .aurora-bg {
              background: linear-gradient(
                135deg,
                rgba(99, 102, 241, 0.05) 0%,
                rgba(168, 85, 247, 0.08) 25%,
                rgba(99, 102, 241, 0.03) 50%,
                rgba(168, 85, 247, 0.06) 75%,
                rgba(99, 102, 241, 0.04) 100%
              );
            }
            .aurora-primary {
              background: linear-gradient(
                135deg,
                rgba(99, 102, 241, 0.15) 0%,
                rgba(168, 85, 247, 0.2) 25%,
                rgba(99, 102, 241, 0.1) 50%,
                rgba(168, 85, 247, 0.18) 75%,
                rgba(99, 102, 241, 0.12) 100%
              );
              border: 2px solid rgba(99, 102, 241, 0.2);
              box-shadow: 
                0 20px 40px rgba(99, 102, 241, 0.25), 
                0 10px 25px rgba(168, 85, 247, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
          `}</style>
          {/* Feature 1: Create a Pitch - Primary CTA */}
          <Card 
            className="aurora-primary shadow-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer relative overflow-hidden"
            onClick={navigateToCanvas}
          >
            <div className="absolute top-2 right-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                Start Here
              </div>
            </div>
            <CardHeader>
              <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-900 font-bold">Create a Pitch</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Start crafting your next winning pitch with intelligent tools and templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-indigo-600 font-semibold">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card 
            className="aurora-bg shadow-md border border-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={navigateToClients}
          >
            <CardHeader>
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl text-slate-900">Manage Clients</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Access and maintain comprehensive profiles and insights for your institutional clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-indigo-600 font-medium">
                View Clients <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card 
            className="aurora-bg shadow-md border border-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={navigateToCompetitors}
          >
            <CardHeader>
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl text-slate-900">Analyze Competitors</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Stay informed with analysis and intelligence reports on competitor strategies and offerings.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-indigo-600 font-medium">
                View Competitors <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Feature 4: Pitch Hub (formerly Pitch Library) */}
          <Card 
            className="aurora-bg shadow-md border border-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={navigateToLibrary}
          >
            <CardHeader>
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                <Library className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl text-slate-900">Pitch Hub</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Access your pitch collection, research documents, templates, and approved content.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-indigo-600 font-medium">
                Open Hub <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Feature 5: Presentation Demo */}
          <Card 
            className="aurora-bg shadow-md border border-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={navigateToPresentation}
          >
            <CardHeader>
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl text-slate-900">Presentation Mode</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Experience the professional presentation mode for client meetings with full-screen slides and presenter tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-indigo-600 font-medium">
                Launch Demo <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>


          {/* Feature 6: Bull Pen */}
          <Card 
            className="aurora-bg shadow-md border border-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={navigateToBullpen}
          >
            <CardHeader>
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl text-slate-900">Bull Pen</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Practice your delivery and get feedback with an AI-powered coaching agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-indigo-600 font-medium">
                Enter Bull Pen <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export const Dashboard = React.memo(DashboardComponent); 