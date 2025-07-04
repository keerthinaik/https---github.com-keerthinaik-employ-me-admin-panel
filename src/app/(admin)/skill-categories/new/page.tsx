
'use client';

import { SkillCategoryForm } from "@/components/skill-category-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewSkillCategoryPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Skill Category">
                 <Button variant="outline" onClick={() => router.push('/skill-categories')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Categories
                </Button>
            </PageHeader>
            <SkillCategoryForm />
        </div>
    )
}
