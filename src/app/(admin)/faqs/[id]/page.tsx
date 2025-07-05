'use client';

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type Faq } from "@/lib/types";
import { getFaq } from "@/services/api";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { ArrowLeft, Edit, Calendar, Clock, HelpCircle, Hash } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FaqDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="FAQ Details">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-6 w-6 rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-96" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Answer</h4>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                        <Skeleton className="h-6 w-32" />
                         <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="pt-6 border-t space-y-2">
                        <Skeleton className="h-5 w-52" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function FaqDetailsPage() {
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
        return <FaqDetailsSkeleton />;
    }

    if (!faq) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="FAQ Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/faqs')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to FAQs
                    </Button>
                    <Button asChild>
                        <Link href={`/faqs/${faq.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <Card>
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <HelpCircle className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <CardTitle className="text-2xl leading-tight">{faq.question}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Answer</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                         <div className="flex items-center gap-2">
                            <h4 className="font-medium">Status:</h4>
                            <Badge variant={faq.isActive ? 'default' : 'secondary'} className={faq.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                {faq.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                       </div>
                       <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">Display Order:</h4>
                            <span>{faq.order}</span>
                       </div>
                    </div>

                    <div className="text-sm text-muted-foreground pt-6 border-t space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {isValid(new Date(faq.createdAt)) ? format(new Date(faq.createdAt), 'MMMM d, yyyy') : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4" />
                            <span>Last Updated: {isValid(new Date(faq.updatedAt)) ? formatDistanceToNow(new Date(faq.updatedAt), { addSuffix: true }) : 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
