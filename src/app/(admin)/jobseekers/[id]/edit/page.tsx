
'use client'
import { JobseekerForm } from "@/components/jobseeker-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { jobseekers } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditJobseekerPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const jobseeker = jobseekers.find(j => j.id === id);

    if (!jobseeker) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Jobseeker">
                 <Button variant="outline" onClick={() => router.push('/jobseekers')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Jobseekers
                </Button>
            </PageHeader>
            <JobseekerForm jobseeker={jobseeker} />
        </div>
    )
}
