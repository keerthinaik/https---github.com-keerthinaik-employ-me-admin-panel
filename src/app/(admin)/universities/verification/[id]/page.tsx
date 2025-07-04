

'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { universities } from "@/lib/data";
import { format, formatDistanceToNow } from "date-fns";
import {
    ArrowLeft, MapPin, Building, Clock, Phone, Mail, Check, X
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function UniversityDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="University Verification Details">
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
                            <Skeleton className="h-7 w-48" />
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
                        <CardHeader><CardTitle>About University</CardTitle></CardHeader>
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
                           <Skeleton className="h-6 w-24" />
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

export default function UniversityVerificationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const university = universities.find(j => j.id === id);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!university) {
        notFound();
    }

    if (isLoading) {
        return <UniversityDetailsSkeleton />;
    }

    return (
        <div>
            <PageHeader title="University Verification Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/universities/verification')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Verification List
                    </Button>
                    {!university.isVerified && (
                        <Button className="bg-green-500 hover:bg-green-600">
                            <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                    )}
                    {university.isVerified && (
                        <Button variant="destructive">
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
                                <AvatarImage src={university.profilePhoto} alt={university.name} />
                                <AvatarFallback>{university.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{university.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                           <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 shrink-0" />
                                <a href={`mailto:${university.email}`} className="text-primary hover:underline break-all">{university.email}</a>
                           </div>
                            {university.phoneNumber && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 mt-1 shrink-0" />
                                    <span>{university.phoneNumber}</span>
                                </div>
                            )}
                           <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                <span>{university.city && university.country ? `${university.city}, ${university.country}`: 'Location not specified'}</span>
                           </div>
                             <div className="flex items-start gap-3">
                                <Building className="h-4 w-4 mt-1 shrink-0" />
                                <span>Type: {university.type}{university.type === 'Other' ? ` (${university.otherType})` : ''}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About University</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{university.about || "No description provided."}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center gap-2">
                                <h4 className="font-medium">Verification:</h4>
                                <Badge variant={university.isVerified ? 'default' : 'secondary'} className={university.isVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {university.isVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                           </div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">Account:</h4>
                                <Badge variant={university.isActive ? 'default' : 'destructive'} className={university.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {university.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground pt-4 border-t">
                                <p>Joined: {format(new Date(university.createdAt), 'MMM d, yyyy')}</p>
                                <p>Last Updated: {formatDistanceToNow(new Date(university.updatedAt), { addSuffix: true })}</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
