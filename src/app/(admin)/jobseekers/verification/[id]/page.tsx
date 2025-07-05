
'use client';

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, formatDistanceToNow, isValid } from "date-fns";
import {
    ArrowLeft, GraduationCap, UserCheck, Linkedin, Github, Phone, Mail, FileText, MapPin, Globe, Building, Briefcase, Calendar, Star, GanttChartSquare, Award, Tags, Check, X
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getJobseeker, updateJobseeker, getSkillCategories, getSkills } from '@/services/api';
import type { Jobseeker, Skill, SkillCategory } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

function JobseekerDetailsSkeleton() {
    return (
        <div>
            <PageHeader title="Jobseeker Verification Details">
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
                            <Skeleton className="h-5 w-5/6" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-5 w-full" />
                            <div className="border-t pt-4 space-y-2">
                                <Skeleton className="h-4 w-32 mx-auto" />
                                <Skeleton className="h-4 w-40 mx-auto" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Links & Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-5 w-28" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>About</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function JobseekerVerificationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { toast } = useToast();
    const [jobseeker, setJobseeker] = useState<Jobseeker | null>(null);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobseekerData = useCallback(() => {
        if (id) {
            setIsLoading(true);
            Promise.all([
                getJobseeker(id),
                getSkills({ limit: 1000 }),
                getSkillCategories({ limit: 1000 })
            ]).then(([jobseekerData, skillsRes, categoriesRes]) => {
                setJobseeker(jobseekerData);
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
        fetchJobseekerData();
    }, [fetchJobseekerData]);

    const handleVerification = async (isVerified: boolean) => {
        if (!jobseeker) return;
        try {
            const formData = new FormData();
            formData.append('isVerified', String(isVerified));
            await updateJobseeker(jobseeker.id, formData);
            toast({
                title: 'Verification Status Updated',
                description: `${jobseeker.name} has been ${isVerified ? 'approved' : 'disapproved'}.`,
            });
            fetchJobseekerData(); // Refetch data to show updated status
        } catch (error: any) {
            toast({
                title: 'Error updating status',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return <JobseekerDetailsSkeleton />;
    }

    if (!jobseeker) {
        return notFound();
    }
    
    const getFullUrl = (path?: string) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <div>
            <PageHeader title="Jobseeker Verification Details">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/jobseekers/verification')}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Verification List
                    </Button>
                    {!jobseeker.isVerified ? (
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
                            <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary ring-offset-2 ring-offset-background">
                                <AvatarImage src={getFullUrl(jobseeker.profilePhoto)} alt={jobseeker.name} />
                                <AvatarFallback>{jobseeker.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{jobseeker.name}</CardTitle>
                             <CardDescription>{jobseeker.headline}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                           <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 shrink-0" />
                                <a href={`mailto:${jobseeker.email}`} className="text-primary hover:underline break-all">{jobseeker.email}</a>
                           </div>
                            {jobseeker.phoneNumber && (<div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 mt-1 shrink-0" />
                                <span>{jobseeker.phoneNumber}</span>
                           </div>)}
                           {(jobseeker.city || jobseeker.country) && (<div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                <span>{jobseeker.city}, {jobseeker.country}</span>
                           </div>)}
                            <div className="flex items-start gap-3">
                                <UserCheck className="h-4 w-4 mt-1 shrink-0" />
                                <Badge variant={jobseeker.isVerified ? 'default' : 'secondary'} className={jobseeker.isVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {jobseeker.isVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                            </div>
                            <div className="text-xs text-center pt-4 border-t">
                                <p>Joined: {format(new Date(jobseeker.createdAt), 'MMM d, yyyy')}</p>
                                <p>Last Updated: {formatDistanceToNow(new Date(jobseeker.updatedAt), { addSuffix: true })}</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Links & Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {jobseeker.linkedInProfile && (
                                <div className="flex items-center gap-2">
                                    <Linkedin className="h-5 w-5 text-blue-700" />
                                    <a href={jobseeker.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn Profile</a>
                                </div>
                            )}
                             {jobseeker.githubProfile && (
                                <div className="flex items-center gap-2">
                                    <Github className="h-5 w-5 text-gray-800" />
                                    <a href={jobseeker.githubProfile} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">GitHub Profile</a>
                                </div>
                             )}
                            {jobseeker.portfolio && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-gray-600" />
                                    <a href={jobseeker.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portfolio</a>
                                </div>
                             )}
                             {jobseeker.resume && (
                                 <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                    <a href={getFullUrl(jobseeker.resume)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Resume</a>
                                </div>
                             )}
                             {jobseeker.certifications && jobseeker.certifications.length > 0 && (
                                <div className="space-y-2 pt-4 border-t">
                                    <h4 className="font-medium text-sm flex items-center gap-2"><Award className="h-5 w-5 text-gray-600" /> Certifications</h4>
                                    <ul className="pl-5 space-y-1">
                                    {jobseeker.certifications.map((cert, index) => (
                                        <li key={index}>
                                            <a href={getFullUrl(cert)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Certification Document {index + 1}</a>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>About</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground whitespace-pre-wrap">
                               {jobseeker.about || jobseeker.summary || "No summary provided."}
                           </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                        <CardContent>
                           {jobseeker.experience && jobseeker.experience.length > 0 ? (
                               <div className="space-y-6">
                                   {jobseeker.experience.map((exp, index) => (
                                       <div key={index} className="flex gap-4">
                                           <Briefcase className="h-5 w-5 text-primary mt-1 shrink-0" />
                                           <div>
                                               <h4 className="font-semibold">{exp.jobTitle}</h4>
                                               <p className="text-muted-foreground">{exp.companyName}</p>
                                               <p className="text-xs text-muted-foreground">{`${isValid(new Date(exp.startDate)) ? format(new Date(exp.startDate), 'MMM yyyy') : ''} - ${exp.isCurrent ? 'Present' : exp.endDate && isValid(new Date(exp.endDate)) ? format(new Date(exp.endDate), 'MMM yyyy') : ''}`}</p>
                                                {exp.responsibilities && exp.responsibilities.length > 0 && (
                                                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                                                        {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                                                    </ul>
                                                )}
                                                {exp.achievements && exp.achievements.length > 0 && (
                                                    <div className="mt-2">
                                                        <h5 className="font-semibold text-sm flex items-center gap-1.5"><Star className="h-3.5 w-3.5"/>Achievements</h5>
                                                        <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                                                            {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <p className="text-muted-foreground">Work experience data not available.</p>
                           )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                         <CardContent>
                           {jobseeker.education && jobseeker.education.length > 0 ? (
                               <div className="space-y-4">
                                   {jobseeker.education.map((edu, index) => (
                                       <div key={index} className="flex gap-4">
                                           <GraduationCap className="h-5 w-5 text-primary mt-1 shrink-0" />
                                           <div>
                                               <h4 className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</h4>
                                               <p className="text-muted-foreground">{edu.institution}</p>
                                                {edu.cgpa && <p className="text-sm text-muted-foreground">CGPA: {edu.cgpa}</p>}
                                               <p className="text-xs text-muted-foreground">{`${isValid(new Date(edu.startDate)) ? format(new Date(edu.startDate), 'MMM yyyy') : ''} - ${isValid(new Date(edu.endDate)) ? format(new Date(edu.endDate), 'MMM yyyy') : ''}`}</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <p className="text-muted-foreground">Education data not available.</p>
                           )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary"/> Skills</CardTitle></CardHeader>
                        <CardContent>
                            {jobseeker.skills && jobseeker.skills.length > 0 ? (
                                <div className="space-y-4">
                                    {skillCategories.map(category => {
                                        const relevantSkills = allSkills.filter(s =>
                                            s.skillCategory?.id === category.id && jobseeker.skills?.includes(s.id)
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
                                <p className="text-muted-foreground">No skills listed.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
                         <CardContent>
                           {jobseeker.projects && jobseeker.projects.length > 0 ? (
                               <div className="space-y-4">
                                   {jobseeker.projects.map((proj, index) => (
                                       <div key={index} className="flex gap-4">
                                           <GanttChartSquare className="h-5 w-5 text-primary mt-1 shrink-0" />
                                           <div>
                                               <h4 className="font-semibold">{proj.title}</h4>
                                               <p className="text-sm text-muted-foreground">{proj.description}</p>
                                                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Project</a>}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <p className="text-muted-foreground">No projects listed.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
