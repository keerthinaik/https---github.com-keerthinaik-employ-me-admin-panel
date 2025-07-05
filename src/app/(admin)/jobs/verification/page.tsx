
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getJobs, updateJob, getEmployers } from '@/services/api';
import type { Job, Pagination, GetAllParams, Employer as EmployerType } from "@/lib/types";
import { format, isValid } from "date-fns";
import {
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
    Check,
    X,
    ChevronsUpDown
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'title' as const, label: 'Job Title', sortable: true, sortKey: 'title' },
    { key: 'employer' as const, label: 'Company', sortable: true, sortKey: 'employer.name' },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'isActive' },
    { key: 'postingDate' as const, label: 'Posted On', sortable: true, sortKey: 'postingDate' },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;

export default function JobVerificationPage() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [employers, setEmployers] = useState<EmployerType[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingEmployers, setIsLoadingEmployers] = useState(true);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [filters, setFilters] = useState({
        isActive: 'inactive', // Default to show pending jobs
        employerId: 'all',
    });

    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        title: true,
        employer: true,
        status: true,
        postingDate: true,
        actions: true,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
    const [rowsPerPageInput, setRowsPerPageInput] = useState<number | string>(ROWS_PER_PAGE);

    useEffect(() => {
        setIsLoadingEmployers(true);
        getEmployers({ limit: 1000 })
            .then(data => {
                setEmployers(data.data);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching employers',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => {
                setIsLoadingEmployers(false);
            });
    }, [toast]);


    const fetchJobs = useCallback(() => {
        setIsLoading(true);
        const apiFilters: Record<string, any> = {};
        if (debouncedSearchTerm) {
            apiFilters.title = debouncedSearchTerm;
        }
        if (filters.isActive !== 'all') {
            apiFilters.isActive = filters.isActive === 'active';
        }
        if (filters.employerId !== 'all') {
            apiFilters.employer = filters.employerId;
        }

        const sortString = sortConfig ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}` : undefined;
        const params: GetAllParams = { page: currentPage, limit: rowsPerPage, filters: apiFilters, sort: sortString };

        getJobs(params)
            .then(data => {
                setJobs(data.data);
                setPagination(data.pagination);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching jobs',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => setIsLoading(false));
    }, [currentPage, rowsPerPage, debouncedSearchTerm, filters, sortConfig, toast]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters, sortConfig, rowsPerPage]);

    const handleVerification = async (job: Job, isActive: boolean) => {
        try {
            await updateJob(job.id, { isActive });
            toast({
                title: 'Job Status Updated',
                description: `"${job.title}" has been ${isActive ? 'approved' : 'disapproved'}.`,
            });
            fetchJobs(); // refetch jobs
        } catch (error: any) {
            toast({
                title: 'Error updating job status',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive 
            ? <Badge className="bg-green-500 hover:bg-green-600 capitalize">Active</Badge>
            : <Badge variant="secondary" className="capitalize">Pending Approval</Badge>;
    }

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
        setFilters({ isActive: 'all', employerId: 'all' });
        setSortConfig({ key: 'updatedAt', direction: 'desc' });
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnsConfig.map(col => (
                columnVisibility[col.key] && (
                    <TableCell key={col.key}>
                        <Skeleton className={cn("h-5", {
                            "w-48": col.key === "title",
                            "w-32": col.key === "employer",
                            "w-20 rounded-full h-6": col.key === "status",
                            "w-24": col.key === "postingDate",
                            "w-48": col.key === "actions",
                        })} />
                    </TableCell>
                )
            ))}
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
                <div className='flex gap-2 w-full md:w-auto'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <SlidersHorizontal className="mr-1 h-4 w-4" /> Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filters</h4>
                                     <p className="text-sm text-muted-foreground">
                                        Refine job results.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <RadioGroup value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="r-stat-all" /><Label htmlFor="r-stat-all">All</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="active" id="r-stat-active" /><Label htmlFor="r-stat-active">Active</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="inactive" id="r-stat-inactive" /><Label htmlFor="r-stat-inactive">Pending Approval</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Employer</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                                disabled={isLoadingEmployers}
                                            >
                                                {isLoadingEmployers ? "Loading..." :
                                                    filters.employerId !== 'all'
                                                        ? employers.find(e => e.id === filters.employerId)?.name
                                                        : "Select employer..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search employer..." />
                                                <CommandEmpty>No employer found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem onSelect={() => handleFilterChange('employerId', 'all')}>All Employers</CommandItem>
                                                    {employers.map(employer => (
                                                        <CommandItem
                                                            key={employer.id}
                                                            value={employer.name}
                                                            onSelect={() => handleFilterChange('employerId', employer.id)}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", filters.employerId === employer.id ? "opacity-100" : "opacity-0")} />
                                                            {employer.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <Columns className="mr-1 h-4 w-4" /> Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {columnsConfig.filter(c => c.key !== 'actions').map(column => (
                                <DropdownMenuCheckboxItem key={column.key} className="capitalize" checked={columnVisibility[column.key]} onCheckedChange={(value) => setColumnVisibility(prev => ({...prev, [column.key]: !!value}))}>
                                    {column.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={clearFilters}><FilterX className="mr-1 h-4 w-4" /> Clear</Button>
                </div>
            </div>

            <div className="bg-card border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columnsConfig.map(col => (
                                columnVisibility[col.key] && (
                                    <TableHead key={col.key}>
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as string)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as string)}
                                            </Button>
                                        ) : (
                                            col.label
                                        )}
                                    </TableHead>
                                )
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonRow key={i} />)
                        ) : jobs.length > 0 ? (
                            jobs.map(job => (
                                <TableRow key={job.id}>
                                    {columnVisibility.title && <TableCell className="font-medium">{job.title}</TableCell>}
                                    {columnVisibility.employer && <TableCell className="text-muted-foreground">{(job.employer as EmployerType)?.name || 'N/A'}</TableCell>}
                                    {columnVisibility.status && <TableCell>{getStatusBadge(job.isActive)}</TableCell>}
                                    {columnVisibility.postingDate && <TableCell className="hidden lg:table-cell">{isValid(new Date(job.postingDate)) ? format(new Date(job.postingDate), 'MMM d, yyyy') : 'N/A'}</TableCell>}
                                    {columnVisibility.actions && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/jobs/verification/${job.id}`}><Eye className="mr-1 h-4 w-4"/> View</Link>
                                                </Button>
                                                {!job.isActive ? (
                                                    <Button size="sm" className="w-28 justify-center bg-green-500 hover:bg-green-600" onClick={() => handleVerification(job, true)}>
                                                        <Check className="mr-1 h-4 w-4"/> Approve
                                                    </Button>
                                                ) : (
                                                    <Button variant="destructive" size="sm" className="w-28 justify-center" onClick={() => handleVerification(job, false)}>
                                                        <X className="mr-1 h-4 w-4"/> Disapprove
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length} className="h-24 text-center">
                                    No jobs found.
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
