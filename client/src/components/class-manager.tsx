import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Class, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Trash2 } from "lucide-react";

export default function ClassManager() {
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");
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
      setNewClassGrade("");
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
    createClassMutation.mutate({ name: newClassName, grade: newClassGrade });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Math 101"
              />
            </div>
            <div>
              <Label htmlFor="classGrade">Grade</Label>
              <Input
                id="classGrade"
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                placeholder="e.g., 3rd Grade"
              />
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Add Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="classSelect">Select Class</Label>
            <select
              id="classSelect"
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
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
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

      {selectedClassId && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students in Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{student.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 