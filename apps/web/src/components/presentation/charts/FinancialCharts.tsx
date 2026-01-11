import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Scatter
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Define financial chart types that extend the basic chart types
export type FinancialChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'area'
  | 'comparison'
  | 'growth'
  | 'forecast'
  | 'roi'
  | 'cashflow';

interface FinancialChartProps {
  type: FinancialChartType;
  data: any;
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
  colors?: string[];
  currency?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  animated?: boolean;
}

// Default colors specifically chosen for financial presentations
const defaultColors = [
  '#1F77B4', // Blue
  '#2CA02C', // Green
  '#FF7F0E', // Orange
  '#D62728', // Red
  '#9467BD', // Purple
  '#8C564B', // Brown
  '#E377C2', // Pink
  '#7F7F7F', // Gray
  '#BCBD22', // Olive
  '#17BECF'  // Cyan
];

// Banking-specific financial palette
const bankingColors = [
  '#003F87', // Deep blue
  '#0070C0', // Corporate blue
  '#428BCA', // Light blue
  '#5CB85C', // Success green
  '#D9534F', // Alert red
  '#F0AD4E', // Warning yellow
  '#6F42C1', // Purple
  '#20C997', // Teal
  '#6C757D', // Gray
  '#343A40'  // Dark gray
];

