'use client'
import { AdminUserForm } from "@/components/admin-user-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditAdminPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const user = users.find(j => j.id === id);

    if (!user) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Admin">
                 <Button variant="outline" onClick={() => router.push('/admins')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Admins
                </Button>
            </PageHeader>
            <AdminUserForm user={user} />
        </div>
    )
}
