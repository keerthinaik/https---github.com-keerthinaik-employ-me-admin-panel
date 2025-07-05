
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
    ArrowLeft, Edit, MapPin, Globe, Clock, Phone, Mail, UserCheck
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileUser } from '@/lib/types';
import { getSubAdminUser } from '@/services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

function SubAdminDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Sub Admin Details">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
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

export default function SubAdminDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [admin, setAdmin] = useState<ProfileUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getSubAdminUser(id)
                .then(data => setAdmin(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);
    
    if (isLoading) {
        return <SubAdminDetailsSkeleton />;
    }

    if (!admin) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="Sub Admin Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/sub-admins')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Sub Admins
                    </Button>
                    <Button asChild>
                        <Link href={`/sub-admins/${admin.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center p-6">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={admin.profilePhoto ? `${API_BASE_URL}${admin.profilePhoto.startsWith('/') ? '' : '/'}${admin.profilePhoto}` : undefined} alt={admin.name} />
                                <AvatarFallback>{admin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{admin.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                           <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 shrink-0" />
                                <a href={`mailto:${admin.email}`} className="text-primary hover:underline break-all">{admin.email}</a>
                           </div>
                            {admin.phoneNumber && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 mt-1 shrink-0" />
                                    <span>{admin.phoneNumber}</span>
                                </div>
                            )}
                           <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                <span>{admin.city && admin.country ? `${admin.city}, ${admin.country}`: 'Location not specified'}</span>
                           </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center gap-2">
                                <h4 className="font-medium">Verification:</h4>
                                <Badge variant={admin.isVerified ? 'default' : 'secondary'} className={admin.isVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {admin.isVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                           </div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">Account:</h4>
                                <Badge variant={admin.isActive ? 'default' : 'destructive'} className={admin.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {admin.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground pt-4 border-t">
                                <p>Joined: {isValid(new Date(admin.createdAt)) ? format(new Date(admin.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                                <p>Last Updated: {isValid(new Date(admin.updatedAt)) ? formatDistanceToNow(new Date(admin.updatedAt), { addSuffix: true }) : 'N/A'}</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
