
'use client'
import { UniversityForm } from "@/components/university-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { universities } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditUniversityPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const university = universities.find(j => j.id === id);

    if (!university) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit University">
                 <Button variant="outline" onClick={() => router.push('/universities')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Universities
                </Button>
            </PageHeader>
            <UniversityForm university={university} />
        </div>
    )
}
