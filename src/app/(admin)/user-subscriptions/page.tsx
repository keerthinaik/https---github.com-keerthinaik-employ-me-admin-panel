

'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userSubscriptions, type UserSubscription } from "@/lib/data";
import { format } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
import { Search, SlidersHorizontal, ArrowDownUp, ArrowUp, ArrowDown, FilterX, Columns, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortConfig = {
    key: keyof UserSubscription;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'userName' as const, label: 'User', sortable: true, sortKey: 'userName' as keyof UserSubscription },
    { key: 'userType' as const, label: 'User Type', sortable: true, sortKey: 'userType' as keyof UserSubscription },
    { key: 'planName' as const, label: 'Plan', sortable: true, sortKey: 'planName' as keyof UserSubscription },
    { key: 'startDate' as const, label: 'Start Date', sortable: true, sortKey: 'startDate' as keyof UserSubscription },
    { key: 'endDate' as const, label: 'End Date', sortable: true, sortKey: 'endDate' as keyof UserSubscription },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'status' as keyof UserSubscription },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;
const allStatuses: UserSubscription['status'][] = ['active', 'expired', 'cancelled'];
const allUserTypes: UserSubscription['userType'][] = ['Admin', 'JobSeeker', 'Employer', 'University', 'Business'];

export default function UserSubscriptionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    const [filters, setFilters] = useState({
        status: 'all',
        userType: 'all',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        userName: true,
        userType: true,
        planName: true,
        startDate: true,
        endDate: true,
        status: true,
    });
    const [currentPage, setCurrentPage] = useState(1);

    const getStatusBadge = (status: UserSubscription['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500 hover:bg-green-600 capitalize">{status}</Badge>;
            case 'expired':
                return <Badge variant="destructive" className="capitalize">{status}</Badge>;
            case 'cancelled':
                return <Badge variant="secondary" className="capitalize">{status}</Badge>;
        }
    };
    
    const filteredAndSortedSubscriptions = useMemo(() => {
        let sortedItems = [...userSubscriptions];

        // Filtering
        sortedItems = sortedItems.filter(sub => {
            if (filters.status !== 'all' && sub.status !== filters.status) return false;
            if (filters.userType !== 'all' && sub.userType !== filters.userType) return false;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return sub.userName.toLowerCase().includes(searchLower) ||
                       sub.planName.toLowerCase().includes(searchLower);
            }
            return true;
        });

        // Sorting
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof UserSubscription] as any;
                const valB = b[key as keyof UserSubscription] as any;
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sortedItems;
    }, [searchTerm, sortConfig, filters]);
    
    const totalPages = Math.ceil(filteredAndSortedSubscriptions.length / ROWS_PER_PAGE);

    const paginatedSubscriptions = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedSubscriptions.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, filteredAndSortedSubscriptions]);
    
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filters]);


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const requestSort = (key: keyof UserSubscription) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortIcon = (key: keyof UserSubscription) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'all', userType: 'all' });
        setSortConfig({ key: 'updatedAt', direction: 'desc' });
    }

    const SkeletonRow = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="User Subscriptions" />
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user or plan name..."
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
                                <div className="grid gap-2">
                                    <Label>User Type</Label>
                                    <Select value={filters.userType} onValueChange={(value) => setFilters(prev => ({...prev, userType: value}))}>
                                        <SelectTrigger><SelectValue placeholder="Select user type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All User Types</SelectItem>
                                            {allUserTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
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
                            {columnsConfig.map(column => (
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
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof UserSubscription)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof UserSubscription)}
                                            </Button>
                                        ) : col.label}
                                    </TableHead>
                                )
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: ROWS_PER_PAGE }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginatedSubscriptions.length > 0 ? (
                            paginatedSubscriptions.map(sub => (
                                <TableRow key={sub.id}>
                                    {columnVisibility.userName && <TableCell className="font-medium">{sub.userName}</TableCell>}
                                    {columnVisibility.userType && <TableCell>{sub.userType}</TableCell>}
                                    {columnVisibility.planName && <TableCell>{sub.planName}</TableCell>}
                                    {columnVisibility.startDate && <TableCell>{format(sub.startDate, 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.endDate && <TableCell>{format(sub.endDate, 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.status && <TableCell>{getStatusBadge(sub.status)}</TableCell>}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length} className="h-24 text-center">No subscriptions found.</TableCell>
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
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredAndSortedSubscriptions.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedSubscriptions.length)} of {filteredAndSortedSubscriptions.length} subscriptions.
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
    );
}
