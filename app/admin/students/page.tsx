"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/sidebar";
import { supabaseService, type Application } from "@/lib/supabase-service";
import { Users, GraduationCap, Mail, Phone, Calendar } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const applications = await supabaseService.getApplications();
      const approvedStudents = applications.filter(app => app.status === "approved");
      setStudents(approvedStudents);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalStudents: students.length,
    activeThisMonth: students.filter(student => {
      const studentDate = new Date(student.submitted_at);
      const now = new Date();
      return studentDate.getMonth() === now.getMonth() && 
             studentDate.getFullYear() === now.getFullYear();
    }).length,
    byCourse: students.reduce((acc, student) => {
      acc[student.course_name] = (acc[student.course_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
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
            <h1 className="text-3xl font-bold mb-2">Students</h1>
            <p className="text-muted-foreground">Manage enrolled students</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  New This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeThisMonth}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.byCourse).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Course Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Students by Course</CardTitle>
              <CardDescription>Distribution of enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(stats.byCourse).map(([course, count]) => (
                  <div key={course} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{course}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Students ({students.length})</CardTitle>
              <CardDescription>List of all enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students enrolled yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Enrolled Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">{student.id}</TableCell>
                          <TableCell className="font-medium">{student.student_name}</TableCell>
                          <TableCell className="text-sm">{student.course_name}</TableCell>
                          <TableCell className="text-sm">{student.email}</TableCell>
                          <TableCell className="text-sm">{student.phone}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(student.submitted_at).toLocaleDateString()}
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
    </div>
  );
}
