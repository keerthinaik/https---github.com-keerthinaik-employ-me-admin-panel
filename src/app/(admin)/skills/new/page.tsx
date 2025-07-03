
'use client';

import { SkillForm } from "@/components/skill-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewSkillPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Skill">
                 <Button variant="outline" onClick={() => router.push('/skills')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Skills
                </Button>
            </PageHeader>
            <SkillForm />
        </div>
    )
}
