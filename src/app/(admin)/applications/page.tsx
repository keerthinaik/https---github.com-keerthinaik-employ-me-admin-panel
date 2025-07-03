

'use client';

import { useState, useMemo, useEffect } from 'react';
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
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { applications, type Application } from "@/lib/data";
import { format } from "date-fns";
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

type SortConfig = {
    key: keyof Application;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'applicantName' as const, label: 'Applicant', sortable: true, sortKey: 'applicantName' as keyof Application },
    { key: 'jobTitle' as const, label: 'Job Title', sortable: true, sortKey: 'jobTitle' as keyof Application },
    { key: 'appliedAt' as const, label: 'Applied On', sortable: true, sortKey: 'appliedAt' as keyof Application },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'status' as keyof Application },
    { key: 'updatedAt' as const, label: 'Last Updated', sortable: true, sortKey: 'updatedAt' as keyof Application },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 5;
const allStatuses: Application['status'][] = ['Applied', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];


export default function ApplicationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    const [filters, setFilters] = useState({
        status: 'all',
    });
    const [isLoading, setIsLoading] = useState(true);

    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        applicantName: true,
        jobTitle: true,
        appliedAt: true,
        status: true,
        updatedAt: false,
        actions: true,
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    
    const getStatusBadge = (status: Application['status']) => {
        switch (status) {
            case 'Hired':
                return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
            case 'Shortlisted':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
            case 'Under Review':
                return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
             case 'Applied':
                return <Badge className="bg-primary/80 hover:bg-primary/90">{status}</Badge>;
            case 'Withdrawn':
            case 'Rejected':
                return <Badge variant="destructive">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    }

    const filteredAndSortedApplications = useMemo(() => {
        let sortedItems = [...applications];

        // Filtering
        sortedItems = sortedItems.filter(app => {
            if (filters.status !== 'all' && app.status !== filters.status) return false;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    app.applicantName.toLowerCase().includes(searchLower) ||
                    app.jobTitle.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });

        // Sorting
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof Application] as any;
                const valB = b[key as keyof Application] as any;
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sortedItems;
    }, [searchTerm, sortConfig, filters]);

    const totalPages = Math.ceil(filteredAndSortedApplications.length / ROWS_PER_PAGE);

    const paginatedApplications = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedApplications.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, filteredAndSortedApplications]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filters]);


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const requestSort = (key: keyof Application) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Application) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'all' });
        setSortConfig({ key: 'updatedAt', direction: 'desc' });
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.applicantName && <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>}
            {columnVisibility.jobTitle && <TableCell><Skeleton className="h-4 w-40" /></TableCell>}
            {columnVisibility.appliedAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.actions && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Application Tracking" />
            
             <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by applicant name, job title..."
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
                                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {allStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <Columns className="mr-1 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {columnsConfig.filter(c => c.key !== 'actions').map(column => (
                                <DropdownMenuCheckboxItem
                                    key={column.key}
                                    className="capitalize"
                                    checked={columnVisibility[column.key as keyof typeof columnVisibility]}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility(prev => ({...prev, [column.key as keyof typeof columnVisibility]: !!value}))
                                    }
                                >
                                    {column.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                                columnVisibility[col.key as keyof typeof columnVisibility] && (
                                    <TableHead key={col.key}>
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof Application)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof Application)}
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
                        ) : paginatedApplications.length > 0 ? (
                            paginatedApplications.map(app => (
                                <TableRow key={app.id}>
                                    {columnVisibility.applicantName && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={app.applicantAvatar} alt={app.applicantName} />
                                                    <AvatarFallback>{app.applicantName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium">{app.applicantName}</p>
                                            </div>
                                        </TableCell>
                                    )}
                                    {columnVisibility.jobTitle && <TableCell className="text-muted-foreground">{app.jobTitle}</TableCell>}
                                    {columnVisibility.appliedAt && <TableCell>{format(app.appliedAt, 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.status && <TableCell>{getStatusBadge(app.status)}</TableCell>}
                                    {columnVisibility.updatedAt && <TableCell>{format(app.updatedAt, 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.actions && (
                                        <TableCell>
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
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                        <Trash2 className="mr-1 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length} className="h-24 text-center">
                                    No results found.
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
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredAndSortedApplications.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedApplications.length)} of {filteredAndSortedApplications.length} applications.
                    </div>
                )}
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
                        Page {isLoading ? '...' : currentPage} of {isLoading ? '...' : totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
