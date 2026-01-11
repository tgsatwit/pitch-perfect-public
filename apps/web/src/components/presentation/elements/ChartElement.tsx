import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { FinancialChart, FinancialChartType } from '../charts/FinancialCharts';

interface ChartElementProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: {
    chartType: string;
    data: any;
    title?: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ChartElement: React.FC<ChartElementProps> = ({
  id,
  x,
  y,
  width,
  height,
  content,
  isSelected,
  onSelect
}) => {
  const { chartType, data, title } = content;
  
  // Determine if this is a financial chart
  const isFinancialChart = Object.values(['area', 'comparison', 'growth', 'forecast', 'roi', 'cashflow'])
    .includes(chartType as any);
  
  // Colors for standard charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Function to render the appropriate chart based on type
  const renderChart = () => {
    // For financial charts, use the FinancialChart component
    if (isFinancialChart) {
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <FinancialChart
              type={chartType as FinancialChartType}
              data={data}
              width={width}
              height={height}
              title={title}
              showLegend={height > 150}
            />
          </ResponsiveContainer>
        </div>
      );
    }
    
    // For standard charts
    switch (chartType) {
      case 'bar':
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {height > 150 && <Legend />}
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'line':
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {height > 150 && <Legend />}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={Math.min(width, height) / 3}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                {height > 150 && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            border: '1px dashed #94a3b8',
            borderRadius: '4px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            Unsupported chart type: {chartType}
          </div>
        );
    }
  };
  
  return (
    <Group
      x={x}
      y={y}
      width={width}
      height={height}
      onClick={() => onSelect(id)}
    >
      {/* Background and border */}
      <Rect
        width={width}
        height={height}
        fill="white"
        stroke={isSelected ? "#4f46e5" : "#e2e8f0"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={4}
      />
      
      {/* Chart title if provided */}
      {title && (
        <Text
          text={title}
          fontSize={14}
          fontFamily="sans-serif"
          fill="#334155"
          align="center"
          width={width}
          y={5}
          height={20}
        />
      )}
      
      {/* Chart content using Html container for Recharts */}
      <Html
        divProps={{
          style: {
            position: 'absolute',
            top: title ? 24 : 10,
            left: 10,
            width: width - 20,
            height: title ? height - 34 : height - 20,
          }
        }}
      >
        {renderChart()}
      </Html>
    </Group>
  );
}; 