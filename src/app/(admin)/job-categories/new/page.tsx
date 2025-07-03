
'use client';

import { JobCategoryForm } from "@/components/job-category-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewJobCategoryPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Job Category">
                 <Button variant="outline" onClick={() => router.push('/job-categories')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Job Categories
                </Button>
            </PageHeader>
            <JobCategoryForm />
        </div>
    )
}
