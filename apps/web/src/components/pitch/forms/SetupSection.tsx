"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, TrendingUp } from "lucide-react";
import type { FirebaseDoc } from '@/types/pitch';
import type { PitchStage } from "@/types/settings";

interface SetupSectionProps {
  clients: FirebaseDoc[];
  clientsLoading: boolean;
  clientsError: string | null;
  selectedClientId: string;
  selectedClientName: string;
  onClientSelect: (clientId: string, clientName: string) => void;
  pitchStage: string;
  onPitchStageChange: (stage: string) => void;
  pitchStages: PitchStage[];
}

export const SetupSection: React.FC<SetupSectionProps> = ({
  clients,
  clientsLoading,
  clientsError,
  selectedClientId,
  selectedClientName,
  onClientSelect,
  pitchStage,
  onPitchStageChange,
  pitchStages
}) => {
  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-2">
        <Label htmlFor="client" className="flex items-center gap-2 text-base font-medium">
          <Building className="w-4 h-4" />
          Select Client
        </Label>
        <Select value={selectedClientId} onValueChange={(value) => {
          const selectedClient = clients.find(c => c.id === value);
          onClientSelect(value, selectedClient?.name || "");
        }}>
          <SelectTrigger>
            <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Choose a client"} />
          </SelectTrigger>
          <SelectContent>
            {clientsError ? (
              <SelectItem value="" disabled>Error loading clients</SelectItem>
            ) : clientsLoading ? (
              <SelectItem value="" disabled>Loading...</SelectItem>
            ) : clients.length === 0 ? (
              <SelectItem value="" disabled>No clients found</SelectItem>
            ) : (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Pitch Stage Selection */}
      <div className="space-y-2">
        <Label htmlFor="pitchStage" className="flex items-center gap-2 text-base font-medium">
          <TrendingUp className="w-4 h-4" />
          Pitch Stage
        </Label>
        <Select value={pitchStage} onValueChange={onPitchStageChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select the current stage of this pitch" />
          </SelectTrigger>
          <SelectContent>
            {pitchStages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pitchStage && (
          <p className="text-sm text-slate-600 mt-1">
            {pitchStages.find(s => s.id === pitchStage)?.description}
          </p>
        )}
      </div>
    </div>
  );
};