import React from 'react';
import { 
  PanelRight, 
  Layers, 
  Square, 
  MoveHorizontal, 
  MoveVertical,
  PanelLeftClose,
  Info,
  Settings,
  Pencil,
  AlignLeft,
  AlignRight,
  AlignCenter,
  AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { FormattingOptions } from './FormattingToolbar';
import { AlignmentControls } from './AlignmentControls';

export interface ElementProperties {
  id: string;
  type: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  styling?: FormattingOptions;
  isLocked?: boolean;
  isHidden?: boolean;
  animations?: ElementAnimation[];
}

interface ElementAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce';
  duration: number;
  delay: number;
  easing?: string;
  direction?: string;
}

interface PropertiesPanelProps {
  selectedElement?: ElementProperties;
  onPropertyChange: (property: string, value: any) => void;
  onStyleChange: (styling: Partial<FormattingOptions>) => void;
  onAnimationAdd: (animation: ElementAnimation) => void;
  onAnimationRemove: (index: number) => void;
  onAnimationUpdate: (index: number, animation: Partial<ElementAnimation>) => void;
  onAlignElement: (horizontalAlignment: string) => void;
  onAlignElementVertical: (verticalAlignment: string) => void;
  onBringForward: () => void;
  onBringToFront: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onMoveElement: (direction: 'up' | 'down' | 'left' | 'right', amount: number) => void;
  isGridEnabled?: boolean;
  onToggleGrid?: () => void;
  gridSize?: number;
  onChangeGridSize?: (size: number) => void;
}

