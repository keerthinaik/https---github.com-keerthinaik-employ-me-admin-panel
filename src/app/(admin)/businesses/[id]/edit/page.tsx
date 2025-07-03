
'use client'
import { BusinessForm } from "@/components/business-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { businesses } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const business = businesses.find(j => j.id === id);

    if (!business) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit Business">
                 <Button variant="outline" onClick={() => router.push('/businesses')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Businesses
                </Button>
            </PageHeader>
            <BusinessForm business={business} />
        </div>
    )
}
