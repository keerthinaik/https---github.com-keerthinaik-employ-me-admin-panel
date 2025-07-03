
'use client';

import { SubscriptionPlanForm } from "@/components/subscription-plan-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewJobseekerPlanPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Create Jobseeker Plan">
                 <Button variant="outline" onClick={() => router.push('/jobseeker-plans')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Plans
                </Button>
            </PageHeader>
            <SubscriptionPlanForm userType="JobSeeker" />
        </div>
    )
}
