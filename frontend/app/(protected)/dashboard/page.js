"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateTestDialog from "@/components/CreateTestDialog";

const page = () => {
  const { userData, axiosApiPrivate } = useApi();
  const [tests, setTests] = useState([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [newTest, setNewTest] = useState({ title: "", description: "" });

  const handleCreateTest = async () => {
    setIsCreatingTest(true);
    try {
      const response = await axiosApiPrivate.post("/tests/create", newTest);
      if (response.status === 201) {
        setTests([...tests, response.data.test]);
        setNewTest({ title: "", description: "" });
        setShowDialog(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingTest(false);
    }
  };

  useEffect(() => {
    if (userData.role !== "faculty") {
      router.push("/");
    }
    axiosApiPrivate.get("/tests/faculty").then((res) => {
      setTests(res.data.tests);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto flex flex-col gap-4 py-10">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg">Create Test</Button>
          </DialogTrigger>
          <CreateTestDialog
            newTest={newTest}
            setNewTest={setNewTest}
            isLoading={isCreatingTest}
            handleCreateTest={handleCreateTest}
          />
        </Dialog>
      </div>
      {isLoading ? (
        <p className="text-gray-500">Loading tests...</p>
      ) : tests.length === 0 ? (
        <p className="text-gray-500">No tests found</p>
      ) : (
        <div className="flex flex-wrap justify-start items-center gap-4">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="w-full max-w-sm cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300"
              onClick={() => router.push(`/dashboard/${test.id}`)}
            >
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-lg font-bold">
                  {test.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {test.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/${test.id}/responses`);
                  }}
                >
                  Responses
                </Button>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
