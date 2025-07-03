
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { subscriptionPlans, type SubscriptionPlan } from "@/lib/data";
import { MoreHorizontal, Edit, Trash2, PlusCircle, Search, SlidersHorizontal, ArrowDownUp, ArrowUp, ArrowDown, FilterX, Columns, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type SortConfig = {
    key: keyof SubscriptionPlan;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'name' as const, label: 'Plan Name', sortable: true, sortKey: 'name' as keyof SubscriptionPlan },
    { key: 'duration' as const, label: 'Duration (Days)', sortable: true, sortKey: 'durationInDays' as keyof SubscriptionPlan },
    { key: 'price' as const, label: 'Price (USD)', sortable: false },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'isActive' as keyof SubscriptionPlan },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;

export default function EmployerPlansPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [filters, setFilters] = useState({ isActive: 'all' });
    const [isLoading, setIsLoading] = useState(true);
    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        name: true,
        duration: true,
        price: true,
        status: true,
        actions: true,
    });
    const [currentPage, setCurrentPage] = useState(1);

    const employerPlans = useMemo(() => 
        subscriptionPlans.filter(plan => plan.userTypes.includes('Employer')), 
        []
    );

    const filteredAndSortedPlans = useMemo(() => {
        let sortedItems = [...employerPlans];

        // Filtering
        sortedItems = sortedItems.filter(plan => {
            if (filters.isActive !== 'all') {
                const isActive = filters.isActive === 'active';
                if (plan.isActive !== isActive) return false;
            }

            if (searchTerm) {
                return plan.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });

        // Sorting
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof SubscriptionPlan] as any;
                const valB = b[key as keyof SubscriptionPlan] as any;
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sortedItems;
    }, [searchTerm, sortConfig, filters, employerPlans]);

    const totalPages = Math.ceil(filteredAndSortedPlans.length / ROWS_PER_PAGE);

    const paginatedPlans = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedPlans.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, filteredAndSortedPlans]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filters]);


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const requestSort = (key: keyof SubscriptionPlan) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof SubscriptionPlan) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ isActive: 'all' });
        setSortConfig({ key: 'name', direction: 'asc' });
    };

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.name && <TableCell><Skeleton className="h-5 w-32" /></TableCell>}
            {columnVisibility.duration && <TableCell><Skeleton className="h-5 w-16" /></TableCell>}
            {columnVisibility.price && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.actions && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Employer Subscription Plans">
                <Button asChild>
                    <Link href="/employer-plans/new">
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Create Plan
                    </Link>
                </Button>
            </PageHeader>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by plan name..."
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
                        <PopoverContent className="w-60" align="end">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filters</h4>
                                </div>
                                 <div className="grid gap-2">
                                    <Label>Status</Label>
                                     <RadioGroup value={filters.isActive} onValueChange={(value) => setFilters(prev => ({...prev, isActive: value}))}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="r-stat-all" /><Label htmlFor="r-stat-all">All</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="active" id="r-stat-active" /><Label htmlFor="r-stat-active">Active</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="inactive" id="r-stat-inactive" /><Label htmlFor="r-stat-inactive">Inactive</Label></div>
                                    </RadioGroup>
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
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof SubscriptionPlan)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof SubscriptionPlan)}
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
                        ) : paginatedPlans.length > 0 ? (
                            paginatedPlans.map(plan => (
                                <TableRow key={plan.id}>
                                    {columnVisibility.name && <TableCell className="font-medium">{plan.name}</TableCell>}
                                    {columnVisibility.duration && <TableCell>{plan.durationInDays}</TableCell>}
                                    {columnVisibility.price && <TableCell>${plan.prices.find(p => p.currency === 'USD')?.amount || 'N/A'}</TableCell>}
                                    {columnVisibility.status && (
                                        <TableCell>
                                            <Badge variant={plan.isActive ? 'default' : 'secondary'} className={plan.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                {plan.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    )}
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
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/employer-plans/${plan.id}/edit`}>
                                                            <Edit className="mr-1 h-4 w-4"/> Edit
                                                        </Link>
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
                                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length} className="h-24 text-center">No employer plans found.</TableCell>
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
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredAndSortedPlans.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedPlans.length)} of {filteredAndSortedPlans.length} plans.
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

