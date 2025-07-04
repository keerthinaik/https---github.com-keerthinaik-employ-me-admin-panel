
'use client'
import { EmployerForm } from "@/components/employer-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Employer } from "@/lib/types";
import { getEmployer } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EditEmployerPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [employer, setEmployer] = useState<Employer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getEmployer(id)
                .then(data => setEmployer(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Edit Employer">
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
    
    if (!employer) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Employer">
                 <Button variant="outline" onClick={() => router.push('/employers')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Employers
                </Button>
            </PageHeader>
            <EmployerForm employer={employer} />
        </div>
    )
}
