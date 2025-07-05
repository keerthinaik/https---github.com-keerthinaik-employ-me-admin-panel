
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isValid } from "date-fns";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Search,
    SlidersHorizontal,
    ArrowDownUp,
    ArrowUp,
    ArrowDown,
    FilterX,
    Columns,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/lib/hooks';
import type { Application, Pagination, GetAllParams, ApplicationStatus, Jobseeker, Job } from "@/lib/types";
import { getApplications, deleteApplication } from '@/services/api';
import { applicationStatuses } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const columnsConfig = [
    { key: 'applicant' as const, label: 'Applicant', sortable: true, sortKey: 'jobSeeker.name' },
    { key: 'job' as const, label: 'Job Title', sortable: true, sortKey: 'job.title' },
    { key: 'appliedAt' as const, label: 'Applied On', sortable: true, sortKey: 'appliedAt' },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'status' },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;

export default function ApplicationsPage() {
    const { toast } = useToast();
    const [applications, setApplications] = useState<Application[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'appliedAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [filters, setFilters] = useState<{ status: ApplicationStatus | 'all' }>({
        status: 'all',
    });

    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        applicant: true,
        job: true,
        appliedAt: true,
        status: true,
        actions: true,
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
    const [rowsPerPageInput, setRowsPerPageInput] = useState<number | string>(ROWS_PER_PAGE);
    
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
    }

    const fetchApplications = useCallback(() => {
        setIsLoading(true);
        const apiFilters: Record<string, any> = {};
        if (debouncedSearchTerm) {
            apiFilters.search = debouncedSearchTerm; // A general search param for the backend
        }
        if (filters.status !== 'all') {
            apiFilters.status = filters.status;
        }

        const sortString = sortConfig ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}` : undefined;

        const params: GetAllParams = { page: currentPage, limit: rowsPerPage, filters: apiFilters, sort: sortString };

        getApplications(params)
            .then(data => {
                setApplications(data.data);
                setPagination(data.pagination);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching applications',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => setIsLoading(false));
    }, [currentPage, rowsPerPage, debouncedSearchTerm, filters, sortConfig, toast]);
    
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters, sortConfig, rowsPerPage]);

    const handleDelete = async (applicationId: string) => {
        try {
            await deleteApplication(applicationId);
            toast({
                title: 'Application Deleted',
                description: 'The application has been successfully deleted.',
            });
            fetchApplications();
        } catch (error: any) {
            toast({
                title: 'Error deleting application',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    
    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'all' });
        setSortConfig({ key: 'appliedAt', direction: 'desc' });
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnsConfig.map(col => columnVisibility[col.key] && (
                <TableCell key={col.key}>
                    <Skeleton className="h-5 w-full" />
                </TableCell>
            ))}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Application Tracking" />
            
             <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by applicant, job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className='flex gap-2 w-full md:w-auto'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <SlidersHorizontal className="mr-1 h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filters</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Refine application results.
                                    </p>
                                </div>
                                 <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={filters.status} onValueChange={(value) => setFilters({ status: value as any })}>
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {applicationStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" onClick={clearFilters}>
                        <FilterX className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="bg-card border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columnsConfig.map(col => (
                                <TableHead key={col.key}>
                                    {col.sortable ? (
                                        <Button variant="ghost" onClick={() => requestSort(col.sortKey as string)} className="px-0 h-auto hover:bg-transparent capitalize">
                                            {col.label} {getSortIcon(col.sortKey as string)}
                                        </Button>
                                    ) : (
                                        col.label === 'Actions' ? <span className="sr-only">{col.label}</span> : col.label
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonRow key={i} />)
                        ) : applications.length > 0 ? (
                            applications.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={(app.jobSeeker as Jobseeker)?.profilePhoto ? `${API_BASE_URL}${(app.jobSeeker as Jobseeker).profilePhoto}` : undefined} alt={(app.jobSeeker as Jobseeker)?.name} />
                                                <AvatarFallback>{(app.jobSeeker as Jobseeker)?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{(app.jobSeeker as Jobseeker)?.name}</p>
                                                <p className="text-sm text-muted-foreground">{(app.jobSeeker as Jobseeker)?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{(app.job as Job)?.title}</TableCell>
                                    <TableCell>{isValid(app.appliedAt) ? format(app.appliedAt, 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/applications/${app.id}`}><Eye className="mr-1 h-4 w-4"/> View Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/applications/${app.id}/edit`}><Edit className="mr-1 h-4 w-4"/> Update Status</Link>
                                                    </DropdownMenuItem>
                                                     <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                            <Trash2 className="mr-1 h-4 w-4"/> Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the application.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(app.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={columnsConfig.length} className="h-24 text-center">
                                    No results found.
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
                       `Showing ${pagination.totalRecords === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1} to ${Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of ${pagination.totalRecords} applications.`
                   )}
               </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {isLoading || !pagination ? '...' : pagination.currentPage} of {isLoading || !pagination ? '...' : pagination.totalPages}
                    </span>
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
    )
}
