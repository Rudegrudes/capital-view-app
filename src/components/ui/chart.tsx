import React from "react";
import { Area, AreaChart, BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Define types for chart props
interface ChartProps {
  type: "line" | "area" | "bar" | "pie" | "donut" | "radar" | "polarArea";
  series: Array<{
    name: string;
    data: number[];
  }>;
  options?: {
    colors?: string[];
    labels?: string[];
    xaxis?: {
      categories?: string[];
    };
  };
  height?: number | string;
  width?: number | string;
  className?: string;
}

export const Chart = ({ series, type, options, height = 300, width = "100%", className = "" }: ChartProps) => {
  // Transform ApexCharts series format to Recharts format
  const getTransformedData = () => {
    if (!series || !series.length || !options?.xaxis?.categories) {
      return [];
    }

    return options.xaxis.categories.map((category, index) => {
      const dataPoint: Record<string, any> = {
        name: category,
      };
      
      series.forEach(s => {
        dataPoint[s.name] = s.data[index];
      });
      
      return dataPoint;
    });
  };

  // For pie chart format
  const getPieData = () => {
    if (!series || !series.length) {
      return [];
    }
    
    // If we have labels, use them with the first series data
    if (options?.labels && options.labels.length > 0) {
      return options.labels.map((label, index) => ({
        name: label,
        value: series[0].data[index] || 0,
      }));
    }
    
    // Otherwise just return the first series with generic names
    return series[0].data.map((value, index) => ({
      name: `Item ${index + 1}`,
      value,
    }));
  };

  const colors = options?.colors || ["#2A9D8F", "#E76F51", "#E9C46A", "#264653"];
  const data = type === "pie" || type === "donut" ? getPieData() : getTransformedData();

  if (type === "line") {
    return (
      <ResponsiveContainer width={width} height={height} className={className}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((s, index) => (
            <Line 
              key={s.name}
              type="monotone" 
              dataKey={s.name} 
              stroke={colors[index % colors.length]} 
              activeDot={{ r: 8 }} 
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width={width} height={height} className={className}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((s, index) => (
            <Area
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "bar") {
    return (
      <ResponsiveContainer width={width} height={height} className={className}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((s, index) => (
            <Bar
              key={s.name}
              dataKey={s.name}
              fill={colors[index % colors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "pie" || type === "donut") {
    return (
      <ResponsiveContainer width={width} height={height} className={className}>
        <PieChart margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={type === "donut" ? 60 : 0}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default fallback for unsupported chart types
  return (
    <div className={`${className} flex items-center justify-center`} style={{ width, height }}>
      <p>Chart type not supported: {type}</p>
    </div>
  );
};

interface LineChartProps {
  data: Array<Record<string, any>>;
  xAxisKey?: string;
  yAxisKey: string;
  height?: number;
  className?: string;
}

export const LineChart = ({
  data,
  xAxisKey = "name",
  yAxisKey,
  height = 400,
  className = "",
}: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yAxisKey} stroke="#2A9D8F" activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
