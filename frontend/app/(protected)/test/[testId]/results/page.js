"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const page = () => {
  const { axiosApiPrivate, userData } = useApi();
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;

  const [testTitle, setTestTitle] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!testId || !userData?.id) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosApiPrivate.get(
          `/responses/test/${testId}/student`
        );

        if (response.data.responses && response.data.responses.length > 0) {
          setResponses(response.data.responses);
          if (response.data.responses[0]?.question?.test) {
              setTestTitle(response.data.responses[0].question.test.title);
          } else {
              const testDetails = await axiosApiPrivate.get(`/tests/test/${testId}`);
              setTestTitle(testDetails.data.test.title || "Test Results");
          }

        } else {
          setResponses([]);
          setTestTitle("Test Results");
        }

      } catch (err) {
        console.error("Error fetching results:", err);
        setError(
          err.response?.data?.message || "Failed to load test results."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [testId, axiosApiPrivate, userData]);

  const calculateScore = () => {
    let awarded = 0;
    let total = 0;
    responses.forEach(res => {
        if (res.marksAwarded !== null) {
            awarded += res.marksAwarded;
        }
        total += res.question?.marks || 0;
    });
    const totalMcqMarks = responses
        .filter(res => res.question?.type === 'mcq')
        .reduce((sum, res) => sum + (res.question?.marks || 0), 0);

    return { awarded, total, totalMcqMarks };
  };

  const score = calculateScore();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-gray-500">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push("/tests")} className="mt-4">
          Back to Tests
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <div className="space-y-2 border-b pb-4">
        <h1 className="text-4xl font-bold">{testTitle || `Results for Test ID: ${testId}`}</h1>
        <p className="text-lg text-gray-600">
          Review your submitted answers and marks.
        </p>
        <div className="pt-2">
            <p className="text-xl font-semibold">
                Preliminary Score (MCQs Only): {score.awarded} / {score.totalMcqMarks || score.total}
            </p>
            <p className="text-sm text-gray-500">
                (Total marks for all questions: {score.total}. *Note: Final score may vary after manual grading.)
            </p>
        </div>
      </div>

      <div className="space-y-4">
        {responses.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-500 text-center">
              No responses found for this test.
            </p>
          </Card>
        ) : (
          responses.map((response, index) => (
            <Card key={response.id} className="p-6 bg-card">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span>
                    Q{index + 1}. {response.question?.text || "Question text missing"}
                  </span>
                  <span className="text-sm font-normal bg-muted px-2 py-1 rounded">
                     {response.question?.marks || "?"} {response.question?.marks === 1 ? "mark" : "marks"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-3">
                <div className="p-3 bg-muted/50 rounded border border-border">
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Your Answer:</p>
                  <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                </div>
                <div className="pt-2 text-right">
                    {response.marksAwarded !== null ? (
                        <p className={`font-semibold ${response.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            Marks Awarded: {response.marksAwarded} / {response.question?.marks || "?"}
                        </p>
                    ) : (
                         <p className="text-sm text-yellow-600 font-medium italic">
                            Pending Grading
                        </p>
                    )}
                     {response.question?.type === 'mcq' && !response.isCorrect && response.question.answer && (
                         <p className="text-sm text-muted-foreground mt-1">Correct Answer: {response.question.answer}</p>
                     )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button onClick={() => router.push("/tests")} variant="outline" className="w-full max-w-xs mx-auto">
        Back to All Tests
      </Button>
    </div>
  );
};

export default page;