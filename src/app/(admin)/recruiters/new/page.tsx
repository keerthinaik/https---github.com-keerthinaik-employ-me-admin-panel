
'use client';

import { RecruiterForm } from "@/components/recruiter-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewRecruiterPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Recruiter">
                 <Button variant="outline" onClick={() => router.push('/recruiters')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Recruiters
                </Button>
            </PageHeader>
            <RecruiterForm />
        </div>
    )
}
