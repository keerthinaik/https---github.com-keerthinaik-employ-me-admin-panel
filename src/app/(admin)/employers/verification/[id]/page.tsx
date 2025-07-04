
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
    ArrowLeft, MapPin, Globe, Clock, Phone, Mail, FileText, Building, User, Hash, FileBadge, FileArchive, X, Check
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employer } from "@/lib/types";
import { getEmployer, updateEmployer } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

function EmployerDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Employer Verification Details">
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
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Legal & Web</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-48" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>About Company</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
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

export default function EmployerVerificationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { toast } = useToast();
    const [employer, setEmployer] = useState<Employer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEmployer = useCallback(() => {
        if (id) {
            setIsLoading(true);
            getEmployer(id)
                .then(data => setEmployer(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    useEffect(() => {
        fetchEmployer();
    }, [fetchEmployer]);
    
    const handleVerification = async (isVerified: boolean) => {
        if (!employer) return;
        try {
            const formData = new FormData();
            formData.append('isVerified', String(isVerified));
            await updateEmployer(employer.id, formData);
            toast({
                title: 'Verification Status Updated',
                description: `${employer.name} has been ${isVerified ? 'approved' : 'disapproved'}.`,
            });
            fetchEmployer(); // Refetch data to show updated status
        } catch (error: any) {
            toast({
                title: 'Error updating status',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return <EmployerDetailsSkeleton />;
    }

    if (!employer) {
        return notFound();
    }

    return (
        <div>
            <PageHeader title="Employer Verification Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/employers/verification')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Verification List
                    </Button>
                    {!employer.isVerified ? (
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
                                <AvatarImage src={employer.profilePhoto ? `${API_BASE_URL}${employer.profilePhoto.startsWith('/') ? '' : '/'}${employer.profilePhoto}` : undefined} alt={employer.name} />
                                <AvatarFallback>{employer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{employer.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                           <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 shrink-0" />
                                <a href={`mailto:${employer.email}`} className="text-primary hover:underline break-all">{employer.email}</a>
                           </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 mt-1 shrink-0" />
                                <span>{employer.phoneNumber}</span>
                           </div>
                           <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                <span>{`${employer.city}, ${employer.state} ${employer.country}`}</span>
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Legal & Web</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-gray-600" />
                                <a href={employer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">Website</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Hash className="h-5 w-5 text-gray-600" />
                                <span>Tax ID: {employer.taxNumber || 'N/A'}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <FileArchive className="h-5 w-5 text-gray-600" />
                                <span>Reg. No: {employer.registrationNumber || 'N/A'}</span>
                            </div>
                            {employer.taxCertificate && (
                                <div className="flex items-center gap-2">
                                    <FileBadge className="h-5 w-5 text-gray-600" />
                                    <a href={employer.taxCertificate} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Tax Certificate</a>
                                </div>
                            )}
                             {employer.registrationCertificate && (
                                <div className="flex items-center gap-2">
                                    <FileBadge className="h-5 w-5 text-gray-600" />
                                    <a href={employer.registrationCertificate} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Reg. Certificate</a>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Company</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{employer.about}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center gap-2">
                                <h4 className="font-medium">Verification:</h4>
                                <Badge variant={employer.isVerified ? 'default' : 'secondary'} className={employer.isVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {employer.isVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                           </div>
                             <div className="flex items-center gap-2">
                                <h4 className="font-medium">Account:</h4>
                                <Badge variant={employer.isActive ? 'default' : 'destructive'} className={employer.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {employer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground pt-4 border-t">
                                <p>Joined: {isValid(new Date(employer.createdAt)) ? format(new Date(employer.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                                <p>Last Updated: {isValid(new Date(employer.updatedAt)) ? formatDistanceToNow(new Date(employer.updatedAt), { addSuffix: true }) : 'N/A'}</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
