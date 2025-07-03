
'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { jobs, type Job } from "@/lib/data";
import { format } from "date-fns";
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
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type SortConfig = {
    key: keyof Job;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'title' as const, label: 'Job Title', sortable: true, sortKey: 'title' as keyof Job },
    { key: 'company' as const, label: 'Company', sortable: true, sortKey: 'companyName' as keyof Job },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'status' as keyof Job },
    { key: 'postedDate' as const, label: 'Posted On', sortable: true, sortKey: 'postingDate' as keyof Job },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;
const allStatuses: Job['status'][] = ['active', 'inactive', 'draft', 'archived'];

export default function JobVerificationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'postingDate', direction: 'desc' });
    const [filters, setFilters] = useState({ status: 'all' });
    const [isLoading, setIsLoading] = useState(true);
    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        title: true,
        company: true,
        status: true,
        postedDate: true,
        actions: true,
    });
    const [currentPage, setCurrentPage] = useState(1);

    const getStatusBadge = (status: Job['status']) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-500 hover:bg-green-600 capitalize">{status}</Badge>;
            case 'inactive': return <Badge variant="secondary" className="capitalize">{status}</Badge>;
            case 'draft': return <Badge className="bg-yellow-500 hover:bg-yellow-600 capitalize">{status}</Badge>;
            case 'archived': return <Badge variant="destructive" className="capitalize">{status}</Badge>;
            default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
        }
    }

    const filteredAndSortedJobs = useMemo(() => {
        let sortedItems = [...jobs];

        // Filtering
        sortedItems = sortedItems.filter(job => {
            if (filters.status !== 'all' && job.status !== filters.status) return false;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    job.title.toLowerCase().includes(searchLower) ||
                    job.companyName.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });

        // Sorting
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof Job];
                const valB = b[key as keyof Job];
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sortedItems;
    }, [searchTerm, sortConfig, filters]);

    const totalPages = Math.ceil(filteredAndSortedJobs.length / ROWS_PER_PAGE);

    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedJobs.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, filteredAndSortedJobs]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const requestSort = (key: keyof Job) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Job) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'all' });
        setSortConfig({ key: 'postingDate', direction: 'desc' });
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.title && <TableCell><Skeleton className="h-5 w-48" /></TableCell>}
            {columnVisibility.company && <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.postedDate && <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>}
            {columnVisibility.actions && <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-24" /></div></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Job Verification" />
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by job title, company..."
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
                                    <p className="text-sm text-muted-foreground">Refine job results.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {allStatuses.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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
                                    <TableHead key={col.key} className={cn({
                                        'hidden md:table-cell': ['company', 'postedDate'].includes(col.key),
                                    })}>
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof Job)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof Job)}
                                            </Button>
                                        ) : (
                                            col.label === 'Actions' ? <span className="sr-only">{col.label}</span> : col.label
                                        )}
                                    </TableHead>
                                )
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             Array.from({ length: ROWS_PER_PAGE }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginatedJobs.length > 0 ? (
                            paginatedJobs.map(job => (
                                <TableRow key={job.id}>
                                    {columnVisibility.title && <TableCell className="font-medium">{job.title}</TableCell>}
                                    {columnVisibility.company && <TableCell className="text-muted-foreground hidden md:table-cell">{job.companyName}</TableCell>}
                                    {columnVisibility.status && <TableCell>{getStatusBadge(job.status)}</TableCell>}
                                    {columnVisibility.postedDate && <TableCell className="hidden md:table-cell">{format(job.postingDate, 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.actions && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/jobs/verification/${job.id}`}><Eye className="mr-1 h-4 w-4"/> View</Link>
                                                </Button>
                                                {job.status !== 'active' ? (
                                                    <Button size="sm" className="w-28 justify-center bg-green-500 hover:bg-green-600">
                                                        <Check className="mr-1 h-4 w-4"/> Approve
                                                    </Button>
                                                ) : (
                                                    <Button variant="destructive" size="sm" className="w-28 justify-center">
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
                {isLoading ? (
                    <Skeleton className="h-5 w-72" />
                ) : (
                    <div className="text-sm text-muted-foreground">
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredAndSortedJobs.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedJobs.length)} of {filteredAndSortedJobs.length} jobs.
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isLoading}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
                    <span className="text-sm text-muted-foreground">
                        Page {isLoading ? '...' : currentPage} of {isLoading ? '...' : totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || isLoading}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </div>
        </div>
    )
}
