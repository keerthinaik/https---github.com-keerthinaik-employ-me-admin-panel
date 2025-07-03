
'use client';

import { CouponForm } from "@/components/coupon-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewCouponPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Create New Coupon">
                 <Button variant="outline" onClick={() => router.push('/coupons')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Coupons
                </Button>
            </PageHeader>
            <CouponForm />
        </div>
    )
}
