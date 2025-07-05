'use client'
import { FaqForm } from "@/components/faq-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getFaq } from "@/services/api";
import { ChevronLeft } from "lucide-react";
import { useRouter, notFound, useParams } from "next/navigation";
import type { Faq } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function EditFaqPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [faq, setFaq] = useState<Faq | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getFaq(id)
                .then(data => {
                    setFaq(data);
                })
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [id]);

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Edit FAQ">
                    <Skeleton className="h-9 w-40" />
                </PageHeader>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4 mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-20 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-40 w-full" /></div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!faq) {
        return notFound();
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
