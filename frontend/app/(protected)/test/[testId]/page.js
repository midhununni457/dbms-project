"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const page = () => {
  const { axiosApiPrivate, userData } = useApi();
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false); 

  useEffect(() => {
      if (!testId || !userData?.id) return;

      const checkAttemptStatus = async () => {
          setIsLoading(true);
          try {
              const response = await axiosApiPrivate.get(
                  `/responses/test/${testId}/student`
              );
              if (response.data.responses && response.data.responses.length > 0) {
                  setHasAttempted(true);
                  router.replace(`/test/${testId}/results`);
              } else {
                  setHasAttempted(false);
                  fetchTestQuestions();
              }
          } catch (error) {
              console.error("Error checking attempt status:", error);
              setHasAttempted(false);
              fetchTestQuestions();
          }
      };

      checkAttemptStatus();
  }, [testId, axiosApiPrivate, userData, router]);

  const fetchTestQuestions = async () => {
      try {
          const [testResponse, questionsResponse] = await Promise.all([
              axiosApiPrivate.get(`/tests/test/${testId}`),
              axiosApiPrivate.get(`/questions/test/${testId}`),
          ]);
          setTest(testResponse.data.test);
          setQuestions(questionsResponse.data.questions || []);
      } catch (error) {
          console.error("Error fetching test data:", error);
      } finally {
          setIsLoading(false);
      }
  };


  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const areAllQuestionsAnswered = () => {
      if (!questions || questions.length === 0) {
          return false; 
      }
      const answeredCount = Object.keys(responses).filter(
          (questionId) => responses[questionId] && String(responses[questionId]).trim() !== ""
      ).length;

      return answeredCount === questions.length;
  };

  const renderQuestionInput = (question) => {
    const isUnanswered = attemptedSubmit && (!responses[question.id] || String(responses[question.id]).trim() === "");

    switch (question.type) {
      case "mcq":
        return (
          <div className={`space-y-2 p-2 rounded ${isUnanswered ? 'border-2 border-red-500' : ''}`}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={option}
                  id={`${question.id}-${index}`}
                  checked={responses[question.id] === option}
                  onChange={() => handleResponseChange(question.id, option)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case "short":
        return (
          <Input
            placeholder="Your short answer..."
            className={`mt-2 ${isUnanswered ? 'border-2 border-red-500 focus:ring-red-500' : ''}`}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          />
        );
      case "long":
        return (
          <textarea
            placeholder="Your detailed answer..."
            className={`mt-2 min-h-[100px] w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${isUnanswered ? 'border-red-500 focus:ring-red-500' : 'border-input'}`}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
      setAttemptedSubmit(true); 
      if (!areAllQuestionsAnswered()) {
          setSubmitStatus('error');
          setSubmitMessage('Please answer all questions before submitting.');
          const firstUnanswered = questions.find(q => !responses[q.id] || String(responses[q.id]).trim() === "");
          if (firstUnanswered) {
              const element = document.getElementById(`question-card-${firstUnanswered.id}`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return; 
      }

    setIsSubmitting(true);
    setSubmitStatus('submitting');
    setSubmitMessage('Submitting your answers...');

    const answerEntries = Object.entries(responses);
    const submissionPromises = [];
    let successfulSubmissions = 0;

    for (const [questionId, answer] of answerEntries) {
      const payload = {
        answer: answer,
        questionId: parseInt(questionId),
      };
      submissionPromises.push(
        axiosApiPrivate.post("/responses/create", payload)
      );
    }

    try {
      const results = await Promise.allSettled(submissionPromises);
      successfulSubmissions = results.filter(r => r.status === 'fulfilled').length;

      if (successfulSubmissions === submissionPromises.length) {
        setSubmitStatus('success');
        setSubmitMessage("Test submitted successfully! Redirecting to results...");
        setTimeout(() => {
          router.push(`/test/${testId}/results`);
        }, 1500);
      } else {
        setSubmitStatus('partial_error');
        setSubmitMessage(`Submitted ${successfulSubmissions} out of ${submissionPromises.length} answers. Some answers failed to save. Please try again or contact support.`);
        console.error("Submission results:", results);
         setIsSubmitting(false);
      }

    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage("An unexpected error occurred during submission. Please try again.");
      console.error("General submission error:", error);
       setIsSubmitting(false);
    }
  };


  if (isLoading || hasAttempted === null) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-gray-500">Loading test...</p>
      </div>
    );
  }

  if (!test && !isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-red-500">Test not found or could not be loaded.</p>
         <Button onClick={() => router.push('/tests')} className="mt-4">Back to Tests</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <div className="space-y-2 border-b pb-4">
        <h1 className="text-4xl font-bold">{test?.title}</h1>
        <p className="text-lg text-gray-600">
          {test?.description || "Please answer all questions and submit."}
        </p>
      </div>

      {submitStatus !== 'idle' && submitStatus !== 'success' && (
        <div
          role="alert"
          className={`p-4 rounded-md text-sm font-medium ${
             submitStatus === 'error' && submitMessage === 'Please answer all questions before submitting.' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : // Warning for incomplete
            submitStatus === 'error' || submitStatus === 'partial_error' ? 'bg-red-100 text-red-700 border border-red-300' : // Error for submission failure
            'bg-blue-100 text-blue-700 border border-blue-300' // Info for submitting
          }`}
        >
          {submitMessage}
        </div>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-500 text-center">
              This test has no questions.
            </p>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id} id={`question-card-${question.id}`} className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span>
                    Q{index + 1}. {question.text}
                     <span className="text-red-500 ml-1">*</span>
                  </span>
                  <span className="text-sm font-normal bg-primary/10 px-2 py-1 rounded">
                    {question.marks} {question.marks === 1 ? "mark" : "marks"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {renderQuestionInput(question)}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {questions.length > 0 && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || submitStatus === 'submitting' || !areAllQuestionsAnswered()}
        >
          {isSubmitting || submitStatus === 'submitting' ? "Submitting..." : "Submit Test"}
        </Button>
      )}
       {questions.length > 0 && !areAllQuestionsAnswered() && (
            <p className="text-center text-sm text-muted-foreground mt-2">
                Please answer all questions to submit the test.
            </p>
       )}
    </div>
  );
};

export default page;

