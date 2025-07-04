

'use client';

import { useState, useMemo, useEffect, type Key } from 'react';
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { jobseekers, type Jobseeker } from "@/lib/data";
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
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Check,
    X
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

type SortConfig = {
    key: keyof Jobseeker;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'user' as const, label: 'User', sortable: true, sortKey: 'name' as keyof Jobseeker },
    { key: 'phone' as const, label: 'Phone', sortable: false },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'isActive' as keyof Jobseeker },
    { key: 'verified' as const, label: 'Verified', sortable: true, sortKey: 'isVerified' as keyof Jobseeker },
    { key: 'joinedOn' as const, label: 'Joined On', sortable: true, sortKey: 'createdAt' as keyof Jobseeker },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 5;

export default function JobseekersVerificationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState({
        isVerified: 'all',
        isActive: 'all',
    });
    const [isLoading, setIsLoading] = useState(true);

    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        user: true,
        phone: true,
        status: true,
        verified: true,
        joinedOn: true,
        actions: true,
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredAndSortedJobseekers = useMemo(() => {
        let sortedItems = [...jobseekers];

        // Filtering
        sortedItems = sortedItems.filter(js => {
            if (filters.isVerified !== 'all') {
                const verifiedMatch = filters.isVerified === 'verified';
                if (js.isVerified !== verifiedMatch) return false;
            }
             if (filters.isActive !== 'all') {
                const activeMatch = filters.isActive === 'active';
                if (js.isActive !== activeMatch) return false;
            }

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    js.name.toLowerCase().includes(searchLower) ||
                    js.email.toLowerCase().includes(searchLower) ||
                    (js.phoneNumber && js.phoneNumber.toLowerCase().includes(searchLower))
                );
            }
            return true;
        });

        // Sorting
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof Jobseeker];
                const valB = b[key as keyof Jobseeker];

                if (typeof valA === 'boolean' && typeof valB === 'boolean') {
                    if (valA === valB) return 0;
                    return sortConfig.direction === 'asc' ? (valA ? 1 : -1) : (valA ? -1 : 1);
                }

                if (valA instanceof Date && valB instanceof Date) {
                    return sortConfig.direction === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
                }
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sortedItems;
    }, [searchTerm, sortConfig, filters]);

    const totalPages = Math.ceil(filteredAndSortedJobseekers.length / ROWS_PER_PAGE);

    const paginatedJobseekers = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedJobseekers.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, filteredAndSortedJobseekers]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filters]);


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const requestSort = (key: keyof Jobseeker) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Jobseeker) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ isVerified: 'all', isActive: 'all' });
        setSortConfig({ key: 'createdAt', direction: 'desc' });
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.user && <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div></TableCell>}
            {columnVisibility.phone && <TableCell><Skeleton className="h-4 w-28" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.verified && <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>}
            {columnVisibility.joinedOn && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
            {columnVisibility.actions && <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-24" /></div></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Jobseeker Verification" />
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, phone..."
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
                                        Refine jobseeker results.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                     <RadioGroup value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="r-stat-all" /><Label htmlFor="r-stat-all">All</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="active" id="r-stat-active" /><Label htmlFor="r-stat-active">Active</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="inactive" id="r-stat-inactive" /><Label htmlFor="r-stat-inactive">Inactive</Label></div>
                                    </RadioGroup>
                                </div>
                                 <div className="grid gap-2">
                                    <Label>Verification Status</Label>
                                    <RadioGroup value={filters.isVerified} onValueChange={(value) => handleFilterChange('isVerified', value)}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="r-ver-all" /><Label htmlFor="r-ver-all">All</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="verified" id="r-ver-verified" /><Label htmlFor="r-ver-verified">Verified</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="not-verified" id="r-ver-not" /><Label htmlFor="r-ver-not">Not Verified</Label></div>
                                    </RadioGroup>
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
                                    checked={columnVisibility[column.key as ColumnKeys]}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility(prev => ({...prev, [column.key as ColumnKeys]: !!value}))
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
                                columnVisibility[col.key as ColumnKeys] && (
                                    <TableHead key={col.key}>
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof Jobseeker)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof Jobseeker)}
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
                        ) : paginatedJobseekers.length > 0 ? (
                            paginatedJobseekers.map(js => (
                                <TableRow key={js.id}>
                                    {columnVisibility.user && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={js.profilePhoto} alt={js.name} />
                                                    <AvatarFallback>{js.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{js.name}</p>
                                                    <p className="text-sm text-muted-foreground">{js.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}
                                    {columnVisibility.phone && <TableCell>{js.phoneNumber}</TableCell>}
                                    {columnVisibility.status && (
                                        <TableCell>
                                            <Badge variant={js.isActive ? 'default' : 'destructive'} className={js.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                {js.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    )}
                                     {columnVisibility.verified && (
                                        <TableCell>
                                            {js.isVerified ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-destructive" />}
                                        </TableCell>
                                    )}
                                    {columnVisibility.joinedOn && <TableCell>{format(new Date(js.createdAt), 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.actions && (
                                        <TableCell>
                                             <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/jobseekers/verification/${js.id}`}><Eye className="mr-1 h-4 w-4"/> View</Link>
                                                </Button>
                                                {!js.isVerified ? (
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
                                    No jobseekers found.
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
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredAndSortedJobseekers.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedJobseekers.length)} of {filteredAndSortedJobseekers.length} jobseekers.
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
