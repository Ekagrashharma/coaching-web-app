"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

function AnalyticsCard({ title, value, change, icon, description }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground">
            <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
              {change >= 0 ? "+" : ""}{change}%
            </span>{" "}
            from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsCardsProps {
  stats: {
    totalStudents: number;
    totalApplications: number;
    totalRevenue: number;
    monthlyRevenue: number;
    lastMonthRevenue: number;
    pendingApplications: number;
    verifiedPayments: number;
  };
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  const revenueChange = stats.lastMonthRevenue > 0 
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard
        title="Total Students"
        value={stats.totalStudents}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Active enrolled students"
      />
      <AnalyticsCard
        title="Total Applications"
        value={stats.totalApplications}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        description="All time applications"
      />
      <AnalyticsCard
        title="Monthly Revenue"
        value={`₹${stats.monthlyRevenue.toLocaleString("en-IN")}`}
        change={revenueChange}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        description="Current month earnings"
      />
      <AnalyticsCard
        title="Total Revenue"
        value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="All time revenue"
      />
    </div>
  );
}
