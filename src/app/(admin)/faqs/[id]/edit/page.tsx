'use client'
import { FaqForm } from "@/components/faq-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";

export default function EditFaqPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const faq = faqs.find(j => j.id === id);

    if (!faq) {
        notFound();
    }

    return (
        <div>
            <PageHeader title="Edit FAQ">
                 <Button variant="outline" onClick={() => router.push('/faqs')}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to FAQs
                </Button>
            </PageHeader>
            <FaqForm faq={faq} />
        </div>
    )
}
