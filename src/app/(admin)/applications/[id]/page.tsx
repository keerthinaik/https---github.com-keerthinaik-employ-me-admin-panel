
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
    ArrowLeft, Edit, Calendar, Clock, FileText, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getApplication } from "@/services/api";
import type { Application, Job, Jobseeker, ApplicationStatus } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

function ApplicationDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Application Details">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-44" />
                </div>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Applicant</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div>
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-48 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Job</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-5 w-40" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-5 w-32" /></CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Application Status & Timeline</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function ApplicationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getApplication(id)
                .then(data => setApplication(data))
                .catch(err => {
                    console.error(err);
                    notFound();
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const getStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case 'Hired':
            case 'Offer Accepted':
                return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
            case 'Shortlisted':
            case 'Offered':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
            case 'Under Review':
            case 'Interview Scheduled':
                return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
             case 'Applied':
                return <Badge className="bg-primary/80 hover:bg-primary/90">{status}</Badge>;
            case 'Withdrawn':
            case 'Rejected':
            case 'Withdrawn by Candidate':
            case 'Offer Declined':
                return <Badge variant="destructive">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return <ApplicationDetailsSkeleton />;
    }

    if (!application) {
        return notFound();
    }
    
    const job = application.job as Job;
    const jobseeker = application.jobSeeker as Jobseeker;

    return (
        <div>
            <PageHeader title="Application Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/applications')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Applications
                    </Button>
                    <Button asChild>
                        <Link href={`/applications/${application.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit Application
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Applicant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {jobseeker && (
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-16 w-16">
                                        <AvatarImage src={jobseeker.profilePhoto ? `${API_BASE_URL}${jobseeker.profilePhoto}` : undefined} alt={jobseeker.name} />
                                        <AvatarFallback>{jobseeker.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-lg">{jobseeker.name}</h3>
                                        <p className="text-sm text-muted-foreground">{jobseeker.email}</p>
                                        <Button variant="link" className="p-0 h-auto" asChild>
                                            <Link href={`/jobseekers/${jobseeker.id}`}>View Profile</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {job && (
                                <div>
                                    <h3 className="font-semibold text-lg">{job.title}</h3>
                                    <p className="text-sm text-muted-foreground">{job.city}, {job.country}</p>
                                    <Button variant="link" className="p-0 h-auto" asChild>
                                        <Link href={`/jobs/${job.id}`}>View Job Post</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <a href={`${API_BASE_URL}${application.resume}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resume Used</a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Status & Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">Current Status:</h4>
                                {getStatusBadge(application.status)}
                            </div>
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-5 w-5" />
                                <span>Applied on {isValid(application.appliedAt) ? format(application.appliedAt, 'MMM d, yyyy') : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-5 w-5" />
                                <span>Last updated {isValid(application.updatedAt) ? formatDistanceToNow(application.updatedAt, { addSuffix: true }) : 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                    {application.coverLetter && (
                        <Card>
                            <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{application.coverLetter}</p>
                            </CardContent>
                        </Card>
                    )}
                    {application.whyShouldWeHireYou && (
                        <Card>
                            <CardHeader><CardTitle>Candidate's Pitch</CardTitle></CardHeader>
                             <CardDescription className="px-6 -mt-4">"Why should we hire you?"</CardDescription>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap pt-4">{application.whyShouldWeHireYou}</p>
                            </CardContent>
                        </Card>
                    )}
                    {application.answers && application.answers.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle /> Screening Answers</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {application.answers.map((item, index) => (
                                    <div key={item._id || index} className="text-sm">
                                        <p className="font-semibold">{item.question}</p>
                                        <p className="text-muted-foreground pl-4">
                                            {typeof item.answer === 'boolean' ? (item.answer ? 'Yes' : 'No') : Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                     <Card>
                        <CardHeader><CardTitle>Recruiter Feedback</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground italic">
                               {application.feedback || "No feedback added yet."}
                           </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
