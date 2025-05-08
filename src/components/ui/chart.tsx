
import { ApexOptions } from "apexcharts";
import React from "react";
import { Area, AreaChart, BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import dynamic from "next/dynamic";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartProps {
  options?: ApexOptions;
  series?: any[];
  type?: "line" | "area" | "bar" | "pie" | "donut" | "radar" | "polarArea";
  height?: number | string;
  width?: number | string;
  className?: string;
}

export const Chart = ({ options, series, type = "line", height = "100%", width = "100%", className = "" }: ChartProps) => {
  return (
    <div className={className} style={{ width, height }}>
      <ApexCharts options={options} series={series} type={type} height={height} width={width} />
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
