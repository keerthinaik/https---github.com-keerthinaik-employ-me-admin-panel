
'use client';

import { SubAdminForm } from "@/components/sub-admin-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewSubAdminPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Sub Admin">
                 <Button variant="outline" onClick={() => router.push('/sub-admins')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Sub Admins
                </Button>
            </PageHeader>
            <SubAdminForm />
        </div>
    )
}
