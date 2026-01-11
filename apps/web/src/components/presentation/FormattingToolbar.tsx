import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  ChevronDown,
  Type,
  Palette,
  MoveHorizontal,
  CircleDollarSign,
  BarChart,
  Percent,
  Plus,
  Minus,
  PieChart,
  ListOrdered,
  List,
  AlignVerticalJustifyCenter,
  CircleSlash,
  Check,
  RefreshCw,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Button,
  buttonVariants
} from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type FormattingOptions = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  padding?: number;
  lineHeight?: number;
  listType?: 'none' | 'bullet' | 'numbered' | 'checkmark';
  numberFormat?: 'none' | 'currency' | 'percent' | 'decimal';
  currencySymbol?: '$' | '€' | '£' | '¥';
  decimalPlaces?: number;
};

interface FormattingToolbarProps {
  options: FormattingOptions;
  onOptionsChange: (newOptions: Partial<FormattingOptions>) => void;
  selectedElementType?: 'text' | 'heading' | 'bullet' | 'chart' | 'image' | 'table';
  isFinancialElement?: boolean;
  onUndoClick?: () => void;
  onRedoClick?: () => void;
}

export function FormattingToolbar({
  options,
  onOptionsChange,
  selectedElementType,
  isFinancialElement,
  onUndoClick,
  onRedoClick
}: FormattingToolbarProps) {
  // Text formatting options
  const fontFamilyOptions = [
    "Arial, sans-serif",
    "Georgia, serif",
    "Tahoma, sans-serif",
    "Times New Roman, serif",
    "Verdana, sans-serif",
    "Helvetica, sans-serif",
    "Courier New, monospace"
  ];
  
  // Banking-specific number formatting presets
  const financialNumberFormats = [
    { name: "Currency", format: "currency", icon: <CircleDollarSign className="h-4 w-4" /> },
    { name: "Percentage", format: "percent", icon: <Percent className="h-4 w-4" /> },
    { name: "Decimal", format: "decimal", icon: <Type className="h-4 w-4" /> },
    { name: "None", format: "none", icon: <CircleSlash className="h-4 w-4" /> }
  ];
  
  // Financial styling presets
  const financialStylePresets = [
    { name: "Positive Value", color: "#047857", backgroundColor: "#ecfdf5", borderColor: "#10b981" },
    { name: "Negative Value", color: "#dc2626", backgroundColor: "#fef2f2", borderColor: "#ef4444" },
    { name: "Neutral Value", color: "#4b5563", backgroundColor: "#f3f4f6", borderColor: "#9ca3af" },
    { name: "Highlight", color: "#1e40af", backgroundColor: "#eff6ff", borderColor: "#3b82f6" },
    { name: "Warning", color: "#92400e", backgroundColor: "#fffbeb", borderColor: "#f59e0b" }
  ];
  
  // Banking-specific bullet point styles
  const listFormatOptions = [
    { name: "None", value: "none", icon: <CircleSlash className="h-4 w-4" /> },
    { name: "Bullets", value: "bullet", icon: <List className="h-4 w-4" /> },
    { name: "Numbered", value: "numbered", icon: <ListOrdered className="h-4 w-4" /> },
    { name: "Checkmarks", value: "checkmark", icon: <Check className="h-4 w-4" /> }
  ];

  return (
    <div className="bg-white border-b border-slate-200 p-1 flex items-center space-x-1 overflow-x-auto">
      {/* History controls */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onUndoClick}
        title="Undo"
      >
        <RefreshCw className="h-4 w-4 rotate-[225deg]" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onRedoClick}
        title="Redo"
      >
        <RefreshCw className="h-4 w-4 rotate-[135deg]" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Font family dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 flex gap-1 items-center text-xs font-normal"
          >
            <span className="max-w-24 truncate">
              {options.fontFamily?.split(',')[0] || 'Arial'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40">
          {fontFamilyOptions.map((font) => (
            <DropdownMenuItem 
              key={font}
              onClick={() => onOptionsChange({ fontFamily: font })}
              className="text-xs"
              style={{ fontFamily: font }}
            >
              {font.split(',')[0]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Font size */}
      <div className="flex items-center h-8 bg-white border rounded-md px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => onOptionsChange({ fontSize: Math.max(8, (options.fontSize || 14) - 1) })}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={options.fontSize || 14}
          onChange={(e) => onOptionsChange({ fontSize: parseInt(e.target.value) || 14 })}
          className="h-6 w-10 text-xs text-center border-none"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => onOptionsChange({ fontSize: Math.min(72, (options.fontSize || 14) + 1) })}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Basic text formatting */}
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", options.fontWeight === 'bold' && "bg-slate-100")}
          onClick={() => onOptionsChange({ fontWeight: options.fontWeight === 'bold' ? 'normal' : 'bold' })}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", options.fontStyle === 'italic' && "bg-slate-100")}
          onClick={() => onOptionsChange({ fontStyle: options.fontStyle === 'italic' ? 'normal' : 'italic' })}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", options.textDecoration === 'underline' && "bg-slate-100")}
          onClick={() => onOptionsChange({ textDecoration: options.textDecoration === 'underline' ? 'none' : 'underline' })}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Text alignment */}
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", options.textAlign === 'left' && "bg-slate-100")}
          onClick={() => onOptionsChange({ textAlign: 'left' })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", options.textAlign === 'center' && "bg-slate-100")}
          onClick={() => onOptionsChange({ textAlign: 'center' })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", options.textAlign === 'right' && "bg-slate-100")}
          onClick={() => onOptionsChange({ textAlign: 'right' })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        {selectedElementType === 'text' && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", options.textAlign === 'justify' && "bg-slate-100")}
            onClick={() => onOptionsChange({ textAlign: 'justify' })}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* List formatting (if applicable) */}
      {(selectedElementType === 'text' || selectedElementType === 'bullet') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              title="List formatting"
            >
              <List className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {listFormatOptions.map((format) => (
              <DropdownMenuItem 
                key={format.value}
                onClick={() => onOptionsChange({ listType: format.value as any })}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  options.listType === format.value && "bg-slate-100"
                )}
              >
                {format.icon}
                <span>{format.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Color pickers */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 flex items-center text-xs font-normal"
          >
            <div 
              className="h-4 w-4 rounded-sm border border-slate-200" 
              style={{ backgroundColor: options.color || '#000000' }}
            />
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <Tabs defaultValue="color">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="color">Text</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="border">Border</TabsTrigger>
            </TabsList>
            <TabsContent value="color" className="space-y-3 py-2">
              <div className="grid grid-cols-8 gap-1">
                {['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a855f7'].map((color) => (
                  <button
                    key={color}
                    className={cn("h-6 w-6 rounded-sm border border-slate-200", 
                      options.color === color && "ring-2 ring-indigo-500")}
                    style={{ backgroundColor: color }}
                    onClick={() => onOptionsChange({ color })}
                  />
                ))}
              </div>
              <div className="flex">
                <Input
                  type="color"
                  value={options.color || '#000000'}
                  onChange={(e) => onOptionsChange({ color: e.target.value })}
                  className="h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={options.color || '#000000'}
                  onChange={(e) => onOptionsChange({ color: e.target.value })}
                  className="h-8 text-xs ml-2"
                />
              </div>
            </TabsContent>
            <TabsContent value="background" className="space-y-3 py-2">
              <div className="grid grid-cols-8 gap-1">
                {['transparent', '#ffffff', '#f8fafc', '#f1f5f9', '#eff6ff', '#ecfdf5', '#fffbeb', '#fef2f2'].map((color) => (
                  <button
                    key={color}
                    className={cn("h-6 w-6 rounded-sm border border-slate-200", 
                      options.backgroundColor === color && "ring-2 ring-indigo-500",
                      color === 'transparent' && "bg-transparent relative")}
                    style={{ backgroundColor: color }}
                    onClick={() => onOptionsChange({ backgroundColor: color })}
                  >
                    {color === 'transparent' && <CircleSlash className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400" />}
                  </button>
                ))}
              </div>
              <div className="flex">
                <Input
                  type="color"
                  value={options.backgroundColor || '#ffffff'}
                  onChange={(e) => onOptionsChange({ backgroundColor: e.target.value })}
                  className="h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={options.backgroundColor || 'transparent'}
                  onChange={(e) => onOptionsChange({ backgroundColor: e.target.value })}
                  className="h-8 text-xs ml-2"
                />
              </div>
            </TabsContent>
            <TabsContent value="border" className="py-2 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Border Style</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("px-2 py-1 text-xs h-7", options.borderStyle === 'none' && "bg-slate-100")}
                    onClick={() => onOptionsChange({ borderStyle: 'none' })}
                  >
                    None
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("px-2 py-1 text-xs h-7", options.borderStyle === 'solid' && "bg-slate-100")}
                    onClick={() => onOptionsChange({ borderStyle: 'solid' })}
                  >
                    Solid
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("px-2 py-1 text-xs h-7", options.borderStyle === 'dashed' && "bg-slate-100")}
                    onClick={() => onOptionsChange({ borderStyle: 'dashed' })}
                  >
                    Dashed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("px-2 py-1 text-xs h-7", options.borderStyle === 'dotted' && "bg-slate-100")}
                    onClick={() => onOptionsChange({ borderStyle: 'dotted' })}
                  >
                    Dotted
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Border Width</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[options.borderWidth || 0]}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={(value) => onOptionsChange({ borderWidth: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-center">{options.borderWidth || 0}px</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Border Color</Label>
                <div className="flex">
                  <Input
                    type="color"
                    value={options.borderColor || '#000000'}
                    onChange={(e) => onOptionsChange({ borderColor: e.target.value })}
                    className="h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={options.borderColor || '#000000'}
                    onChange={(e) => onOptionsChange({ borderColor: e.target.value })}
                    className="h-8 text-xs ml-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Financial styling presets (if applicable) */}
          {isFinancialElement && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <Label className="text-xs">Financial Styling Presets</Label>
                <div className="grid grid-cols-2 gap-1">
                  {financialStylePresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      style={{
                        color: preset.color,
                        backgroundColor: preset.backgroundColor,
                        borderColor: preset.borderColor
                      }}
                      onClick={() => onOptionsChange({
                        color: preset.color,
                        backgroundColor: preset.backgroundColor,
                        borderColor: preset.borderColor,
                        borderWidth: 1,
                        borderStyle: 'solid'
                      })}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
      
      {/* Number formatting (for financial elements) */}
      {isFinancialElement && (
        <>
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1 flex items-center text-xs font-normal"
                title="Number formatting"
              >
                <CircleDollarSign className="h-4 w-4" />
                <span>Format</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Number Format</Label>
                  <RadioGroup 
                    value={options.numberFormat || 'none'}
                    onValueChange={(value) => onOptionsChange({ numberFormat: value as any })}
                    className="grid grid-cols-2 gap-2"
                  >
                    {financialNumberFormats.map((format) => (
                      <div key={format.format} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={format.format} 
                          id={`format-${format.format}`}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`format-${format.format}`} className="text-xs flex items-center gap-1">
                          {format.icon}
                          <span>{format.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {options.numberFormat === 'currency' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Currency Symbol</Label>
                    <div className="flex gap-1">
                      {['$', '€', '£', '¥'].map((symbol) => (
                        <Button
                          key={symbol}
                          variant="outline"
                          size="sm"
                          className={cn("px-2 py-1 text-xs h-7", options.currencySymbol === symbol && "bg-slate-100")}
                          onClick={() => onOptionsChange({ currencySymbol: symbol as any })}
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-xs">Decimal Places</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[options.decimalPlaces || 0]}
                      min={0}
                      max={4}
                      step={1}
                      onValueChange={(value) => onOptionsChange({ decimalPlaces: value[0] })}
                      className="flex-1"
                    />
                    <span className="text-xs w-8 text-center">{options.decimalPlaces || 0}</span>
                  </div>
                </div>
                
                {/* Examples */}
                <div className="space-y-1 bg-slate-50 p-2 rounded-md text-xs">
                  <div className="font-medium">Examples:</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div>1234.56</div>
                    <div>
                      {options.numberFormat === 'currency' && options.currencySymbol}
                      {options.numberFormat === 'currency' ? '1,234' : options.numberFormat === 'percent' ? '1,234' : '1,234'}
                      {options.decimalPlaces > 0 && `.${Array(options.decimalPlaces).fill('0').join('')}`}
                      {options.numberFormat === 'percent' && '%'}
                    </div>
                    <div>-5678.9</div>
                    <div>
                      {options.numberFormat === 'currency' && options.currencySymbol}
                      {options.numberFormat === 'currency' ? '-5,678' : options.numberFormat === 'percent' ? '-5,678' : '-5,678'}
                      {options.decimalPlaces > 0 && `.${Array(options.decimalPlaces).fill('0').join('')}`}
                      {options.numberFormat === 'percent' && '%'}
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
      
      {/* Spacing and Alignment */}
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 flex items-center text-xs font-normal"
            title="Spacing and alignment"
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
            <span>Spacing</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Padding</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[options.padding || 0]}
                  min={0}
                  max={30}
                  step={2}
                  onValueChange={(value) => onOptionsChange({ padding: value[0] })}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-center">{options.padding || 0}px</span>
              </div>
            </div>
            
            {(selectedElementType === 'text' || selectedElementType === 'bullet') && (
              <div className="space-y-2">
                <Label className="text-xs">Line Height</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[options.lineHeight || 1.2]}
                    min={1}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => onOptionsChange({ lineHeight: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-center">{options.lineHeight || 1.2}</span>
                </div>
              </div>
            )}
            
            {selectedElementType !== 'chart' && (
              <div className="space-y-2">
                <Label className="text-xs">Border Radius</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[options.borderRadius || 0]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => onOptionsChange({ borderRadius: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-center">{options.borderRadius || 0}px</span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default FormattingToolbar; 