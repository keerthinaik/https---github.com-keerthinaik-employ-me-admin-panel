
'use client';

import { SubscriptionPlanForm } from "@/components/subscription-plan-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewUniversityPlanPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Create University Plan">
                 <Button variant="outline" onClick={() => router.push('/university-plans')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Plans
                </Button>
            </PageHeader>
            <SubscriptionPlanForm userType="University" />
        </div>
    )
}
