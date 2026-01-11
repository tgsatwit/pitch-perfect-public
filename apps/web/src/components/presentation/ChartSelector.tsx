import React, { useState } from 'react';
import { FinancialChartType, generateSampleData } from './charts/FinancialCharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartSelectorProps {
  onChartSelected: (chartType: string, chartData: any) => void;
  onCancel: () => void;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  onChartSelected,
  onCancel
}) => {
  const [selectedTab, setSelectedTab] = useState<'standard' | 'financial'>('standard');
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [selectedFinancialChartType, setSelectedFinancialChartType] = useState<FinancialChartType>('bar');
  
  // Standard chart types
  const standardChartTypes = [
    { id: 'bar', name: 'Bar Chart' },
    { id: 'line', name: 'Line Chart' },
    { id: 'pie', name: 'Pie Chart' }
  ];
  
  // Financial chart types
  const financialChartTypes: { id: FinancialChartType; name: string; description: string }[] = [
    { id: 'bar', name: 'Bar Chart', description: 'For comparing values across categories' },
    { id: 'line', name: 'Line Chart', description: 'For showing trends over time' },
    { id: 'pie', name: 'Pie Chart', description: 'For showing proportions of a whole' },
    { id: 'area', name: 'Area Chart', description: 'For visualizing cumulative totals over time' },
    { id: 'comparison', name: 'Comparison Chart', description: 'For competitive analysis across metrics' },
    { id: 'growth', name: 'Growth Chart', description: 'For showing values and growth rates' },
    { id: 'forecast', name: 'Forecast Chart', description: 'For historical data and future projections' },
    { id: 'roi', name: 'ROI Chart', description: 'For return on investment visualization' },
    { id: 'cashflow', name: 'Cash Flow Chart', description: 'For inflows, outflows, and balance' }
  ];
  
  const handleSelectChart = () => {
    if (selectedTab === 'standard') {
      // For standard charts, use a basic data structure
      const sampleData = [
        { name: 'Category A', value: 400 },
        { name: 'Category B', value: 300 },
        { name: 'Category C', value: 200 },
        { name: 'Category D', value: 100 }
      ];
      
      onChartSelected(selectedChartType, sampleData);
    } else {
      // For financial charts, use the specialized data generator
      const chartData = generateSampleData(selectedFinancialChartType);
      onChartSelected(`financial-${selectedFinancialChartType}`, chartData);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-md border shadow-sm w-full max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-4">Select Chart Type</h3>
      
      <Tabs 
        defaultValue="standard" 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value as 'standard' | 'financial')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="standard-chart-type">Chart Type</Label>
            <Select
              value={selectedChartType}
              onValueChange={setSelectedChartType}
            >
              <SelectTrigger id="standard-chart-type">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {standardChartTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-slate-500 mb-2">
              Basic charts for general data visualization. Use for simple data comparisons.
            </p>
            
            {/* Chart preview image would go here */}
            <div className="h-32 border rounded-md bg-slate-50 flex items-center justify-center">
              <span className="text-sm text-slate-400">Chart Preview</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="financial-chart-type">Financial Chart Type</Label>
            <Select
              value={selectedFinancialChartType}
              onValueChange={(value) => setSelectedFinancialChartType(value as FinancialChartType)}
            >
              <SelectTrigger id="financial-chart-type">
                <SelectValue placeholder="Select financial chart type" />
              </SelectTrigger>
              <SelectContent>
                {financialChartTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2">
            {/* Description of the selected financial chart type */}
            <p className="text-sm text-slate-500 mb-2">
              {financialChartTypes.find(t => t.id === selectedFinancialChartType)?.description || 
              'Specialized financial charts for banking presentations.'}
            </p>
            
            {/* Chart preview image would go here */}
            <div className="h-32 border rounded-md bg-slate-50 flex items-center justify-center">
              <span className="text-sm text-slate-400">Chart Preview</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelectChart}
        >
          Insert Chart
        </Button>
      </div>
    </div>
  );
}; 