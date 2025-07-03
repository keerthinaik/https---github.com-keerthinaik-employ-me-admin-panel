import { ModerationForm } from "@/components/moderation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanEye } from "lucide-react";

export default function ModerationPage() {
  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <ScanEye className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">AI-Powered Content Moderation</CardTitle>
          <CardDescription>
            Enter any text content, such as a job description or user profile, to check if it's appropriate.
            Our AI will analyze the text for any violations of our content policy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModerationForm />
        </CardContent>
      </Card>
    </div>
  );
}
