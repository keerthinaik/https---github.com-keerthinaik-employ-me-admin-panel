
'use client'
import { RecruiterForm } from "@/components/recruiter-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditRecruiterPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const user = users.find(j => j.id === id);

    if (!user || user.role !== 'Recruiter') {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Recruiter">
                 <Button variant="outline" onClick={() => router.push('/recruiters')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Recruiters
                </Button>
            </PageHeader>
            <RecruiterForm user={user} />
        </div>
    )
}
