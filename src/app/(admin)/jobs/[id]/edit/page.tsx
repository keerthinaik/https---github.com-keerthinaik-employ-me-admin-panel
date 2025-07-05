

'use client'
import { JobForm } from "@/components/job-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getJob } from "@/services/api";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getJob(id)
                .then(data => {
                    setJob(data);
                })
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [id]);

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Edit Job Posting">
                    <Skeleton className="h-9 w-40" />
                </PageHeader>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4 mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-20 w-full" /></div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!job) {
        return notFound();
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
