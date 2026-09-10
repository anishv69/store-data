"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, currency } from "@/lib/format";

const axis = "#86868b";
const grid = "#e8e8ed";
const blue = "#0071e3";
const sky = "#64d2ff";
const palette = ["#0071e3", "#5ac8fa", "#5856d6", "#af52de", "#34c759", "#ff9f0a"];
const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,.08)",
  boxShadow: "0 12px 32px rgba(0,0,0,.12)",
  color: "#1d1d1f",
  fontSize: 12,
};

const shortStoreName = (value: unknown) => String(value)
  .replace("Somerset Collection", "Somerset")
  .replace("Twelve Oaks Mall", "Twelve Oaks")
  .replace("Eastwood Towne Center", "Eastwood");

export function SalesTrendChart({ data }: { data: { day: string; sales: number; previousSales?: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 2, right: 10, left: -8, bottom: 0 }} accessibilityLayer>
        <defs>
          <linearGradient id="currentSalesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={blue} stopOpacity={0.22} />
            <stop offset="92%" stopColor={blue} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={grid} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} dy={10} interval={1} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} tickFormatter={compactCurrency} width={58} />
        <Tooltip formatter={(value, name) => [currency(Number(value)), name === "sales" ? "Current period" : "Previous period"]} contentStyle={tooltipStyle} cursor={{ stroke: "#d2d2d7", strokeDasharray: "3 3" }} />
        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={7} wrapperStyle={{ color: "#6e6e73", fontSize: 11, paddingBottom: 16 }} formatter={(value) => value === "sales" ? "Current 12 weeks" : "Previous 12 weeks"} />
        <Line type="monotone" dataKey="previousSales" stroke="#a1a1a6" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="sales" stroke={blue} strokeWidth={3} fill="url(#currentSalesFill)" dot={false} activeDot={{ r: 5, fill: blue, stroke: "white", strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function StoreSalesChart({ data, highlightName }: { data: { name: string; sales: number }[]; highlightName?: string }) {
  const ranked = [...data].sort((a, b) => b.sales - a.sales);
  const average = ranked.length ? ranked.reduce((sum, item) => sum + item.sales, 0) / ranked.length : 0;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ranked} layout="vertical" margin={{ top: 4, right: 62, left: 18, bottom: 2 }} accessibilityLayer>
        <CartesianGrid horizontal={false} stroke={grid} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} tickFormatter={compactCurrency} />
        <YAxis type="category" dataKey="name" width={96} axisLine={false} tickLine={false} tick={{ fill: "#515154", fontSize: 11 }} tickFormatter={shortStoreName} />
        <Tooltip formatter={(value) => [currency(Number(value)), "Sales"]} contentStyle={tooltipStyle} cursor={{ fill: "#f5f5f7" }} />
        <ReferenceLine x={average} stroke="#ff9f0a" strokeDasharray="4 4" label={{ value: "Avg", fill: "#b76500", fontSize: 10, position: "insideTopRight" }} />
        <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={20}>
          {ranked.map((item, index) => <Cell key={item.name} fill={highlightName ? item.name === highlightName ? blue : "#b9d8f7" : index === 0 ? blue : index === 1 ? "#409cff" : "#9dccff"} />)}
          <LabelList dataKey="sales" position="right" formatter={(value: unknown) => compactCurrency(Number(value))} fill="#515154" fontSize={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopProductsChart({ data }: { data: { name: string; sales: number }[] }) {
  const ranked = [...data].sort((a, b) => b.sales - a.sales).slice(0, 5);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ranked} layout="vertical" margin={{ top: 4, right: 58, left: 18, bottom: 2 }} accessibilityLayer>
        <CartesianGrid horizontal={false} stroke={grid} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} tickFormatter={compactCurrency} />
        <YAxis type="category" dataKey="name" width={92} axisLine={false} tickLine={false} tick={{ fill: "#515154", fontSize: 10 }} tickFormatter={(value) => String(value).replace("MacBook", "Mac").replace("Apple Watch", "Watch")} />
        <Tooltip formatter={(value) => [currency(Number(value)), "Product sales"]} contentStyle={tooltipStyle} cursor={{ fill: "#f5f5f7" }} />
        <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={20}>
          {ranked.map((item, index) => <Cell key={item.name} fill={palette[index % palette.length]} />)}
          <LabelList dataKey="sales" position="right" formatter={(value: unknown) => compactCurrency(Number(value))} fill="#515154" fontSize={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueMixChart({ data }: { data: { name: string; sales: number }[] }) {
  const ranked = [...data].sort((a, b) => b.sales - a.sales).slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ranked} layout="vertical" margin={{ top: 2, right: 62, left: 30, bottom: 2 }} accessibilityLayer>
        <CartesianGrid horizontal={false} stroke={grid} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} tickFormatter={compactCurrency} />
        <YAxis type="category" dataKey="name" width={108} axisLine={false} tickLine={false} tick={{ fill: "#515154", fontSize: 10 }} tickFormatter={shortStoreName} />
        <Tooltip formatter={(value) => [currency(Number(value)), "Revenue contribution"]} contentStyle={tooltipStyle} cursor={{ fill: "#f5f5f7" }} />
        <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={20}>
          {ranked.map((item, index) => <Cell key={item.name} fill={palette[index % palette.length]} />)}
          <LabelList dataKey="sales" position="right" formatter={(value: unknown) => compactCurrency(Number(value))} fill="#515154" fontSize={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OperationsChart({ data }: { data: { name: string; transactions: number; inventory: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 2 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={grid} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} tickFormatter={(value) => shortStoreName(value).replace("Apple ", "")} />
        <YAxis yAxisId="inventory" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} />
        <YAxis yAxisId="transactions" orientation="right" axisLine={false} tickLine={false} tick={{ fill: axis, fontSize: 10 }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f5f5f7" }} />
        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={7} wrapperStyle={{ color: "#6e6e73", fontSize: 11, paddingBottom: 14 }} />
        <Bar yAxisId="inventory" dataKey="inventory" name="Inventory units" fill={sky} radius={[7, 7, 0, 0]} barSize={24} />
        <Line yAxisId="transactions" type="monotone" dataKey="transactions" name="Transactions" stroke={blue} strokeWidth={3} dot={{ r: 3, fill: blue, strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
