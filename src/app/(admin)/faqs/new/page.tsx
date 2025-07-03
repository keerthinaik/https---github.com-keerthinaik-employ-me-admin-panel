'use client';

import { FaqForm } from "@/components/faq-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewFaqPage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader title="Add New FAQ">
                 <Button variant="outline" onClick={() => router.push('/faqs')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to FAQs
                </Button>
            </PageHeader>
            <FaqForm />
        </div>
    )
}
