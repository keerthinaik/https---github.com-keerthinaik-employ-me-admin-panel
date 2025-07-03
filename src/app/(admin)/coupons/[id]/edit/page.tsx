
'use client'
import { CouponForm } from "@/components/coupon-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { coupons } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditCouponPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const coupon = coupons.find(c => c.id === id);

    if (!coupon) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Coupon">
                 <Button variant="outline" onClick={() => router.push('/coupons')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Coupons
                </Button>
            </PageHeader>
            <CouponForm coupon={coupon} />
        </div>
    )
}
