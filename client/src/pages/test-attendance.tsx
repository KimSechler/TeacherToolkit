import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function TestAttendance() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [testState, setTestState] = useState("initial");

  useEffect(() => {
    setTestState("mounted");
  }, []);

  const { data: classes = [], isLoading: classesLoading } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    retry: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Test Attendance Page</h1>
      <p>State: {testState}</p>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>Loading: {isLoading ? "Yes" : "No"}</p>
      <p>Classes Loading: {classesLoading ? "Yes" : "No"}</p>
      <p>Classes Count: {classes.length}</p>
      <button onClick={() => toast({ title: "Test", description: "Toast works!" })}>
        Test Toast
      </button>
    </div>
  );
} 