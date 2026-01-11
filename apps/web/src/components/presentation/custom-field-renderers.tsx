import React, { useState } from 'react';
import { Field, TextField } from "@measured/puck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Extend the Field type to include the properties we need
interface ExtendedField<T> {
  type: string;
  label?: string;
  defaultValue?: T;
  component?: React.ComponentType<any> | string;
  props?: Record<string, any>;
}

interface ArrayFieldProps<T> {
  value: T[];
  onChange: (value: T[]) => void;
  itemField: ExtendedField<T>;
  label?: string;
}

interface ObjectFieldProps<T> {
  value: T;
  onChange: (value: T) => void;
  fields: Record<keyof T, ExtendedField<any>>;
  label?: string;
}

function ArrayFieldRenderer<T>({ value = [], onChange, itemField, label }: ArrayFieldProps<T>) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddItem = () => {
    onChange([...value, itemField.defaultValue as T]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, newValue: T) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };

  return (
    <div className="space-y-2 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <Label className="font-medium">{label || 'Array'}</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="flex items-center space-x-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Item</span>
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {value.map((item, index) => (
            <div key={index} className="relative border rounded-md p-3 bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {React.createElement(itemField.component || 'input', {
                    value: item,
                    onChange: (newValue: T) => handleItemChange(index, newValue),
                    ...itemField.props
                  })}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ObjectFieldRenderer<T extends Record<string, any>>({ 
  value, 
  onChange, 
  fields,
  label 
}: ObjectFieldProps<T>) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (fieldName: keyof T, fieldValue: any) => {
    onChange({
      ...value,
      [fieldName]: fieldValue
    });
  };

  return (
    <div className="space-y-2 border rounded-md p-4">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-600 hover:text-slate-900"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        <Label className="font-medium">{label || 'Object'}</Label>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {Object.entries(fields).map(([fieldName, field]) => (
            <div key={fieldName} className="space-y-1">
              <Label className="text-sm">{field.label || fieldName}</Label>
              <div>
                {React.createElement(field.component || 'input', {
                  value: value[fieldName],
                  onChange: (newValue: any) => handleFieldChange(fieldName as keyof T, newValue),
                  ...field.props
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TableDataFieldRenderer({ 
  value = [], 
  onChange,
  headers = []
}: {
  value: { cells: string[] }[];
  onChange: (value: { cells: string[] }[]) => void;
  headers?: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddRow = () => {
    const newRow = { cells: Array(headers.length).fill('') };
    onChange([...value, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, newValue: string) => {
    const newData = [...value];
    newData[rowIndex] = {
      ...newData[rowIndex],
      cells: [...newData[rowIndex].cells]
    };
    newData[rowIndex].cells[cellIndex] = newValue;
    onChange(newData);
  };

  return (
    <div className="space-y-2 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <Label className="font-medium">Table Data</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="flex items-center space-x-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Row</span>
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          <div className="grid gap-2" style={{ 
            gridTemplateColumns: `repeat(${Math.max(headers.length, 1)}, 1fr)` 
          }}>
            {headers.map((header, index) => (
              <div key={index} className="font-medium text-sm text-center bg-slate-100 p-2 rounded">
                {header}
              </div>
            ))}
          </div>
          
          {value.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              <div className="grid gap-2" style={{ 
                gridTemplateColumns: `repeat(${Math.max(headers.length, 1)}, 1fr)` 
              }}>
                {row.cells.map((cell, cellIndex) => (
                  <Input
                    key={cellIndex}
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                    className="w-full"
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRow(rowIndex)}
                className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartDataFieldRenderer({
  value = { labels: [], values: [] },
  onChange
}: {
  value: { labels: string[]; values: number[] };
  onChange: (value: { labels: string[]; values: number[] }) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddItem = () => {
    onChange({
      labels: [...value.labels, ''],
      values: [...value.values, 0]
    });
  };

  const handleRemoveItem = (index: number) => {
    onChange({
      labels: value.labels.filter((_, i) => i !== index),
      values: value.values.filter((_, i) => i !== index)
    });
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const newLabels = [...value.labels];
    newLabels[index] = newLabel;
    onChange({ ...value, labels: newLabels });
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newValues = [...value.values];
    newValues[index] = parseFloat(newValue) || 0;
    onChange({ ...value, values: newValues });
  };

  return (
    <div className="space-y-2 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <Label className="font-medium">Chart Data</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="flex items-center space-x-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Data Point</span>
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {value.labels.map((label, index) => (
            <div key={index} className="relative grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Label</Label>
                <Input
                  value={label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm">Value</Label>
                <Input
                  type="number"
                  value={value.values[index]}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(index)}
                className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export {
  ArrayFieldRenderer,
  ObjectFieldRenderer,
  TableDataFieldRenderer,
  ChartDataFieldRenderer
}; 