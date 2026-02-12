"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/sidebar";
import { DataFilters } from "@/components/admin/data-filters";
import { supabaseService, type Application } from "@/lib/supabase-service";
import { Eye, CheckCircle, XCircle, Download } from "lucide-react";
import Image from "next/image";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    course: "",
    dateRange: "",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApplications = async () => {
    try {
      const apps = await supabaseService.getApplications();
      setApplications(apps);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.student_name.toLowerCase().includes(searchLower) ||
          app.email.toLowerCase().includes(searchLower) ||
          app.phone.includes(filters.search)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status);
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter((app) => app.course_name === filters.course);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const appDate = (app: Application) => new Date(app.submitted_at);

      filtered = filtered.filter((app) => {
        const date = appDate(app);
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
            const appQuarter = Math.floor(date.getMonth() / 3);
            return appQuarter === quarter && date.getFullYear() === now.getFullYear();
          case "year":
            return date.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredApplications(filtered);
  };

  const handleApplicationAction = async (id: string, status: "approved" | "rejected") => {
    try {
      await supabaseService.updateApplicationStatus(id, status);
      await loadApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const courses = useMemo(() => {
    const uniqueCourses = [...new Set(applications.map((app) => app.course_name))];
    return uniqueCourses;
  }, [applications]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
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
            <h1 className="text-3xl font-bold mb-2">Applications</h1>
            <p className="text-muted-foreground">Manage student admission applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
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
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <DataFilters
            filters={filters}
            onFiltersChange={setFilters}
            courses={courses}
            type="applications"
          />

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>
                {filteredApplications.length !== applications.length 
                  ? `Showing ${filteredApplications.length} of ${applications.length} applications`
                  : "All applications"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications found</p>
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
                        <TableHead>ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-mono text-xs">{app.id}</TableCell>
                          <TableCell className="font-medium">{app.student_name}</TableCell>
                          <TableCell className="text-sm">{app.course_name}</TableCell>
                          <TableCell className="text-sm">{app.email}</TableCell>
                          <TableCell className="text-sm">{app.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                app.status === "approved"
                                  ? "default"
                                  : app.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedApplication(app)}
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

      {/* Application Detail Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review complete application information</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {selectedApplication.photo && (
                <div className="flex justify-center">
                  <Image
                    src={selectedApplication.photo || "/placeholder.svg"}
                    alt="Student"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-lg object-cover border-2"
                  />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application ID</p>
                  <p className="font-mono font-medium">{selectedApplication.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedApplication.status === "approved"
                        ? "default"
                        : selectedApplication.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {selectedApplication.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{selectedApplication.student_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(selectedApplication.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{selectedApplication.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedApplication.course_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father's Name</p>
                  <p className="font-medium">{selectedApplication.father_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother's Name</p>
                  <p className="font-medium">{selectedApplication.mother_name}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state} -{" "}
                    {selectedApplication.pincode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Class</p>
                  <p className="font-medium">{selectedApplication.class}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Percentage</p>
                  <p className="font-medium">{selectedApplication.percentage}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">School/College</p>
                  <p className="font-medium">{selectedApplication.school}</p>
                </div>
              </div>

              {selectedApplication.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => handleApplicationAction(selectedApplication.id, "approved")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleApplicationAction(selectedApplication.id, "rejected")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
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
