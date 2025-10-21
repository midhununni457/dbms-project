"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { useApi } from "@/context/ApiContext";
import { useState } from "react";
import { getErrMsg } from "@/hooks/errorParser";

const page = () => {
  const { axiosApiPublic } = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendSecurityQuestion = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const response = await axiosApiPublic.post("/auth/get-security-question", {
      email: email,
    });
    if (response.data.message) {
      setSecurityQuestion(response.data.securityQuestion);
    } else {
      setError(getErrMsg(response.data.error));
    }
    setIsLoading(false);
  };

  const handleVerifyAnswer = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
    const response = await axiosApiPublic.post("/auth/reset-password", {
      email: email,
      securityAnswer: securityAnswer,
      password: password,
    });
    if (response.data.message) {
      setSuccess(response.data.message);
    } else {
        setError(getErrMsg(response.data.error));
      }
    } catch (error) {
      setError(getErrMsg(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address to proceed with password reset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityQuestion ? (
            <div className="space-y-2">
              <p className="text-lg font-bold">Security Question:</p>
              <p className="text-lg">{securityQuestion}</p>
              <Input
                type="text"
                placeholder="Enter your answer"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Enter your new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <LoadingButton
                type="submit"
                className="w-full"
                loading={isLoading}
                onClick={handleVerifyAnswer}
              >
                Verify Answer
              </LoadingButton>
            </div>
          ) : (
            <form className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <LoadingButton
                type="submit"
                className="w-full"
                loading={isLoading}
                onClick={handleSendSecurityQuestion}
              >
                Send Security Question
              </LoadingButton>
            </form>
          )}

          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
