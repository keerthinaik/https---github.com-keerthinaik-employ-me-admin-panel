
'use client'
import { SubscriptionPlanForm } from "@/components/subscription-plan-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { subscriptionPlans } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditEmployerPlanPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const plan = subscriptionPlans.find(p => p.id === id);

    if (!plan || !plan.userTypes.includes('Employer')) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Employer Plan">
                 <Button variant="outline" onClick={() => router.push('/employer-plans')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Plans
                </Button>
            </PageHeader>
            <SubscriptionPlanForm plan={plan} userType="Employer" />
        </div>
    )
}
