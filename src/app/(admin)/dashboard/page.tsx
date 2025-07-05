
'use client'
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, DollarSign, Users, FileText, ArrowUp } from "lucide-react";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application, Job, Jobseeker } from "@/lib/types";
import { getApplications } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

function DashboardSkeleton() {
    return (
        <div>
            <PageHeader title="Dashboard Overview" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Applicants (Week)</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Applications Received (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div className="flex items-center gap-4" key={i}>
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const applicationsByDay: any[] = []; // This would come from an analytics API

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // General dashboard loading
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoadingApps(true);
    getApplications({ limit: 5, sort: '-appliedAt' })
        .then(res => setRecentApps(res.data))
        .catch(err => toast({ title: "Failed to load recent applications", variant: "destructive" }))
        .finally(() => setIsLoadingApps(false));
  }, [toast]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <PageHeader title="Dashboard Overview" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,257</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Applicants (Week)</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 since last week</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Applications Received (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={applicationsByDay}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="applications" fill="var(--color-applications)" radius={4} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingApps ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div className="flex items-center gap-4" key={i}>
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Job</TableHead>
                            <TableHead><span className="sr-only">Date</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentApps.map(app => {
                            const jobseeker = app.jobSeeker as Jobseeker;
                            const job = app.job as Job;
                            return (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={jobseeker.profilePhoto ? `${API_BASE_URL}${jobseeker.profilePhoto}` : undefined} alt={jobseeker.name} />
                                                <AvatarFallback>{jobseeker.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{jobseeker.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{job.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{format(app.appliedAt, 'MMM d, yyyy')}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
