
'use client'
import { EmployerForm } from "@/components/employer-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { employers } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditEmployerPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const employer = employers.find(j => j.id === id);

    if (!employer) {
        notFound();
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
