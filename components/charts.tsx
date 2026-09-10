"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactCurrency, currency } from "@/lib/format";

const tooltipStyle = { borderRadius: 12, border: "1px solid #e6ebe8", boxShadow: "0 8px 30px rgba(30,50,42,.08)", fontSize: 12 };

export function SalesTrendChart({ data }: { data: { day: string; sales: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b8a64" stopOpacity={0.24}/><stop offset="100%" stopColor="#1b8a64" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ee"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#7b8781", fontSize: 11 }} dy={8}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#7b8781", fontSize: 11 }} tickFormatter={compactCurrency}/><Tooltip formatter={(value) => currency(Number(value))} contentStyle={tooltipStyle}/><Area type="monotone" dataKey="sales" stroke="#126c4e" strokeWidth={2.5} fill="url(#salesFill)"/></AreaChart></ResponsiveContainer>;
}

export function StoreSalesChart({ data }: { data: { name: string; sales: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 16, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf0ee"/><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#7b8781", fontSize: 11 }} tickFormatter={compactCurrency}/><YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fill: "#53615a", fontSize: 11 }} tickFormatter={(value) => value === "Somerset Collection" ? "Somerset" : value === "Twelve Oaks Mall" ? "Twelve Oaks" : value === "Partridge Creek" ? "Partridge" : value}/><Tooltip formatter={(value) => currency(Number(value))} contentStyle={tooltipStyle}/><Bar dataKey="sales" fill="#126c4e" radius={[0, 6, 6, 0]} barSize={24}/></BarChart></ResponsiveContainer>;
}

export function TopProductsChart({ data }: { data: { name: string; sales: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ee"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#7b8781", fontSize: 10 }} tickFormatter={(value) => String(value).split(" ").slice(0, 2).join(" ")}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#7b8781", fontSize: 11 }} tickFormatter={compactCurrency}/><Tooltip formatter={(value) => currency(Number(value))} contentStyle={tooltipStyle}/><Bar dataKey="sales" fill="#5da68b" radius={[6, 6, 0, 0]} barSize={30}/></BarChart></ResponsiveContainer>;
}
