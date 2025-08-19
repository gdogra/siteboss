
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from
'recharts';

interface AnalyticsChartProps {
  title: string;
  type: 'line' | 'area' | 'bar' | 'pie';
  data: any[];
  height?: number;
  description?: string;
  colors?: string[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  type,
  data,
  height = 300,
  description,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']
}) => {
  const formatValue = (value: any, key: string) => {
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('value')) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) =>
          <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value, entry.name)}
            </p>
          )}
        </div>);

    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.keys(data[0] || {}).filter((key) => key !== 'date').map((key, index) =>
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2} />

              )}
            </LineChart>
          </ResponsiveContainer>);


      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.keys(data[0] || {}).filter((key) => key !== 'date').map((key, index) =>
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6} />

              )}
            </AreaChart>
          </ResponsiveContainer>);


      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>);


      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value">

                {data.map((entry: any, index: number) =>
                <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                )}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>);


      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>);

};

export default AnalyticsChart;