
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJob, updateJob, getSkillCategories, getSkills } from "@/services/api";
import { format, isValid } from "date-fns";
import {
    ArrowLeft, Briefcase, Building, Calendar, Clock, MapPin, DollarSign, List, Tag, Check, X, Tags, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Job, Skill, SkillCategory, Employer as EmployerType, JobCategory as JobCategoryType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function JobVerificationDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Job Verification Details">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Job Specifics</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-12 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary"/> Skills & Requirements</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-6 w-20 rounded-full" /></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Company</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Category & Benefits</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function JobVerificationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { toast } = useToast();
    const [job, setJob] = useState<Job | null>(null);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobData = useCallback(() => {
        if (id) {
            setIsLoading(true);
            Promise.all([
                getJob(id),
                getSkills({ limit: 1000 }),
                getSkillCategories({ limit: 1000 })
            ]).then(([jobData, skillsRes, categoriesRes]) => {
                setJob(jobData);
                setAllSkills(skillsRes.data);
                setSkillCategories(categoriesRes.data);
            }).catch(err => {
                console.error(err);
                notFound();
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [id]);

    useEffect(() => {
        fetchJobData();
    }, [fetchJobData]);
    
    const handleVerification = async (isActive: boolean) => {
        if (!job) return;
        try {
            await updateJob(job.id, { isActive });
            toast({
                title: 'Job Status Updated',
                description: `"${job.title}" has been ${isActive ? 'approved' : 'disapproved'}.`,
            });
            fetchJobData();
        } catch (error: any) {
            toast({
                title: 'Error updating job status',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    

    if (isLoading) {
        return <JobVerificationDetailsSkeleton />;
    }

    if (!job) {
        return notFound();
    }
    
    const company = job.employer as EmployerType;
    const category = job.jobCategory as JobCategoryType;

    return (
        <div>
            <PageHeader title="Job Verification Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/jobs/verification')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Verification List
                    </Button>
                    {!job.isActive ? (
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
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{job.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.type}</div>
                                {job.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.city}, {job.country}</div>}
                                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Posted {isValid(new Date(job.postingDate)) ? format(new Date(job.postingDate), 'MMM d, yyyy') : 'N/A'}</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Job Specifics</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><p className="font-medium text-foreground">Experience</p><p className="text-muted-foreground">{job.minExperience} - {job.maxExperience} years</p></div>
                                <div><p className="font-medium text-foreground">Salary</p><p className="text-muted-foreground">{job.ctcCurrency} {job.ctcMinAmount?.toLocaleString()}-{job.ctcMaxAmount?.toLocaleString()} / {job.ctcFrequency}</p></div>
                                <div><p className="font-medium text-foreground">Shift</p><p className="text-muted-foreground capitalize">{job.shiftType}</p></div>
                                <div><p className="font-medium text-foreground">Work Mode</p><p className="text-muted-foreground capitalize">{job.workMode.join(', ')}</p></div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary"/> Skills & Requirements</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             {job.skills && job.skills.length > 0 ? (
                                <div className="space-y-4">
                                    {skillCategories.map(category => {
                                        const relevantSkills = allSkills.filter(s =>
                                            s.skillCategory?.id === category.id && job.skills?.includes(s.id)
                                        );

                                        if (relevantSkills.length === 0) return null;

                                        return (
                                            <div key={category.id}>
                                                <h4 className="font-semibold mb-2 text-base">{category.name}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {relevantSkills.map(skill => (
                                                        <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No skills listed for this job.</p>
                            )}
                             {job.languagesRequired && job.languagesRequired.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-2">Languages</h4>
                                    <div className="flex flex-wrap gap-2">{job.languagesRequired.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                     {job.questions && job.questions.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle /> Screening Questions</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                {job.questions.map((q, i) => (
                                    <li key={q._id || i} className="text-sm">
                                        <p className="font-medium">{i+1}. {q.question}</p>
                                        <p className="text-muted-foreground text-xs capitalize pl-4">Type: {q.type.replace('-', ' ')}</p>
                                        {q.options && q.options.length > 0 && (
                                            <p className="text-muted-foreground text-xs pl-4">Options: {q.options.join(', ')}</p>
                                        )}
                                    </li>
                                ))}
                                </ul>
                            </CardContent>
                        </Card>
                     )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Badge variant={job.isActive ? 'default' : 'destructive'} className={job.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                {job.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                             <p className="text-xs text-muted-foreground mt-2">Openings: {job.numberOfPosts}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Company</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {company && (
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={company.profilePhoto} alt={company.name} />
                                        <AvatarFallback>{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{company.name}</h3>
                                        <Button variant="link" className="p-0 h-auto" asChild>
                                            <Link href={`/employers/${company.id}`}>View Company</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Category & Benefits</CardTitle></CardHeader>
                        <CardContent>
                           {category && (
                             <div className="flex items-center gap-2 text-sm mb-4">
                                <List className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Category:</span>
                                <span className="text-muted-foreground">{category.name}</span>
                            </div>
                           )}
                             {job.benefits && job.benefits.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Benefits</h4>
                                    <ul className="space-y-1">
                                        {job.benefits.map((b, i) => <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-green-500" />{b}</li>)}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
