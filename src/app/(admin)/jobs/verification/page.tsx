

'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Job, type Pagination, type GetAllParams, type Employer as EmployerType } from "@/lib/types";
import { getJobs, updateJob } from '@/services/api';
import { format, isValid } from 'date-fns';
import {
    Eye,
    Search,
    ChevronLeft,
    ChevronRight,
    Check,
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/lib/hooks';

const ROWS_PER_PAGE = 10;

export default function JobVerificationPage() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
    const [rowsPerPageInput, setRowsPerPageInput] = useState<number | string>(ROWS_PER_PAGE);

    const fetchJobs = useCallback(() => {
        setIsLoading(true);
        const apiFilters: Record<string, any> = { isActive: false };
        if (debouncedSearchTerm) {
            apiFilters.title = debouncedSearchTerm;
        }

        const params: GetAllParams = { page: currentPage, limit: rowsPerPage, filters: apiFilters, sort: '-updatedAt' };

        getJobs(params)
            .then(data => {
                setJobs(data.data);
                setPagination(data.pagination);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching jobs for verification',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => setIsLoading(false));
    }, [currentPage, rowsPerPage, debouncedSearchTerm, toast]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, rowsPerPage]);

    const handleApprove = async (job: Job) => {
        try {
            await updateJob(job.id, { isActive: true });
            toast({
                title: 'Job Approved',
                description: `"${job.title}" has been successfully approved and is now active.`,
            });
            fetchJobs();
        } catch (error: any) {
             toast({
                title: 'Error approving job',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const SkeletonRow = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-24" /></div></TableCell>
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Job Verification" />
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="bg-card border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Posted On</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonRow key={i} />)
                        ) : jobs.length > 0 ? (
                            jobs.map(job => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{(job.employer as EmployerType)?.name || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="secondary">Pending Approval</Badge></TableCell>
                                    <TableCell>{isValid(new Date(job.postingDate)) ? format(new Date(job.postingDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/jobs/verification/${job.id}`}><Eye className="mr-1 h-4 w-4"/> View</Link>
                                            </Button>
                                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(job)}>
                                                <Check className="mr-1 h-4 w-4"/> Approve
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No jobs are currently pending verification.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-between mt-4">
                 <div className="text-sm text-muted-foreground">
                    {isLoading || !pagination ? (
                        <Skeleton className="h-5 w-48" />
                    ) : (
                        `Showing ${pagination.totalRecords === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1} to ${Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of ${pagination.totalRecords} jobs.`
                    )}
                </div>
                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Input
                            type="number"
                            className="h-8 w-[70px]"
                            value={rowsPerPageInput}
                            onChange={(e) => setRowsPerPageInput(e.target.value)}
                            onBlur={() => {
                                const newRows = Number(rowsPerPageInput);
                                if (newRows > 0) {
                                    setRowsPerPage(newRows);
                                } else {
                                    setRowsPerPageInput(rowsPerPage);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const newRows = Number(rowsPerPageInput);
                                    if (newRows > 0) {
                                        setRowsPerPage(newRows);
                                    } else {
                                        setRowsPerPageInput(rowsPerPage);
                                    }
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            min={1}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {isLoading || !pagination ? '...' : pagination.currentPage} of {isLoading || !pagination ? '...' : pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination?.totalPages || 1))}
                            disabled={currentPage === pagination?.totalPages || isLoading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
