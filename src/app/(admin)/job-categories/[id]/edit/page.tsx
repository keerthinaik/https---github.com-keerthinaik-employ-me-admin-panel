
'use client';
import { JobCategoryForm } from "@/components/job-category-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getJobCategory } from "@/services/api";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams, useSearchParams } from "next/navigation";
import type { JobCategory } from "@/lib/types";
import { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

function EditJobCategoryForm() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [category, setCategory] = useState<JobCategory | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getJobCategory(id)
                .then(data => {
                    setCategory(data);
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

    const handleBack = () => {
        const page = searchParams.get('page');
        const backUrl = `/job-categories${page ? `?page=${page}` : ''}`;
        router.push(backUrl);
    }

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Edit Job Category">
                    <Skeleton className="h-9 w-40" />
                </PageHeader>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!category) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Job Category">
                 <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Job Categories
                </Button>
            </PageHeader>
            <JobCategoryForm category={category} />
        </div>
    )
}

export default function EditJobCategoryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditJobCategoryForm />
        </Suspense>
    )
}
