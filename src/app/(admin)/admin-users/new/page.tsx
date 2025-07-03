
'use client';

import { AdminUserForm } from "@/components/admin-user-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewAdminUserPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Admin">
                 <Button variant="outline" onClick={() => router.push('/admin-users')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Admins
                </Button>
            </PageHeader>
            <AdminUserForm />
        </div>
    )
}
