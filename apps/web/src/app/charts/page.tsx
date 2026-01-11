"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState } from 'react';
import { 
  FinancialChart, 
  FinancialChartType, 
  generateSampleData 
} from '@/components/presentation/charts/FinancialCharts';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export default function ChartsDemo() {
  const [selectedChartType, setSelectedChartType] = useState<FinancialChartType>('bar');
  const [currency, setCurrency] = useState('$');
  const [showLegend, setShowLegend] = useState(true);
  const [stacked, setStacked] = useState(false);
  
  // Get sample data for the selected chart type
  const chartData = generateSampleData(selectedChartType);
  
  // All available chart types
  const chartTypes: FinancialChartType[] = [
    'bar',
    'line',
    'pie',
    'area',
    'comparison',
    'growth',
    'forecast',
    'roi',
    'cashflow'
  ];
  
  // Chart type descriptions for the UI
  const chartDescriptions: Record<FinancialChartType, string> = {
    'bar': 'Standard bar chart for comparing values across categories.',
    'line': 'Line chart for showing trends over time periods.',
    'pie': 'Pie chart for showing proportions of a whole.',
    'area': 'Area chart for visualizing cumulative totals over time.',
    'comparison': 'Specialized chart for competitor comparison across metrics.',
    'growth': 'Combined chart showing absolute values and growth percentages.',
    'forecast': 'Projection chart with historical data and future forecasts.',
    'roi': 'Return on Investment chart showing investments and returns over time.',
    'cashflow': 'Cash flow chart showing inflows, outflows, and balance.'
  };
  
  // Business use cases for each chart type
  const businessUseCases: Record<FinancialChartType, string[]> = {
    'bar': [
      'Quarterly revenue comparisons',
      'Performance by department or product line',
      'Comparing metrics across different time periods'
    ],
    'line': [
      'Monthly account growth trends',
      'Interest rate fluctuations over time',
      'Customer acquisition metrics'
    ],
    'pie': [
      'Revenue breakdown by product category',
      'Loan portfolio distribution',
      'Market share analysis'
    ],
    'area': [
      'Cumulative returns over investment periods',
      'Asset growth over time',
      'Total customer base expansion'
    ],
    'comparison': [
      'Competitive analysis of banking services',
      'Benchmarking against industry standards',
      'Fee structure comparisons'
    ],
    'growth': [
      'Year-over-year growth reporting',
      'Performance evaluation with growth metrics',
      'Investment portfolio performance'
    ],
    'forecast': [
      'Revenue or account growth projections',
      'Market trend predictions',
      'Budget planning visualizations'
    ],
    'roi': [
      'Investment proposal evaluations',
      'Project return expectations',
      'Long-term value demonstrations'
    ],
    'cashflow': [
      'Cash management analysis',
      'Liquidity planning',
      'Operational expense tracking'
    ]
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Banking Financial Visualizations</h1>
      <p className="text-slate-600 mb-8">
        Advanced chart components designed specifically for banking and financial services presentations.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar with controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Options</CardTitle>
              <CardDescription>Customize the financial visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select
                  value={selectedChartType}
                  onValueChange={(value) => setSelectedChartType(value as FinancialChartType)}
                >
                  <SelectTrigger id="chart-type">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency Symbol</Label>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (USD)</SelectItem>
                    <SelectItem value="€">€ (EUR)</SelectItem>
                    <SelectItem value="£">£ (GBP)</SelectItem>
                    <SelectItem value="¥">¥ (JPY/CNY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-legend">Show Legend</Label>
                <Switch
                  id="show-legend"
                  checked={showLegend}
                  onCheckedChange={setShowLegend}
                />
              </div>
              
              {(selectedChartType === 'bar' || selectedChartType === 'area') && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="stacked">Stacked Display</Label>
                  <Switch
                    id="stacked"
                    checked={stacked}
                    onCheckedChange={setStacked}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Chart Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {chartDescriptions[selectedChartType]}
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Common Use Cases:</h4>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {businessUseCases[selectedChartType].map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main chart display area */}
        <div className="md:col-span-2">
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>
                {selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart
              </CardTitle>
              <CardDescription>
                Sample banking data visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-[400px]">
                <FinancialChart
                  type={selectedChartType}
                  data={chartData}
                  currency={currency}
                  showLegend={showLegend}
                  stacked={stacked}
                  title={`Sample ${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart`}
                  subtitle="For demonstration purposes only"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                This chart uses sample data. In a real application, you would connect to your actual financial data.
              </p>
            </CardFooter>
          </Card>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Additional Examples</h3>
            <Tabs defaultValue="banking">
              <TabsList className="mb-4">
                <TabsTrigger value="banking">Banking Dashboard</TabsTrigger>
                <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Competitive Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="banking" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Loan Portfolio Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <FinancialChart
                          type="area"
                          data={generateSampleData('area')}
                          currency={currency}
                          showLegend={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Revenue by Service Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <FinancialChart
                          type="pie"
                          data={generateSampleData('pie')}
                          currency={currency}
                          showLegend={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="investment" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">ROI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <FinancialChart
                          type="roi"
                          data={generateSampleData('roi')}
                          currency={currency}
                          showLegend={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Future Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <FinancialChart
                          type="forecast"
                          data={generateSampleData('forecast')}
                          currency={currency}
                          showLegend={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Competitive Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <FinancialChart
                        type="comparison"
                        data={generateSampleData('comparison')}
                        currency={currency}
                        showLegend={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 