
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { users, permissionableModels } from "@/lib/data";
import { format, formatDistanceToNow } from "date-fns";
import {
    ArrowLeft, Check, X, Phone, Mail, ShieldCheck
} from "lucide-react";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const modelNameMap = permissionableModels.reduce((acc, model) => {
  acc[model.id] = model.name;
  return acc;
}, {} as Record<string, string>);


const formatPermissions = (permissions: string[] = []) => {
    const grouped = permissions.reduce((acc, p) => {
        const [modelId, operation] = p.split(':');
        if (!acc[modelId]) {
            acc[modelId] = [];
        }
        acc[modelId].push(operation[0].toUpperCase());
        return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(grouped).map(([modelId, ops]) => (
        <Badge key={modelId} variant="secondary" className="font-normal">
            {modelNameMap[modelId] || modelId} ({ops.join(',')})
        </Badge>
    ));
};

function SubAdminDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Sub Admin Verification">
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
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Permissions</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
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

export default function SubAdminVerificationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const user = users.find(j => j.id === id && j.role === 'SubAdmin');
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!user) {
        notFound();
    }

    if (isLoading) {
        return <SubAdminDetailsSkeleton />;
    }

    return (
        <div>
            <PageHeader title="Sub Admin Verification">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/sub-admins/verification')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Verification List
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600">
                        <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button variant="destructive">
                        <X className="mr-1 h-4 w-4" /> Disapprove
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center p-6">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                             <Badge className="bg-purple-500 hover:bg-purple-600"><ShieldCheck className="mr-1 h-3 w-3" />Sub-Admin</Badge>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                           <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 shrink-0" />
                                <a href={`mailto:${user.email}`} className="text-primary hover:underline break-all">{user.email}</a>
                           </div>
                            {user.phoneNumber && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 mt-1 shrink-0" />
                                    <span>{user.phoneNumber}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {user.permissions && user.permissions.length > 0
                                    ? formatPermissions(user.permissions)
                                    : <p className="text-sm text-muted-foreground">No permissions assigned.</p>}
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center gap-2">
                                <h4 className="font-medium">Account:</h4>
                                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {user.status}
                                </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground pt-4 border-t">
                                <p>Joined: {format(new Date(user.joinedAt), 'MMM d, yyyy')}</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
