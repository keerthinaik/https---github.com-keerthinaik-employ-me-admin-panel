
'use client'
import { ApplicationForm } from "@/components/application-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getApplication } from "@/services/api";
import type { Application } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function EditApplicationPageSkeleton() {
    return (
        <div>
            <PageHeader title="Edit Application">
                <Skeleton className="h-9 w-40" />
            </PageHeader>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-32 w-full" /></div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getApplication(id)
                .then(data => setApplication(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    if (isLoading) {
        return <EditApplicationPageSkeleton />;
    }

    if (!application) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Application">
                 <Button variant="outline" onClick={() => router.push('/applications')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Applications
                </Button>
            </PageHeader>
            <ApplicationForm application={application} />
        </div>
    )
}
