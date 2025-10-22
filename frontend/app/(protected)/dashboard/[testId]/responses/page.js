"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";

const page = () => {
  const { axiosApiPrivate } = useApi();
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;

  const [testTitle, setTestTitle] = useState("");
  const [studentsWithResponses, setStudentsWithResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!testId) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const studentsResponse = await axiosApiPrivate.get(`/responses/test/${testId}/all`);
        setStudentsWithResponses(studentsResponse.data.students || []);

        const testResponse = await axiosApiPrivate.get(`/tests/test/${testId}`);
        setTestTitle(testResponse.data.test.title || `Test ID: ${testId}`);

      } catch (err) {
        console.error("Error fetching students for test:", err);
        setError(
          err.response?.data?.message || "Failed to load students for this test."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [testId, axiosApiPrivate]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <p className="text-muted-foreground text-center">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-10 px-4 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl flex flex-col gap-8 py-10 px-4">

      <div className="space-y-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{testTitle} Responses</h1>
        <p className="text-lg text-muted-foreground">
          List of students who have submitted responses for this test.
        </p>
      </div>

      <div className="space-y-4">
        {studentsWithResponses.length === 0 ? (
          <Card className="p-6 border-dashed border-border">
            <p className="text-muted-foreground text-center">
              No students have submitted responses for this test yet.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {studentsWithResponses.map((student) => (
              <li key={student.id} className="p-4 bg-card border rounded-lg flex justify-between items-center transition-colors hover:bg-muted/50">
                <div>
                  <p className="text-lg font-semibold">{student.name || `Student ID: ${student.id}`}</p>
                  {student.email && <p className="text-sm text-muted-foreground">{student.email}</p>}
                </div>
                <Button
                  size="sm" 
                  onClick={() => router.push(`/dashboard/${testId}/responses/${student.id}`)}
                >
                  View Responses
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 text-center">
        <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full max-w-xs">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default page;

