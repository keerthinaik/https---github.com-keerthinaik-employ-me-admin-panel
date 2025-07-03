
'use client';

import { UniversityForm } from "@/components/university-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewUniversityPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New University">
                 <Button variant="outline" onClick={() => router.push('/universities')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Universities
                </Button>
            </PageHeader>
            <UniversityForm />
        </div>
    )
}
