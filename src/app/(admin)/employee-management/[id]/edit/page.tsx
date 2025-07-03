
'use client'
import { EmployeeForm } from "@/components/employee-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const user = users.find(j => j.id === id);

    if (!user || user.role === 'Admin') { // Prevent editing admins from this page
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Employee">
                 <Button variant="outline" onClick={() => router.push('/employee-management')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Employees
                </Button>
            </PageHeader>
            <EmployeeForm user={user} />
        </div>
    )
}
