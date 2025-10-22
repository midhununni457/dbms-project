"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CorrectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const IncorrectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


const TestResultsPage = () => {
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
           try {
               const testDetails = await axiosApiPrivate.get(`/tests/test/${testId}`);
               setTestTitle(testDetails.data.test.title || "Test Results");
           } catch {
               setTestTitle("Test Results"); 
           }
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
              You have not submitted responses for this test yet.
            </p>
             <div className="text-center mt-4">
                 <Button onClick={() => router.push(`/test/${testId}`)}>Attempt Test</Button>
             </div>
          </Card>
        ) : (
          responses.map((response, index) => (
            <Card key={response.id} className="p-6 bg-card overflow-hidden">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span className="flex-1">
                    Q{index + 1}. {response.question?.text || "Question text missing"}
                  </span>
                  <span className="text-sm font-normal bg-muted px-2 py-1 rounded ml-4 whitespace-nowrap">
                     {response.question?.marks || "?"} {response.question?.marks === 1 ? "mark" : "marks"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-3">
                <div className="p-3 bg-muted/50 rounded border border-border relative">
                   <p className="text-sm font-medium mb-1 text-muted-foreground">Your Answer:</p>
                   <p className="text-sm whitespace-pre-wrap pr-8">{response.answer}</p>

                   {response.question?.type === 'mcq' && response.marksAwarded !== null && (
                       <div className="absolute top-2 right-2">
                           {response.isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
                       </div>
                   )}
                </div>

                 {response.question?.type === 'mcq' && !response.isCorrect && response.question.answer && (
                     <div className="p-3 bg-green-50 rounded border border-green-200">
                         <p className="text-sm font-medium mb-1 text-green-700">Correct Answer:</p>
                         <p className="text-sm whitespace-pre-wrap text-green-800">{response.question.answer}</p>
                     </div>
                 )}

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

export default TestResultsPage;
