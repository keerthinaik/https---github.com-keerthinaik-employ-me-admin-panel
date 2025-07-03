
'use client';

import { JobForm } from "@/components/job-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Create New Job">
                 <Button variant="outline" onClick={() => router.push('/jobs')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Jobs
                </Button>
            </PageHeader>
            <JobForm />
        </div>
    )
}
