
'use client';

import { EmployerForm } from "@/components/employer-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewEmployerPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Employer">
                 <Button variant="outline" onClick={() => router.push('/employers')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Employers
                </Button>
            </PageHeader>
            <EmployerForm />
        </div>
    )
}