export const FinancialChart: React.FC<FinancialChartProps> = ({
  type,
  data,
  width = 600,
  height = 300,
  title,
  subtitle,
  colors = bankingColors,
  currency = '$',
  showLegend = true,
  showTooltip = true,
  stacked = false,
  animated = true
}) => {
  // Helper for formatting currency values in tooltips and axes
  const formatValue = (value: number) => {
    return formatCurrency(value, currency);
  };

  // Format for percentages
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Common tooltip formatter for consistent formatting
  const tooltipFormatter = (value: number, name: string) => {
    if (name.toLowerCase().includes('percent') || name.toLowerCase().includes('rate')) {
      return [formatPercent(value), name];
    }
    return [formatValue(value), name];
  };

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatValue} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            {renderBarSeries()}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatValue} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            {renderLineSeries()}
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart
            width={width}
            height={height}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <Pie
              data={data}
              cx={width / 2}
              cy={height / 2}
              labelLine={true}
              outerRadius={height / 3}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatValue} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            {renderAreaSeries()}
          </AreaChart>
        );

      case 'comparison':
        return (
          <BarChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatValue} />
            <YAxis dataKey="name" type="category" />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            {renderComparisonSeries()}
          </BarChart>
        );

      case 'growth':
        return (
          <ComposedChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" tickFormatter={formatValue} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatPercent} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            <Bar yAxisId="left" dataKey="value" fill={colors[0]} />
            <Line yAxisId="right" type="monotone" dataKey="growth" stroke={colors[1]} />
          </ComposedChart>
        );

      case 'forecast':
        // Split data into historical and forecast parts
        const historicalData = data.filter((d: any) => !d.forecast);
        const forecastData = data.filter((d: any) => d.forecast);
        const lastHistoricalPoint = historicalData[historicalData.length - 1];
        
        return (
          <ComposedChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatValue} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            
            {/* Historical data as solid line */}
            <Line
              dataKey="value"
              data={historicalData}
              type="monotone"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            
            {/* Forecast data as dashed line */}
            <Line
              dataKey="value"
              data={[lastHistoricalPoint, ...forecastData]}
              type="monotone"
              stroke={colors[0]}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            
            {/* Forecast range (optional) */}
            {data[0].hasOwnProperty('upperBound') && (
              <Area
                dataKey="upperBound"
                data={forecastData}
                stroke="none"
                fill={colors[0]}
                fillOpacity={0.1}
              />
            )}
            {data[0].hasOwnProperty('lowerBound') && (
              <Area
                dataKey="lowerBound"
                data={forecastData}
                stroke="none"
                fill={colors[0]}
                fillOpacity={0.1}
              />
            )}
          </ComposedChart>
        );

      case 'roi':
        return (
          <ComposedChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" tickFormatter={formatValue} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatPercent} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            <Bar yAxisId="left" dataKey="investment" fill={colors[0]} />
            <Bar yAxisId="left" dataKey="return" fill={colors[1]} />
            <Line yAxisId="right" type="monotone" dataKey="roi" stroke={colors[2]} />
          </ComposedChart>
        );

      case 'cashflow':
        return (
          <ComposedChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatValue} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            <Bar dataKey="inflow" stackId="a" fill={colors[1]} />
            <Bar dataKey="outflow" stackId="a" fill={colors[0]} />
            <Line type="monotone" dataKey="balance" stroke={colors[2]} />
          </ComposedChart>
        );

      default:
        return (
          <div className="flex items-center justify-center w-full h-full border border-dashed border-gray-300 rounded-md">
            <p className="text-gray-500">Chart type not supported</p>
          </div>
        );
    }
  };

  // Helper to render bar series based on data structure
  const renderBarSeries = () => {
    // If data has a 'value' property, render a single bar
    if (data[0]?.value !== undefined) {
      return <Bar dataKey="value" fill={colors[0]} />;
    }

    // Otherwise, identify all possible data keys (excluding 'name') and render a bar for each
    const keys = Object.keys(data[0] || {}).filter(key => key !== 'name');
    return keys.map((key, index) => (
      <Bar 
        key={key} 
        dataKey={key} 
        fill={colors[index % colors.length]} 
        stackId={stacked ? "stack" : undefined}
      />
    ));
  };

  // Helper to render line series based on data structure
  const renderLineSeries = () => {
    // If data has a 'value' property, render a single line
    if (data[0]?.value !== undefined) {
      return <Line type="monotone" dataKey="value" stroke={colors[0]} activeDot={{ r: 8 }} />;
    }

    // Otherwise, identify all possible data keys (excluding 'name') and render a line for each
    const keys = Object.keys(data[0] || {}).filter(key => key !== 'name');
    return keys.map((key, index) => (
      <Line 
        key={key} 
        type="monotone" 
        dataKey={key} 
        stroke={colors[index % colors.length]} 
        activeDot={{ r: 8 }}
      />
    ));
  };

  // Helper to render area series based on data structure
  const renderAreaSeries = () => {
    // If data has a 'value' property, render a single area
    if (data[0]?.value !== undefined) {
      return <Area type="monotone" dataKey="value" fill={colors[0]} stroke={colors[0]} />;
    }

    // Otherwise, identify all possible data keys (excluding 'name') and render an area for each
    const keys = Object.keys(data[0] || {}).filter(key => key !== 'name');
    return keys.map((key, index) => (
      <Area 
        key={key} 
        type="monotone" 
        dataKey={key} 
        fill={colors[index % colors.length]} 
        stroke={colors[index % colors.length]}
        stackId={stacked ? "stack" : undefined}
      />
    ));
  };

  // Helper to render comparison series for competitive analysis
  const renderComparisonSeries = () => {
    // For competitor comparison, we want to find all attributes to compare
    const keys = Object.keys(data[0] || {}).filter(key => key !== 'name');
    return keys.map((key, index) => (
      <Bar 
        key={key} 
        dataKey={key} 
        fill={colors[index % colors.length]} 
      />
    ));
  };

  return (
    <div className="financial-chart">
      {title && <h3 className="text-lg font-semibold text-center">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 text-center mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

// Sample data generators for different chart types
export const generateSampleData = (chartType: FinancialChartType): any => {
  switch (chartType) {
    case 'bar':
      return [
        { name: 'Q1', value: 4000 },
        { name: 'Q2', value: 3000 },
        { name: 'Q3', value: 2000 },
        { name: 'Q4', value: 2780 }
      ];

    case 'line':
      return [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 5000 },
        { name: 'Apr', value: 4780 },
        { name: 'May', value: 5890 },
        { name: 'Jun', value: 6390 }
      ];

    case 'pie':
      return [
        { name: 'Commercial Loans', value: 400 },
        { name: 'Retail Banking', value: 300 },
        { name: 'Investment Services', value: 300 },
        { name: 'Treasury Management', value: 200 },
        { name: 'Merchant Services', value: 100 }
      ];

    case 'area':
      return [
        { name: '2018', value: 3000 },
        { name: '2019', value: 4000 },
        { name: '2020', value: 3780 },
        { name: '2021', value: 5890 },
        { name: '2022', value: 6390 },
        { name: '2023', value: 8000 }
      ];

    case 'comparison':
      return [
        { name: 'Interest Rates', 'Our Bank': 3.5, 'Competitor A': 4.0, 'Competitor B': 4.2 },
        { name: 'Service Fees', 'Our Bank': 0, 'Competitor A': 15, 'Competitor B': 10 },
        { name: 'Online Services', 'Our Bank': 95, 'Competitor A': 80, 'Competitor B': 85 },
        { name: 'Customer Satisfaction', 'Our Bank': 90, 'Competitor A': 75, 'Competitor B': 78 }
      ];

    case 'growth':
      return [
        { name: '2018', value: 3000, growth: 0 },
        { name: '2019', value: 4000, growth: 33.3 },
        { name: '2020', value: 3780, growth: -5.5 },
        { name: '2021', value: 5890, growth: 55.8 },
        { name: '2022', value: 6390, growth: 8.5 },
        { name: '2023', value: 8000, growth: 25.2 }
      ];

    case 'forecast':
      return [
        { name: 'Q1 2022', value: 4000, forecast: false },
        { name: 'Q2 2022', value: 4500, forecast: false },
        { name: 'Q3 2022', value: 5200, forecast: false },
        { name: 'Q4 2022', value: 5800, forecast: false },
        { name: 'Q1 2023', value: 6300, forecast: true, lowerBound: 5800, upperBound: 6800 },
        { name: 'Q2 2023', value: 7000, forecast: true, lowerBound: 6200, upperBound: 7800 },
        { name: 'Q3 2023', value: 7600, forecast: true, lowerBound: 6500, upperBound: 8700 },
        { name: 'Q4 2023', value: 8200, forecast: true, lowerBound: 6800, upperBound: 9600 }
      ];

    case 'roi':
      return [
        { name: 'Year 1', investment: 5000, return: 5500, roi: 10 },
        { name: 'Year 2', investment: 5000, return: 6000, roi: 20 },
        { name: 'Year 3', investment: 5000, return: 7500, roi: 50 },
        { name: 'Year 4', investment: 5000, return: 9000, roi: 80 },
        { name: 'Year 5', investment: 5000, return: 12000, roi: 140 }
      ];

    case 'cashflow':
      return [
        { name: 'Jan', inflow: 5000, outflow: -3000, balance: 2000 },
        { name: 'Feb', inflow: 6000, outflow: -3500, balance: 4500 },
        { name: 'Mar', inflow: 4500, outflow: -4000, balance: 5000 },
        { name: 'Apr', inflow: 7000, outflow: -3800, balance: 8200 },
        { name: 'May', inflow: 6500, outflow: -4200, balance: 10500 },
        { name: 'Jun', inflow: 8000, outflow: -5000, balance: 13500 }
      ];

    default:
      return [];
  }
}; 