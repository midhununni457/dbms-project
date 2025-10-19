import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";

const CreateTestDialog = ({ newTest, setNewTest, isLoading, handleCreateTest }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Test</DialogTitle>
        <DialogDescription>
          Create a new test with the following details.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Test Title"
          value={newTest.title}
          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Test Description"
          value={newTest.description}
          onChange={(e) =>
            setNewTest({ ...newTest, description: e.target.value })
          }
        />
      </div>
      <LoadingButton type="submit" loading={isLoading} onClick={handleCreateTest}>
        Create Test
      </LoadingButton>
    </DialogContent>
  );
};

export default CreateTestDialog;
