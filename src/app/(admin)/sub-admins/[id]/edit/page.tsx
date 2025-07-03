
'use client'
import { SubAdminForm } from "@/components/sub-admin-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditSubAdminPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const user = users.find(j => j.id === id);

    if (!user || user.role !== 'SubAdmin') {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Sub Admin">
                 <Button variant="outline" onClick={() => router.push('/sub-admins')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Sub Admins
                </Button>
            </PageHeader>
            <SubAdminForm user={user} />
        </div>
    )
}
