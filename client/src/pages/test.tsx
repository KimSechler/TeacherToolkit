import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { Class, Student } from "@/lib/types";

export default function TestPage() {
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch classes
  const { data: classes = [] as Class[] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Fetch students for selected class
  const { data: students = [] as Student[] } = useQuery<Student[]>({
    queryKey: ["/api/classes", selectedClassId, "students"],
    enabled: !!selectedClassId,
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: { name: string; grade: string }) => {
      return apiRequest("/api/classes", {
        method: "POST",
        body: JSON.stringify(classData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setNewClassName("");
      toast({
        title: "Class Created",
        description: "New class has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: { name: string }) => {
      return apiRequest(`/api/classes/${selectedClassId}/students`, {
        method: "POST",
        body: JSON.stringify(studentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClassId, "students"] });
      setNewStudentName("");
      toast({
        title: "Student Added",
        description: "New student has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class name.",
        variant: "destructive",
      });
      return;
    }
    createClassMutation.mutate({ name: newClassName, grade: "Test Grade" });
  };

  const handleAddStudent = () => {
    if (!selectedClassId) {
      toast({
        title: "Error",
        description: "Please select a class first.",
        variant: "destructive",
      });
      return;
    }
    if (!newStudentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a student name.",
        variant: "destructive",
      });
      return;
    }
    createStudentMutation.mutate({ name: newStudentName });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Page</h1>
          <p className="text-gray-600">Test class and student creation functionality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Class */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name
                </label>
                <Input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Test Class"
                />
              </div>
              <Button 
                onClick={handleCreateClass}
                disabled={createClassMutation.isPending}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createClassMutation.isPending ? "Creating..." : "Create Class"}
              </Button>
            </CardContent>
          </Card>

          {/* Add Student */}
          <Card>
            <CardHeader>
              <CardTitle>Add Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class
                </label>
                <select
                  value={selectedClassId || ""}
                  onChange={(e) => setSelectedClassId(parseInt(e.target.value) || null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.grade && `(${cls.grade})`}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedClassId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name
                    </label>
                    <Input
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <Button 
                    onClick={handleAddStudent}
                    disabled={createStudentMutation.isPending}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {createStudentMutation.isPending ? "Adding..." : "Add Student"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Display Classes */}
        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls: any) => (
                <div
                  key={cls.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                  onClick={() => setSelectedClassId(cls.id)}
                >
                  <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                  <p className="text-sm text-gray-600">{cls.grade}</p>
                  <p className="text-xs text-gray-500">ID: {cls.id}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Display Students */}
        {selectedClassId && students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Students in Selected Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
                  >
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{student.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center space-y-4">
          <Button onClick={() => window.location.href = "/classes"}>
            Go to Classes Page
          </Button>
          <Button onClick={() => window.location.href = "/attendance"}>
            Go to Attendance Page
          </Button>
        </div>
      </div>
    </div>
  );
} 