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
  const [isLoading, setIsLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "mcq",
    options: ["", ""],
    correctAnswer: "",
    marks: 1,
  });

  const fetchTestData = async () => {
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

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const handleRemoveOption = (index) => {
    if (newQuestion.options.length > 2) {
      setNewQuestion((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleCreateQuestion = async () => {
    setIsCreatingQuestion(true);
    try {
      const questionData = {
        text: newQuestion.question,
        type: newQuestion.type,
        testId: testId,
        marks: newQuestion.marks,
        options:
          newQuestion.type === "mcq"
            ? newQuestion.options.filter((opt) => opt.trim())
            : null,
        answer: newQuestion.type === "mcq" ? newQuestion.correctAnswer : null,
      };

      const response = await axiosApiPrivate.post("/questions", questionData);

      if (response.status === 201) {
        setQuestions([...questions, response.data.question]);
        setNewQuestion({
          question: "", // Fixed: was 'text' before
          type: "mcq",
          options: ["", ""],
          correctAnswer: "",
          marks: 1,
        });
        setShowAddQuestion(false);
      }
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case "mcq":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  id={`${question.id}-${index}`}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case "short":
        return <Input placeholder="Short answer..." className="mt-2" />;
      case "long":
        return (
          <textarea
            placeholder="Long answer..."
            className="mt-2 min-h-[100px] w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (!newQuestion.question.trim()) return false;

    if (newQuestion.type === "mcq") {
      const validOptions = newQuestion.options.filter((opt) =>
        opt.trim()
      ).length;
      if (validOptions < 2) return false;
      if (!newQuestion.correctAnswer.trim()) return false;
    }

    return true;
  };

  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

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
        <p className="text-red-500">Test not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      {/* Test Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{test.title}</h1>
        <p className="text-lg text-gray-600">
          {test.description || "No description"}
        </p>
        <Button
          variant="default"
          onClick={() => router.push(`/dashboard/${testId}/responses`)}
          className=""
        >
          View All Responses
        </Button>
      </div>

      {/* Add Question Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Questions</h2>
          <Button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            variant={showAddQuestion ? "outline" : "default"}
          >
            {showAddQuestion ? "Cancel" : "Add Question"}
          </Button>
        </div>

        {showAddQuestion && (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="question"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="question"
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  placeholder="Enter your question..."
                  className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Question Type
                  </label>
                  <select
                    id="type"
                    value={newQuestion.type}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="short">Short Answer</option>
                    <option value="long">Long Answer</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="marks"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Marks
                  </label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        marks: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {newQuestion.type === "mcq" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options <span className="text-red-500">*</span>
                  </label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {newQuestion.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="text-white bg-zinc-800 hover:bg-zinc-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddOption}
                    size="sm"
                    className="bg-zinc-800 hover:bg-zinc-700"
                  >
                    Add Option
                  </Button>

                  <div>
                    <label
                      htmlFor="correctAnswer"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="correctAnswer"
                      value={newQuestion.correctAnswer}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          correctAnswer: e.target.value,
                        }))
                      }
                      placeholder="Enter correct answer..."
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateQuestion}
                disabled={isCreatingQuestion || !isFormValid()}
                className="w-full"
              >
                {isCreatingQuestion ? "Creating..." : "Create Question"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-500 text-center">No questions added yet</p>
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
      <div className="mt-6 text-center">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="w-full max-w-xs"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default page;
