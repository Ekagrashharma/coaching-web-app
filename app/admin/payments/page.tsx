"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/sidebar";
import { DataFilters } from "@/components/admin/data-filters";
import { supabaseService, type Payment } from "@/lib/supabase-service";
import { Eye, CheckCircle, XCircle, Download, IndianRupee } from "lucide-react";
import Image from "next/image";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    course: "",
    dateRange: "",
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPayments = async () => {
    try {
      const pays = await supabaseService.getPayments();
      setPayments(pays);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.student_name.toLowerCase().includes(searchLower) ||
          payment.transaction_id.toLowerCase().includes(searchLower) ||
          payment.upi_id.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((payment) => payment.status === filters.status);
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter((payment) => payment.course_name === filters.course);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const paymentDate = (payment: Payment) => new Date(payment.submitted_at);

      filtered = filtered.filter((payment) => {
        const date = paymentDate(payment);
        switch (filters.dateRange) {
          case "today":
            return date.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
          case "month":
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          case "quarter":
            const quarter = Math.floor(now.getMonth() / 3);
            const paymentQuarter = Math.floor(date.getMonth() / 3);
            return paymentQuarter === quarter && date.getFullYear() === now.getFullYear();
          case "year":
            return date.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredPayments(filtered);
  };

  const handlePaymentAction = async (id: string, status: "verified" | "rejected") => {
    try {
      await supabaseService.updatePaymentStatus(id, status);
      await loadPayments();
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const courses = useMemo(() => {
    const uniqueCourses = [...new Set(payments.map((payment) => payment.course_name))];
    return uniqueCourses;
  }, [payments]);

  const stats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    verified: payments.filter((p) => p.status === "verified").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
    totalRevenue: payments
      .filter((p) => p.status === "verified")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingRevenue: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payments</h1>
            <p className="text-muted-foreground">Manage and verify fee payments</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{stats.pendingRevenue.toLocaleString("en-IN")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <DataFilters
            filters={filters}
            onFiltersChange={setFilters}
            courses={courses}
            type="payments"
          />

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payments ({filteredPayments.length})</CardTitle>
              <CardDescription>
                {filteredPayments.length !== payments.length 
                  ? `Showing ${filteredPayments.length} of ${payments.length} payments`
                  : "All payments"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payments found</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setFilters({ search: "", status: "", course: "", dateRange: "" })}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                          <TableCell className="font-medium">{payment.student_name}</TableCell>
                          <TableCell className="text-sm">{payment.course_name}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{payment.amount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Badge variant="outline">
                              {payment.payment_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.transaction_id}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "verified"
                                  ? "default"
                                  : payment.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(payment.submitted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Detail Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Review and verify payment information</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedPayment.status === "verified"
                        ? "default"
                        : selectedPayment.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{selectedPayment.student_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedPayment.course_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold text-primary">
                    ₹{selectedPayment.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <Badge variant="outline">{selectedPayment.payment_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="font-medium">
                    {new Date(selectedPayment.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UPI ID</p>
                  <p className="font-mono font-medium">{selectedPayment.upi_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium">{selectedPayment.transaction_id}</p>
                </div>
              </div>

              {selectedPayment.screenshot && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Screenshot</p>
                  <div className="border rounded-lg p-2">
                    <Image
                      src={selectedPayment.screenshot || "/placeholder.svg"}
                      alt="Payment screenshot"
                      className="max-h-96 mx-auto"
                    />
                  </div>
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => handlePaymentAction(selectedPayment.id, "verified")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Payment
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handlePaymentAction(selectedPayment.id, "rejected")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
