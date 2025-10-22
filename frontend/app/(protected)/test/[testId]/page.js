"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const page = () => {
  const { axiosApiPrivate } = useApi();
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); 
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (!testId) return;

    const fetchTestData = async () => {
      setIsLoading(true);
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

    fetchTestData();
  }, [testId, axiosApiPrivate]);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const renderQuestionInput = (question) => {
    const isDisabled = submitStatus === 'success';

    switch (question.type) {
      case "mcq":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={option}
                  id={`${question.id}-${index}`}
                  checked={responses[question.id] === option}
                  onChange={() => handleResponseChange(question.id, option)}
                  disabled={isDisabled}
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
            className="mt-2"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            disabled={isDisabled}
          />
        );
      case "long":
        return (
          <textarea
            placeholder="Your detailed answer..."
            className="mt-2 min-h-[100px] w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            disabled={isDisabled}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('submitting'); 
    setSubmitMessage('Submitting your answers...');

    const answerEntries = Object.entries(responses);
    const submissionPromises = [];
    let successfulSubmissions = 0;

    for (const [questionId, answer] of answerEntries) {
      if (answer && answer.trim()) { 
        const payload = {
          answer: answer,
          questionId: parseInt(questionId),
          
        };
      
        submissionPromises.push(
          axiosApiPrivate.post("/responses/create", payload)
        );
      }
    }

    try {
      const results = await Promise.allSettled(submissionPromises);

      successfulSubmissions = results.filter(r => r.status === 'fulfilled').length;

      if (successfulSubmissions === submissionPromises.length) {
        setSubmitStatus('success');
        setSubmitMessage("Test submitted successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/test/${testId}/results`);
        }, 1500);
      } else {
        setSubmitStatus('partial_error');
        setSubmitMessage(`Submitted ${successfulSubmissions} out of ${submissionPromises.length} answers. Some answers failed to save. Please try again or contact support.`);
        console.error("Submission results:", results);
      }

    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage("An unexpected error occurred during submission. Please try again.");
      console.error("General submission error:", error);
    } finally {
      setIsSubmitting(false); 
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-gray-500">Loading test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-red-500">Test not found or error loading.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      {/* Test Header */}
      <div className="space-y-2 border-b pb-4">
        <h1 className="text-4xl font-bold">{test.title}</h1>
        <p className="text-lg text-gray-600">
          {test.description || "Please read each question carefully and submit."}
        </p>
      </div>

      {/* Submission Status Message */}
      {submitStatus !== 'idle' && (
        <div
          role="alert"
          className={`p-4 rounded-md text-sm font-medium ${
            submitStatus === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
            submitStatus === 'error' || submitStatus === 'partial_error' ? 'bg-red-100 text-red-700 border border-red-300' :
            'bg-blue-100 text-blue-700 border border-blue-300' 
          }`}
        >
          {submitMessage}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-500 text-center">
              This test has no questions.
            </p>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span>
                    Q{index + 1}. {question.text}
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

      {/* Submit Button */}
      {questions.length > 0 && submitStatus !== 'success' && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || submitStatus === 'submitting'}
        >
          {isSubmitting || submitStatus === 'submitting' ? "Submitting..." : "Submit Test"}
        </Button>
      )}
    </div>
  );
};

export default page;

