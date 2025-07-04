
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
    ArrowLeft, MapPin, Globe, Clock, Phone, Mail, Handshake, Check, X
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Business } from '@/lib/types';
import { getBusiness, updateBusiness } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

function BusinessDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Business Verification Details">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center p-6">
                            <Skeleton className="h-24 w-24 rounded-full mb-4" />
                            <Skeleton className="h-7 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-1/2" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>About Business</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-6 w-32" />
                           <Skeleton className="h-6 w-32" />
                           <div className="pt-4 border-t space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-48" />
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function BusinessVerificationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [business, setBusiness] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBusiness = useCallback(() => {
        if (id) {
            setIsLoading(true);
            getBusiness(id)
                .then(data => setBusiness(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    useEffect(() => {
        fetchBusiness();
    }, [fetchBusiness]);
    
    const handleVerification = async (isVerified: boolean) => {
        if (!business) return;
        try {
            const formData = new FormData();
            formData.append('isVerified', String(isVerified));
            await updateBusiness(business.id, formData);
            toast({
                title: 'Verification Status Updated',
                description: `${business.name} has been ${isVerified ? 'approved' : 'disapproved'}.`,
            });
            fetchBusiness(); // Refetch data to show updated status
        } catch (error: any) {
            toast({
                title: 'Error updating status',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    
    if (isLoading) {
        return <BusinessDetailsSkeleton />;
    }

    if (!business) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="Business Verification Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/businesses/verification')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Verification List
                    </Button>
                    {!business.isVerified ? (
                        <Button className="bg-green-500 hover:bg-green-600" onClick={() => handleVerification(true)}>
                            <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={() => handleVerification(false)}>
                            <X className="mr-1 h-4 w-4" /> Disapprove
                        </Button>
                    )}
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center p-6">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={business.profilePhoto ? `${API_BASE_URL}${business.profilePhoto.startsWith('/') ? '' : '/'}${business.profilePhoto}` : undefined} alt={business.name} />
                                <AvatarFallback>{business.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{business.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                           <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 shrink-0" />
                                <a href={`mailto:${business.email}`} className="text-primary hover:underline break-all">{business.email}</a>
                           </div>
                            {business.phoneNumber && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 mt-1 shrink-0" />
                                    <span>{business.phoneNumber}</span>
                                </div>
                            )}
                           <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                <span>{business.city && business.country ? `${business.city}, ${business.country}`: 'Location not specified'}</span>
                           </div>
                             {business.website && (
                                <div className="flex items-start gap-3">
                                    <Globe className="h-4 w-4 mt-1 shrink-0" />
                                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">Website</a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Business</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{business.about || "No description provided."}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center gap-2">
                                <h4 className="font-medium">Verification:</h4>
                                <Badge variant={business.isVerified ? 'default' : 'secondary'} className={business.isVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {business.isVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                           </div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">Account:</h4>
                                <Badge variant={business.isActive ? 'default' : 'destructive'} className={business.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {business.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground pt-4 border-t">
                                <p>Joined: {isValid(new Date(business.createdAt)) ? format(new Date(business.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                                <p>Last Updated: {isValid(new Date(business.updatedAt)) ? formatDistanceToNow(new Date(business.updatedAt), { addSuffix: true }) : 'N/A'}</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
