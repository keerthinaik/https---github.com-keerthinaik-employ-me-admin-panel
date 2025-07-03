
'use client';

import { JobseekerForm } from "@/components/jobseeker-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewJobseekerPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Jobseeker">
                 <Button variant="outline" onClick={() => router.push('/jobseekers')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Jobseekers
                </Button>
            </PageHeader>
            <JobseekerForm />
        </div>
    )
}
