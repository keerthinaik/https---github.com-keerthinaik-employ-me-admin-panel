
'use client';

import { BusinessForm } from "@/components/business-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewBusinessPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New Business">
                 <Button variant="outline" onClick={() => router.push('/businesses')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Businesses
                </Button>
            </PageHeader>
            <BusinessForm />
        </div>
    )
}
