
'use client'
import { JobForm } from "@/components/job-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { jobs } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const job = jobs.find(j => j.id === id);

    if (!job) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Job Posting">
                 <Button variant="outline" onClick={() => router.push('/jobs')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Jobs
                </Button>
            </PageHeader>
            <JobForm job={job} />
        </div>
    )
}
