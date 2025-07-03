
'use client';

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type JobCategory } from "@/lib/types";
import { getJobCategory } from "@/services/api";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { ArrowLeft, Edit, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function JobCategoryDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Category Details">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-7 w-48" />
                    </div>
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Description</h4>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="pt-6 border-t space-y-2">
                        <Skeleton className="h-5 w-52" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function JobCategoryDetailsPage() {
    const router = useRouter();
    const params = useParams();
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

    if (isLoading) {
        return <JobCategoryDetailsSkeleton />;
    }

    if (!category) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="Category Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/job-categories')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Categories
                    </Button>
                    <Button asChild>
                        <Link href={`/job-categories/${category.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Tag className="h-6 w-6 text-primary"/>
                        <CardTitle className="text-2xl">{category.name}</CardTitle>
                    </div>
                    <CardDescription>{category.slug}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Description</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{category.description || "No description provided."}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                         <div className="flex items-center gap-2">
                            <h4 className="font-medium">Status:</h4>
                            <Badge variant={category.isActive ? 'default' : 'secondary'} className={category.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                       </div>
                    </div>

                    <div className="text-sm text-muted-foreground pt-6 border-t space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {isValid(category.createdAt) ? format(category.createdAt, 'MMMM d, yyyy') : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4" />
                            <span>Last Updated: {isValid(category.updatedAt) ? formatDistanceToNow(category.updatedAt, { addSuffix: true }) : 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
