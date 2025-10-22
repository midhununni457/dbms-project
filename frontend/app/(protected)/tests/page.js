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


const page = () => {
  const { axiosApiPrivate } = useApi();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const response = await axiosApiPrivate.get("/tests");
        setTests(response.data.tests || []);
      } catch (error) {
        console.error("Error fetching tests:", error);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [axiosApiPrivate]); 

  return (
    <div className="container mx-auto flex flex-col gap-4 py-10">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-bold mb-4">Available Tests</h1>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading tests...</p>
      ) : tests.length === 0 ? (
        <p className="text-gray-500">No tests are available at this time.</p>
      ) : (
        <div className="flex flex-wrap justify-start items-center gap-4">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="w-full max-w-sm cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300"
              onClick={() => router.push(`/test/${test.id}`)}
            >
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-lg font-bold">
                  {test.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {test.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  Start Test
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
