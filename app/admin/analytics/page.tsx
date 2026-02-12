"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsCards } from "@/components/admin/analytics-cards";
import { Sidebar } from "@/components/admin/sidebar";
import { supabaseService, type Application, type Payment } from "@/lib/supabase-service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, TrendingUp, Users, DollarSign, FileText } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apps, pays] = await Promise.all([
        supabaseService.getApplications(),
        supabaseService.getPayments()
      ]);
      setApplications(apps);
      setPayments(pays);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const monthlyPayments = payments.filter(p => {
      const paymentDate = new Date(p.submitted_at);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    const lastMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.submitted_at);
      return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear;
    });

    const monthlyRevenue = monthlyPayments
      .filter(p => p.status === "verified")
      .reduce((sum, p) => sum + p.amount, 0);

    const lastMonthRevenue = lastMonthPayments
      .filter(p => p.status === "verified")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = payments
      .filter(p => p.status === "verified")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalStudents = applications.filter(a => a.status === "approved").length;

    return {
      totalStudents,
      totalApplications: applications.length,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      pendingApplications: applications.filter(a => a.status === "pending").length,
      verifiedPayments: payments.filter(p => p.status === "verified").length,
    };
  };

  const getRevenueData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    payments
      .filter(p => p.status === "verified")
      .forEach(payment => {
        const date = new Date(payment.submitted_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
      });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6); // Last 6 months
  };

  const getApplicationData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    applications.forEach(application => {
      const date = new Date(application.submitted_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, applications]) => ({ month, applications }))
      .slice(-6); // Last 6 months
  };

  const getCourseDistribution = () => {
    const courseCount: { [key: string]: number } = {};
    
    applications.forEach(app => {
      courseCount[app.course_name] = (courseCount[app.course_name] || 0) + 1;
    });

    return Object.entries(courseCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const stats = calculateStats();
  const revenueData = getRevenueData();
  const applicationData = getApplicationData();
  const courseDistribution = getCourseDistribution();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your institute's performance</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AnalyticsCards stats={stats} />

          <div className="grid gap-6 md:grid-cols-2 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Trends
                </CardTitle>
                <CardDescription>Monthly application submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={applicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Course Distribution
              </CardTitle>
              <CardDescription>Applications by course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