export function PropertiesPanel({
  selectedElement,
  onPropertyChange,
  onStyleChange,
  onAnimationAdd,
  onAnimationRemove,
  onAnimationUpdate,
  onAlignElement,
  onAlignElementVertical,
  onBringForward,
  onBringToFront,
  onSendBackward,
  onSendToBack,
  onMoveElement,
  isGridEnabled,
  onToggleGrid,
  gridSize,
  onChangeGridSize
}: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="bg-white border-l border-slate-200 w-72 h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center">
          <PanelRight className="text-slate-400 h-5 w-5 mr-2" />
          <h3 className="text-sm font-medium text-slate-700">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-4 text-center">
          <div>
            <Square className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Select an element to view and edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is a financial element that needs specialized formatting
  const isFinancialElement = selectedElement.type === 'table' || 
                            selectedElement.type === 'chart' || 
                            selectedElement.type.includes('financial');

  // Map element type to a more friendly display name
  const getElementTypeName = (type: string) => {
    switch (type) {
      case 'text': return 'Text Box';
      case 'heading': return 'Heading';
      case 'image': return 'Image';
      case 'chart': return 'Chart';
      case 'table': return 'Table';
      case 'shape': return 'Shape';
      case 'bullet': return 'Bullet List';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="bg-white border-l border-slate-200 w-72 h-full flex flex-col">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center">
          <PanelRight className="text-slate-400 h-5 w-5 mr-2" />
          <h3 className="text-sm font-medium text-slate-700">Properties</h3>
        </div>
        <div className="text-xs text-slate-500">
          {getElementTypeName(selectedElement.type)}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="position">
          <TabsList className="w-full border-b border-slate-200 px-4 pt-2">
            <TabsTrigger value="position" className="flex gap-1 items-center text-xs h-8">
              <MoveHorizontal className="h-3.5 w-3.5" />
              <span>Position</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="flex gap-1 items-center text-xs h-8">
              <Pencil className="h-3.5 w-3.5" />
              <span>Style</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-1 items-center text-xs h-8">
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Position & Size Tab */}
          <TabsContent value="position" className="px-4 py-3 space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Element Name</Label>
              <Input 
                type="text" 
                value={selectedElement.name || ''}
                onChange={(e) => onPropertyChange('name', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            
            {/* Position */}
            <div>
              <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">X</Label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      value={Math.round(selectedElement.x)} 
                      onChange={(e) => onPropertyChange('x', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs ml-1">px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Y</Label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      value={Math.round(selectedElement.y)} 
                      onChange={(e) => onPropertyChange('y', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs ml-1">px</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Size */}
            <div>
              <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Width</Label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      value={Math.round(selectedElement.width)} 
                      onChange={(e) => onPropertyChange('width', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs ml-1">px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Height</Label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      value={Math.round(selectedElement.height)} 
                      onChange={(e) => onPropertyChange('height', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs ml-1">px</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rotation & Opacity */}
            <div>
              <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Appearance</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Rotation</Label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      value={selectedElement.rotation || 0} 
                      onChange={(e) => onPropertyChange('rotation', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs ml-1">°</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Opacity</Label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      min="0"
                      max="100"
                      value={(selectedElement.opacity || 1) * 100} 
                      onChange={(e) => onPropertyChange('opacity', Number(e.target.value) / 100)}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs ml-1">%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alignment Controls */}
            <Separator className="my-4" />
            
            <AlignmentControls 
              onAlignHorizontal={onAlignElement}
              onAlignVertical={onAlignElementVertical}
              onMoveElement={onMoveElement}
              onBringForward={onBringForward}
              onBringToFront={onBringToFront}
              onSendBackward={onSendBackward}
              onSendToBack={onSendToBack}
              isGridEnabled={isGridEnabled}
              onToggleGrid={onToggleGrid}
              gridSize={gridSize}
              onChangeGridSize={onChangeGridSize}
            />
          </TabsContent>
          
          {/* Style & Formatting Tab */}
          <TabsContent value="style" className="px-4 py-3 space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="text-formatting" className="border-b pb-0">
                <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline">
                  Text Formatting
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Font Family</Label>
                      <select
                        value={selectedElement.styling?.fontFamily || 'Arial, sans-serif'}
                        onChange={(e) => onStyleChange({ fontFamily: e.target.value })}
                        className="w-full h-8 text-xs rounded-md border border-slate-200 px-2"
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Tahoma, sans-serif">Tahoma</option>
                        <option value="Times New Roman, serif">Times New Roman</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-500 mb-1 block">Font Size</Label>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            value={selectedElement.styling?.fontSize || 14} 
                            onChange={(e) => onStyleChange({ fontSize: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                          <span className="text-xs ml-1">px</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-slate-500 mb-1 block">Line Height</Label>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            step="0.1"
                            value={selectedElement.styling?.lineHeight || 1.2} 
                            onChange={(e) => onStyleChange({ lineHeight: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                          <span className="text-xs ml-1">×</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-xs ${selectedElement.styling?.fontWeight === 'bold' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ 
                          fontWeight: selectedElement.styling?.fontWeight === 'bold' ? 'normal' : 'bold' 
                        })}
                      >
                        Bold
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-xs ${selectedElement.styling?.fontStyle === 'italic' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ 
                          fontStyle: selectedElement.styling?.fontStyle === 'italic' ? 'normal' : 'italic' 
                        })}
                      >
                        Italic
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-xs ${selectedElement.styling?.textDecoration === 'underline' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ 
                          textDecoration: selectedElement.styling?.textDecoration === 'underline' ? 'none' : 'underline' 
                        })}
                      >
                        Underline
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 p-0 ${selectedElement.styling?.textAlign === 'left' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ textAlign: 'left' })}
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 p-0 ${selectedElement.styling?.textAlign === 'center' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ textAlign: 'center' })}
                      >
                        <AlignCenter className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 p-0 ${selectedElement.styling?.textAlign === 'right' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ textAlign: 'right' })}
                      >
                        <AlignRight className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 p-0 ${selectedElement.styling?.textAlign === 'justify' ? 'bg-slate-100' : ''}`}
                        onClick={() => onStyleChange({ textAlign: 'justify' })}
                      >
                        <AlignJustify className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="colors" className="border-b pb-0">
                <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline">
                  Colors
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Text Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="h-6 w-6 rounded-md border border-slate-200 cursor-pointer" 
                          style={{ backgroundColor: selectedElement.styling?.color || '#000000' }}
                        />
                        <Input 
                          type="color" 
                          value={selectedElement.styling?.color || '#000000'} 
                          onChange={(e) => onStyleChange({ color: e.target.value })}
                          className="h-6 w-20 p-0 border-0"
                        />
                        <Input 
                          type="text" 
                          value={selectedElement.styling?.color || '#000000'} 
                          onChange={(e) => onStyleChange({ color: e.target.value })}
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Background Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="h-6 w-6 rounded-md border border-slate-200 cursor-pointer" 
                          style={{ backgroundColor: selectedElement.styling?.backgroundColor || 'transparent' }}
                        />
                        <Input 
                          type="color" 
                          value={selectedElement.styling?.backgroundColor || '#ffffff'} 
                          onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                          className="h-6 w-20 p-0 border-0"
                        />
                        <Input 
                          type="text" 
                          value={selectedElement.styling?.backgroundColor || 'transparent'} 
                          onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    </div>
                    
                    {isFinancialElement && (
                      <div>
                        <Label className="text-xs text-slate-500 mb-1 block">Financial Styling</Label>
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-green-700 bg-green-50"
                            onClick={() => onStyleChange({
                              color: '#047857',
                              backgroundColor: '#ecfdf5',
                              borderColor: '#10b981',
                              borderWidth: 1,
                              borderStyle: 'solid'
                            })}
                          >
                            Positive Value
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-700 bg-red-50"
                            onClick={() => onStyleChange({
                              color: '#dc2626',
                              backgroundColor: '#fef2f2',
                              borderColor: '#ef4444',
                              borderWidth: 1,
                              borderStyle: 'solid'
                            })}
                          >
                            Negative Value
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-blue-700 bg-blue-50"
                            onClick={() => onStyleChange({
                              color: '#1e40af',
                              backgroundColor: '#eff6ff',
                              borderColor: '#3b82f6',
                              borderWidth: 1,
                              borderStyle: 'solid'
                            })}
                          >
                            Highlight
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-gray-700 bg-gray-50"
                            onClick={() => onStyleChange({
                              color: '#4b5563',
                              backgroundColor: '#f3f4f6',
                              borderColor: '#9ca3af',
                              borderWidth: 1,
                              borderStyle: 'solid'
                            })}
                          >
                            Neutral
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="border" className="border-b pb-0">
                <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline">
                  Border & Spacing
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Border Style</Label>
                      <select
                        value={selectedElement.styling?.borderStyle || 'none'}
                        onChange={(e) => onStyleChange({ borderStyle: e.target.value as any })}
                        className="w-full h-8 text-xs rounded-md border border-slate-200 px-2"
                      >
                        <option value="none">None</option>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                    </div>
                    
                    {selectedElement.styling?.borderStyle && selectedElement.styling.borderStyle !== 'none' && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Border Width</Label>
                            <div className="flex items-center">
                              <Input 
                                type="number" 
                                value={selectedElement.styling?.borderWidth || 1} 
                                onChange={(e) => onStyleChange({ borderWidth: Number(e.target.value) })}
                                className="h-8 text-xs"
                              />
                              <span className="text-xs ml-1">px</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Border Radius</Label>
                            <div className="flex items-center">
                              <Input 
                                type="number" 
                                value={selectedElement.styling?.borderRadius || 0} 
                                onChange={(e) => onStyleChange({ borderRadius: Number(e.target.value) })}
                                className="h-8 text-xs"
                              />
                              <span className="text-xs ml-1">px</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Border Color</Label>
                          <div className="flex gap-2">
                            <div 
                              className="h-6 w-6 rounded-md border border-slate-200 cursor-pointer" 
                              style={{ backgroundColor: selectedElement.styling?.borderColor || '#000000' }}
                            />
                            <Input 
                              type="color" 
                              value={selectedElement.styling?.borderColor || '#000000'} 
                              onChange={(e) => onStyleChange({ borderColor: e.target.value })}
                              className="h-6 w-20 p-0 border-0"
                            />
                            <Input 
                              type="text" 
                              value={selectedElement.styling?.borderColor || '#000000'} 
                              onChange={(e) => onStyleChange({ borderColor: e.target.value })}
                              className="h-8 text-xs flex-1"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Padding</Label>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          value={selectedElement.styling?.padding || 0} 
                          onChange={(e) => onStyleChange({ padding: Number(e.target.value) })}
                          className="h-8 text-xs"
                        />
                        <span className="text-xs ml-1">px</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {isFinancialElement && (
                <AccordionItem value="financial-formatting" className="border-b pb-0">
                  <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline">
                    Financial Formatting
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-slate-500 mb-1 block">Number Format</Label>
                        <select
                          value={selectedElement.styling?.numberFormat || 'none'}
                          onChange={(e) => onStyleChange({ numberFormat: e.target.value as any })}
                          className="w-full h-8 text-xs rounded-md border border-slate-200 px-2"
                        >
                          <option value="none">None</option>
                          <option value="currency">Currency</option>
                          <option value="percent">Percentage</option>
                          <option value="decimal">Decimal</option>
                        </select>
                      </div>
                      
                      {selectedElement.styling?.numberFormat === 'currency' && (
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Currency Symbol</Label>
                          <select
                            value={selectedElement.styling?.currencySymbol || '$'}
                            onChange={(e) => onStyleChange({ currencySymbol: e.target.value as any })}
                            className="w-full h-8 text-xs rounded-md border border-slate-200 px-2"
                          >
                            <option value="$">$ (Dollar)</option>
                            <option value="€">€ (Euro)</option>
                            <option value="£">£ (Pound)</option>
                            <option value="¥">¥ (Yen)</option>
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-xs text-slate-500 mb-1 block">Decimal Places</Label>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            min="0"
                            max="4"
                            value={selectedElement.styling?.decimalPlaces || 0} 
                            onChange={(e) => onStyleChange({ decimalPlaces: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      {/* Example of formatted value */}
                      <div className="bg-slate-50 p-2 rounded-md">
                        <Label className="text-xs text-slate-500 mb-1 block">Example:</Label>
                        <div className="text-sm">
                          {selectedElement.styling?.numberFormat === 'currency' && selectedElement.styling?.currencySymbol}
                          1,234
                          {selectedElement.styling?.decimalPlaces > 0 && 
                            `.${Array(selectedElement.styling.decimalPlaces).fill('0').join('')}`}
                          {selectedElement.styling?.numberFormat === 'percent' && '%'}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </TabsContent>
          
          {/* Settings & Animations Tab */}
          <TabsContent value="settings" className="px-4 py-3 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Visible</Label>
                <Switch 
                  checked={!selectedElement.isHidden}
                  onCheckedChange={(checked) => onPropertyChange('isHidden', !checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Locked</Label>
                <Switch 
                  checked={selectedElement.isLocked || false}
                  onCheckedChange={(checked) => onPropertyChange('isLocked', checked)}
                />
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Z-Index</Label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    value={selectedElement.zIndex || 0} 
                    onChange={(e) => onPropertyChange('zIndex', Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium text-slate-500">Animations</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs"
                    onClick={() => onAnimationAdd({
                      type: 'fade',
                      duration: 1000,
                      delay: 0,
                      easing: 'ease'
                    })}
                  >
                    Add
                  </Button>
                </div>
                
                {selectedElement.animations && selectedElement.animations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedElement.animations.map((animation, index) => (
                      <div key={index} className="bg-slate-50 p-2 rounded-md text-xs">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">Animation {index + 1}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                            onClick={() => onAnimationRemove(index)}
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Type</Label>
                            <select
                              value={animation.type}
                              onChange={(e) => onAnimationUpdate(index, { type: e.target.value as any })}
                              className="w-full h-7 text-xs rounded-md border border-slate-200 px-2"
                            >
                              <option value="fade">Fade</option>
                              <option value="slide">Slide</option>
                              <option value="zoom">Zoom</option>
                              <option value="bounce">Bounce</option>
                            </select>
                          </div>
                          
                          {animation.type === 'slide' && (
                            <div>
                              <Label className="text-xs text-slate-500 mb-1 block">Direction</Label>
                              <select
                                value={animation.direction || 'left'}
                                onChange={(e) => onAnimationUpdate(index, { direction: e.target.value })}
                                className="w-full h-7 text-xs rounded-md border border-slate-200 px-2"
                              >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                              </select>
                            </div>
                          )}
                          
                          <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Duration</Label>
                            <div className="flex items-center">
                              <Input 
                                type="number" 
                                value={animation.duration} 
                                onChange={(e) => onAnimationUpdate(index, { duration: Number(e.target.value) })}
                                className="h-7 text-xs"
                              />
                              <span className="text-xs ml-1">ms</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Delay</Label>
                            <div className="flex items-center">
                              <Input 
                                type="number" 
                                value={animation.delay} 
                                onChange={(e) => onAnimationUpdate(index, { delay: Number(e.target.value) })}
                                className="h-7 text-xs"
                              />
                              <span className="text-xs ml-1">ms</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Easing</Label>
                            <select
                              value={animation.easing || 'ease'}
                              onChange={(e) => onAnimationUpdate(index, { easing: e.target.value })}
                              className="w-full h-7 text-xs rounded-md border border-slate-200 px-2"
                            >
                              <option value="ease">Ease</option>
                              <option value="linear">Linear</option>
                              <option value="ease-in">Ease In</option>
                              <option value="ease-out">Ease Out</option>
                              <option value="ease-in-out">Ease In Out</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-2">
                    No animations added
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PropertiesPanel; 