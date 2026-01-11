"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export type DataSourceCategoryProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultChecked?: boolean;
  categoryId: string;
  onCategoryToggle: (categoryId: string, isChecked: boolean) => void;
  initialCheckedState?: boolean;
};

export const DataSourceCategory: React.FC<DataSourceCategoryProps> = ({ 
  title, 
  icon, 
  children, 
  categoryId, 
  onCategoryToggle,
  initialCheckedState = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecked, setIsChecked] = useState(initialCheckedState);

  const handleCheckedChange = (checked: boolean | string) => {
    const newState = !!checked;
    setIsChecked(newState);
    onCategoryToggle(categoryId, newState);
  };

  return (
    <div className="space-y-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-indigo-600 bg-indigo-100 p-1.5 rounded-md">
            {icon}
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`category-${categoryId}`} className="flex items-center space-x-2 cursor-pointer font-medium text-sm text-slate-800">
              <Checkbox 
                id={`category-${categoryId}`}
                checked={isChecked}
                onCheckedChange={handleCheckedChange} 
                className="border-slate-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <span>{title}</span>
            </Label>
          </div>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 h-7 w-7 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 mt-3 pl-10 pt-2 border-t border-slate-200/60">
          {React.Children.map(children, child =>
            React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { disabled: !isChecked }) : child
          )}
        </div>
      )}
    </div>
  );
};