
'use client'
import { JobseekerForm } from "@/components/jobseeker-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Jobseeker } from "@/lib/types";
import { getJobseeker } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function EditJobseekerPageSkeleton() {
    return (
        <div>
            <PageHeader title="Edit Jobseeker">
                <Skeleton className="h-9 w-40" />
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}

export default function EditJobseekerPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getJobseeker(id)
                .then(data => setJobseeker(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    if (isLoading) {
        return <EditJobseekerPageSkeleton />;
    }
    
    if (!jobseeker) {
        return notFound();
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
