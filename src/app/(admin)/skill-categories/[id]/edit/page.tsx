
'use client'
import { SkillCategoryForm } from "@/components/skill-category-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SkillCategory } from "@/lib/types";
import { getSkillCategory } from "@/services/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditSkillCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [category, setCategory] = useState<SkillCategory | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getSkillCategory(id)
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
        return (
            <div>
                <PageHeader title="Edit Skill Category">
                    <Skeleton className="h-9 w-24" />
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
            <PageHeader title="Edit Skill Category">
                 <Button variant="outline" onClick={() => router.push('/skill-categories')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Categories
                </Button>
            </PageHeader>
            <SkillCategoryForm category={category} />
        </div>
    )
}
