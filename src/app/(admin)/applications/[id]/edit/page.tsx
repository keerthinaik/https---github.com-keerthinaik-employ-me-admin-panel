
'use client'
import { ApplicationForm } from "@/components/application-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { applications } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const application = applications.find(j => j.id === id);

    if (!application) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Application">
                 <Button variant="outline" onClick={() => router.push('/applications')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Applications
                </Button>
            </PageHeader>
            <ApplicationForm application={application} />
        </div>
    )
}
