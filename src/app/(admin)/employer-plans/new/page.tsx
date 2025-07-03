
'use client';

import { SubscriptionPlanForm } from "@/components/subscription-plan-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewEmployerPlanPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Create Employer Plan">
                 <Button variant="outline" onClick={() => router.push('/employer-plans')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Plans
                </Button>
            </PageHeader>
            <SubscriptionPlanForm userType="Employer" />
        </div>
    )
}
