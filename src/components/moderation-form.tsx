"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { handleModeration } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  output: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Moderate Content
    </Button>
  );
}

export function ModerationForm() {
  const [state, formAction] = useFormState(handleModeration, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state.error, toast]);
  
  const handleSubmit = (formData: FormData) => {
    formAction(formData);
    // Do not reset the form to keep the text visible after submission
    // formRef.current?.reset();
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <Textarea
          name="content"
          placeholder="Paste job description or user profile text here..."
          rows={8}
          required
        />
        <SubmitButton />
      </form>
      {state.output && (
        <Card
          className={
            state.output.isAppropriate
              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          }
        >
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            {state.output.isAppropriate ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <CardTitle>
              {state.output.isAppropriate
                ? "Content is Appropriate"
                : "Content is Inappropriate"}
            </CardTitle>
          </CardHeader>
          {!state.output.isAppropriate && (
            <CardContent>
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-muted-foreground">{state.output.reason}</p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
