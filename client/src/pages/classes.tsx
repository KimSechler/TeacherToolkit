import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  Clock,
  Star
} from "lucide-react";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.string().optional(),
});

const studentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  avatarUrl: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

export default function Classes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const classForm = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      grade: "",
    },
  });

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      avatarUrl: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  type Class = { id: number; name: string; grade?: string };
  type Student = { id: number; name: string; avatarUrl?: string };

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/classes", selectedClass?.id, "students"],
    enabled: !!selectedClass,
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      return await apiRequest("POST", "/api/classes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      setIsCreatingClass(false);
      classForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ClassFormData> }) => {
      return await apiRequest("PUT", `/api/classes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      setEditingClass(null);
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      if (selectedClass?.id === id) {
        setSelectedClass(null);
      }
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      return await apiRequest("POST", `/api/classes/${selectedClass.id}/students`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClass.id, "students"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setIsAddingStudent(false);
      studentForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClass.id, "students"] });
      toast({
        title: "Success",
        description: "Student removed successfully",
      });
    },
  });

  const onSubmitClass = (data: ClassFormData) => {
    if (editingClass) {
      updateClassMutation.mutate({ id: editingClass.id, data });
    } else {
      createClassMutation.mutate(data);
    }
  };

  const onSubmitStudent = (data: StudentFormData) => {
    addStudentMutation.mutate(data);
  };

  const handleEditClass = (classItem: any) => {
    setEditingClass(classItem);
    classForm.reset(classItem);
    setIsCreatingClass(true);
  };

  const handleDeleteClass = (classId: number) => {
    if (confirm("Are you sure you want to delete this class? This will also remove all students.")) {
      deleteClassMutation.mutate(classId);
    }
  };

  const handleDeleteStudent = (studentId: number) => {
    if (confirm("Are you sure you want to remove this student from the class?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const getClassColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">My Classes</h1>
                <p className="text-gray-600">Manage your students and class information</p>
              </div>
              <Button
                onClick={() => {
                  setEditingClass(null);
                  classForm.reset();
                  setIsCreatingClass(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Class
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Classes List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : classes && classes.length > 0 ? (
                    <div className="space-y-3">
                      {classes.map((classItem: any, index: number) => (
                        <div
                          key={classItem.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedClass?.id === classItem.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedClass(classItem)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${getClassColor(index)} rounded-lg flex items-center justify-center`}>
                                <span className="text-white font-medium text-sm">
                                  {classItem.grade || getInitials(classItem.name)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800">{classItem.name}</p>
                                <p className="text-xs text-gray-600">
                                  {classItem.grade ? `Grade ${classItem.grade}` : "No grade set"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClass(classItem);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClass(classItem.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No classes created yet</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingClass(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Class
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Details */}
            <div className="lg:col-span-2">
              {selectedClass ? (
                <Tabs defaultValue="students" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{selectedClass.name}</h2>
                      <p className="text-gray-600">
                        {selectedClass.grade && `Grade ${selectedClass.grade}`}
                      </p>
                    </div>
                    <TabsList>
                      <TabsTrigger value="students">Students</TabsTrigger>
                      <TabsTrigger value="attendance">Attendance</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="students">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Students</CardTitle>
                          <Button
                            onClick={() => setIsAddingStudent(true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Student
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {studentsLoading ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="h-16 bg-gray-200 rounded-lg"></div>
                              </div>
                            ))}
                          </div>
                        ) : students && students.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {students.map((student: any, index: number) => (
                              <div key={student.id} className="flex items-center p-3 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {getInitials(student.name)}
                                  </span>
                                </div>
                                <div className="ml-3 flex-1">
                                  <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      Present
                                    </Badge>
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-500">Active</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteStudent(student.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No students added yet</p>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddingStudent(true)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add First Student
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="attendance">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Attendance Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">94%</div>
                            <div className="text-sm text-gray-600">Average Attendance</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">28</div>
                            <div className="text-sm text-gray-600">Present Today</div>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">2</div>
                            <div className="text-sm text-gray-600">Absent Today</div>
                          </div>
                        </div>
                        <div className="text-center py-4">
                          <Button variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Detailed Reports
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Class Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Class Name</label>
                            <Input value={selectedClass.name} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Grade Level</label>
                            <Input value={selectedClass.grade || ""} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Created</label>
                            <p className="text-sm text-gray-600">
                              {new Date(selectedClass.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => handleEditClass(selectedClass)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Class
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Class</h3>
                    <p className="text-gray-600">
                      Choose a class from the list to view students and manage settings
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Create/Edit Class Dialog */}
          <Dialog open={isCreatingClass} onOpenChange={setIsCreatingClass}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? "Edit Class" : "Create New Class"}
                </DialogTitle>
              </DialogHeader>
              <Form {...classForm}>
                <form onSubmit={classForm.handleSubmit(onSubmitClass)} className="space-y-4">
                  <FormField
                    control={classForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter class name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={classForm.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2A, 3B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingClass(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createClassMutation.isPending || updateClassMutation.isPending}
                    >
                      {createClassMutation.isPending || updateClassMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {editingClass ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Add Student Dialog */}
          <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <Form {...studentForm}>
                <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-4">
                  <FormField
                    control={studentForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter student name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingStudent(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addStudentMutation.isPending}
                    >
                      {addStudentMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      Add Student
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
