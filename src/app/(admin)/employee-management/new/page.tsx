
'use client';

import { EmployeeForm } from "@/components/employee-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Employee">
                 <Button variant="outline" onClick={() => router.push('/employee-management')}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Employees
                </Button>
            </PageHeader>
            <EmployeeForm />
        </div>
    )
}
