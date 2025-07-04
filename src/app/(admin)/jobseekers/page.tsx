
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { type Jobseeker, type Pagination, type GetAllParams } from "@/lib/types";
import { format } from "date-fns";
import {
    MoreHorizontal,
    UserPlus,
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
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/lib/hooks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getJobseekers, deleteJobseeker } from '@/services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

type SortConfig = {
    key: keyof Jobseeker;
    direction: 'asc' | 'desc';
} | null;

const columnsConfig = [
    { key: 'name' as const, label: 'User', sortable: true, sortKey: 'name' as keyof Jobseeker },
    { key: 'phoneNumber' as const, label: 'Phone', sortable: true, sortKey: 'phoneNumber' as keyof Jobseeker },
    { key: 'isActive' as const, label: 'Status', sortable: true, sortKey: 'isActive' as keyof Jobseeker },
    { key: 'isVerified' as const, label: 'Verified', sortable: true, sortKey: 'isVerified' as keyof Jobseeker },
    { key: 'createdAt' as const, label: 'Joined On', sortable: true, sortKey: 'createdAt' as keyof Jobseeker },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;

export default function JobseekersPage() {
    const { toast } = useToast();
    const [jobseekers, setJobseekers] = useState<Jobseeker[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [filters, setFilters] = useState({
        isVerified: 'all',
        isActive: 'all',
    });

    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        name: true,
        phoneNumber: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        actions: true,
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
    const [rowsPerPageInput, setRowsPerPageInput] = useState<number | string>(ROWS_PER_PAGE);

    const fetchJobseekers = useCallback(() => {
        setIsLoading(true);
        const apiFilters: Record<string, any> = {};
        if (debouncedSearchTerm) {
            apiFilters.name = debouncedSearchTerm;
            apiFilters.email = debouncedSearchTerm;
        }
        if (filters.isVerified !== 'all') {
            apiFilters.isVerified = filters.isVerified === 'verified';
        }
        if (filters.isActive !== 'all') {
            apiFilters.isActive = filters.isActive === 'active';
        }

        const sortString = sortConfig ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}` : undefined;

        const params: GetAllParams = { page: currentPage, limit: rowsPerPage, filters: apiFilters, sort: sortString };

        getJobseekers(params)
            .then(data => {
                setJobseekers(data.data);
                setPagination(data.pagination);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching jobseekers',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => setIsLoading(false));
    }, [currentPage, rowsPerPage, debouncedSearchTerm, filters, sortConfig, toast]);

    useEffect(() => {
        fetchJobseekers();
    }, [fetchJobseekers]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters, sortConfig, rowsPerPage]);

    const handleDelete = async (jobseekerId: string) => {
        try {
            await deleteJobseeker(jobseekerId);
            toast({
                title: 'Jobseeker Deleted',
                description: 'The jobseeker has been successfully deleted.',
            });
            fetchJobseekers();
        } catch (error: any) {
            toast({
                title: 'Error deleting jobseeker',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    
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
        setSortConfig({ key: 'updatedAt', direction: 'desc' });
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnsConfig.map(col => columnVisibility[col.key] && (
                <TableCell key={col.key}>
                    {col.key === 'name' ? (
                        <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div>
                    ) : col.key === 'isVerified' ? (
                        <Skeleton className="h-5 w-5 rounded-full" />
                    ) : col.key === 'isActive' ? (
                        <Skeleton className="h-6 w-20 rounded-full" />
                    ) : col.key === 'actions' ? (
                        <Skeleton className="h-8 w-8" />
                    ) : (
                        <Skeleton className="h-4 w-24" />
                    )}
                </TableCell>
            ))}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Jobseekers">
                 <Button asChild>
                    <Link href="/jobseekers/new">
                        <UserPlus className="mr-1 h-4 w-4" />
                        Add Jobseeker
                    </Link>
                </Button>
            </PageHeader>
            
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
                                columnVisibility[col.key] && (
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
                            Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonRow key={i} />)
                        ) : jobseekers.length > 0 ? (
                            jobseekers.map(js => (
                                <TableRow key={js.id}>
                                    {columnVisibility.name && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={js.profilePhoto ? `${API_BASE_URL}${js.profilePhoto.startsWith('/') ? '' : '/'}${js.profilePhoto}` : undefined} alt={js.name} />
                                                    <AvatarFallback>{js.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{js.name}</p>
                                                    <p className="text-sm text-muted-foreground">{js.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}
                                    {columnVisibility.phoneNumber && <TableCell>{js.phoneNumber}</TableCell>}
                                    {columnVisibility.isActive && (
                                        <TableCell>
                                            <Badge variant={js.isActive ? 'default' : 'destructive'} className={js.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                {js.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    )}
                                     {columnVisibility.isVerified && (
                                        <TableCell>
                                            {js.isVerified ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                                        </TableCell>
                                    )}
                                    {columnVisibility.createdAt && <TableCell>{format(new Date(js.createdAt), 'MMM d, yyyy')}</TableCell>}
                                    {columnVisibility.actions && (
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
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/jobseekers/${js.id}`}>
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/jobseekers/${js.id}/edit`}>
                                                                <Edit className="mr-1 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                <Trash2 className="mr-1 h-4 w-4"/>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the jobseeker account.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(js.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
                 <div className="text-sm text-muted-foreground">
                    {isLoading || !pagination ? (
                        <Skeleton className="h-5 w-48" />
                    ) : (
                        `Showing ${pagination.totalRecords === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1} to ${Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of ${pagination.totalRecords} jobseekers.`
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
