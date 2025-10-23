"use client";
import { useApi } from "@/context/ApiContext";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const page = () => {
  const { axiosApiPrivate } = useApi();
  const { testId, studentId } = useParams();
  const searchParams = useSearchParams();
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [editableResponses, setEditableResponses] = useState([]);
  const [isGradingAll, setIsGradingAll] = useState(false);

  const fetchResponsesAndTest = async () => {
    try {
      setIsLoading(true);
      const [responsesRes, testRes] = await Promise.all([
        axiosApiPrivate.get(
          `/responses/test/${testId}/student?studentId=${studentId}`
        ),
        axiosApiPrivate.get(`/tests/test/${testId}`),
      ]);

      setResponses(responsesRes.data.responses);
      setTest(testRes.data.test);

      setEditableResponses(
        responsesRes.data.responses.map((response) => ({
          id: response.id,
          isCorrect: response.isCorrect !== null ? response.isCorrect : false,
          marksAwarded: response.marksAwarded || 0,
          isGrading: false,
        }))
      );

      console.log("Fetched responses:", responsesRes.data.responses);
      console.log("Fetched test:", testRes.data.test);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEditableResponse = (responseId, field, value) => {
    setEditableResponses((prev) =>
      prev.map((item) =>
        item.id === responseId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleGradeResponse = async (responseId) => {
    const editableResponse = editableResponses.find(
      (item) => item.id === responseId
    );

    try {
      updateEditableResponse(responseId, "isGrading", true);

      await axiosApiPrivate.put(`/responses/${responseId}`, {
        isCorrect: editableResponse.isCorrect,
        marksAwarded: editableResponse.marksAwarded,
      });

      // Update the main responses state to reflect changes
      setResponses((prev) =>
        prev.map((response) =>
          response.id === responseId
            ? {
                ...response,
                isCorrect: editableResponse.isCorrect,
                marksAwarded: editableResponse.marksAwarded,
              }
            : response
        )
      );
    } catch (error) {
      console.error("Error updating response:", error);
    } finally {
      updateEditableResponse(responseId, "isGrading", false);
    }
  };

  const handleGradeAll = async () => {
    setIsGradingAll(true);
    try {
      // Create array of promises for all update requests
      const updatePromises = editableResponses.map((editableResponse) =>
        axiosApiPrivate.put(`/responses/${editableResponse.id}`, {
          isCorrect: editableResponse.isCorrect,
          marksAwarded: editableResponse.marksAwarded,
        })
      );

      // Wait for all requests to complete
      await Promise.all(updatePromises);

      // Update the main responses state to reflect all changes
      setResponses((prev) =>
        prev.map((response) => {
          const editableResponse = editableResponses.find(
            (item) => item.id === response.id
          );
          return editableResponse
            ? {
                ...response,
                isCorrect: editableResponse.isCorrect,
                marksAwarded: editableResponse.marksAwarded,
              }
            : response;
        })
      );
    } catch (error) {
      console.error("Error grading all responses:", error);
    } finally {
      setIsGradingAll(false);
    }
  };

  const renderQuestionWithResponse = (response, index) => {
    const { question } = response;
    const editableResponse = editableResponses.find(
      (item) => item.id === response.id
    );

    if (!editableResponse) return null;

    const renderInput = () => {
      switch (question.type) {
        case "mcq":
          console.log({
            answer: response.answer,
            options: question.options,
            matches: question.options?.map((opt) => ({
              opt,
              equal: response.answer === opt,
            })),
          });

          return (
            <div className="space-y-2">
              {question.options?.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={response.answer === option}
                    readOnly
                    name={`question-${question.id}-${response.id}`}
                    id={`${question.id}-${optIndex}`}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label
                    htmlFor={`${question.id}-${optIndex}`}
                    className="text-sm"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          );
        case "short":
          return (
            <Input
              disabled
              value={response.answer || ""}
              placeholder="Short answer..."
              className="mt-2"
            />
          );
        case "long":
          return (
            <textarea
              disabled
              value={response.answer || ""}
              placeholder="Long answer..."
              className="mt-2 min-h-[100px] w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          );
        default:
          return null;
      }
    };

    return (
      <Card key={response.id} className="p-6 relative">
        {/* Correctness and Marks Indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <div
            className={`px-3 py-1 rounded text-sm font-medium cursor-pointer transition-colors ${
              editableResponse.isCorrect
                ? "bg-green-300 text-green-800 border border-green-200 hover:bg-green-400"
                : "bg-red-300 text-red-800 border border-red-200 hover:bg-red-400"
            }`}
            onClick={() =>
              updateEditableResponse(
                response.id,
                "isCorrect",
                !editableResponse.isCorrect
              )
            }
          >
            {editableResponse.isCorrect ? "Correct" : "Incorrect"}
          </div>
          <div className="text-sm font-normal bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
            <input
              type="text"
              value={editableResponse.marksAwarded}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (value >= 0 && value <= question.marks) {
                  updateEditableResponse(response.id, "marksAwarded", value);
                }
              }}
              className="w-5 text-center bg-transparent border-none outline-none"
            />
            <span>/ {question.marks} marks</span>
          </div>
        </div>

        <CardHeader className="px-0 pt-0 pr-32">
          <CardTitle className="text-lg">
            Q{index + 1}. {question.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 relative">
          {renderInput()}

          {/* Grade Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => handleGradeResponse(response.id)}
              disabled={editableResponse.isGrading}
              size="sm"
            >
              {editableResponse.isGrading ? "Grading..." : "Grade"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const calculateTotalScore = () => {
    const totalMarks = responses.reduce(
      (sum, response) => sum + response.question.marks,
      0
    );
    const obtainedMarks = editableResponses.reduce(
      (sum, editableResponse) => sum + (editableResponse.marksAwarded || 0),
      0
    );
    return { obtainedMarks, totalMarks };
  };

  useEffect(() => {
    if (testId && studentId) {
      fetchResponsesAndTest();
    }
  }, [testId, studentId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-gray-500">Loading responses...</p>
      </div>
    );
  }

  if (!test || responses.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-red-500">No responses found for this student</p>
      </div>
    );
  }

  const { obtainedMarks, totalMarks } = calculateTotalScore();

  return (
    <div className="container mx-auto flex flex-col gap-8 py-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{test.title}</h1>
        <p className="text-lg text-gray-400">
          {responses[0].student.name}'s Responses
        </p>

        <h3 className="text-lg font-semibold text-white">
          Total Score: {obtainedMarks} / {totalMarks} marks (
          {totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0}
          %)
        </h3>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Questions and Responses</h2>

        {responses.map((response, index) =>
          renderQuestionWithResponse(response, index)
        )}

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleGradeAll}
            disabled={isGradingAll}
            size="lg"
            className="w-[200px] h-[50px] text-lg max-w-md"
          >
            {isGradingAll ? "Grading All..." : "Grade All"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
