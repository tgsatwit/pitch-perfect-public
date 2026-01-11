"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type DataSourceCardProps = {
  title: string;
  icon: React.ReactNode;
  description: string;
  categoryId: string;
  onCategoryToggle: (categoryId: string, isChecked: boolean) => void;
  initialCheckedState?: boolean;
  disabled?: boolean;
};

export const DataSourceCard: React.FC<DataSourceCardProps> = ({ 
  title, 
  icon, 
  description,
  categoryId, 
  onCategoryToggle,
  initialCheckedState = true,
  disabled = false
}) => {
  const [checked, setChecked] = useState<boolean>(initialCheckedState);
  
  useEffect(() => {
    setChecked(initialCheckedState);
  }, [initialCheckedState]);

  const handleCheckedChange = (checked: boolean | string) => {
    const isChecked = checked === true || checked === "true";
    setChecked(isChecked);
    onCategoryToggle(categoryId, isChecked);
  };

  return (
    <Card className={cn("rounded-lg overflow-hidden relative", 
      disabled && "opacity-60 cursor-not-allowed")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <Switch 
            checked={checked} 
            onCheckedChange={handleCheckedChange}
            disabled={disabled}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};