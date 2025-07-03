
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
import { users, type User } from "@/lib/data";
import {
    Eye,
    Search,
    SlidersHorizontal,
    FilterX,
    Columns,
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
import { format } from "date-fns";

const columnsConfig = [
    { key: 'user' as const, label: 'User' },
    { key: 'permissions' as const, label: 'Permissions' },
    { key: 'status' as const, label: 'Status' },
    { key: 'joinedOn' as const, label: 'Date Joined' },
    { key: 'actions' as const, label: 'Actions' },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 5;

export default function SubAdminVerificationPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ status: 'all' });

    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        user: true,
        permissions: true,
        status: true,
        joinedOn: true,
        actions: true,
    });

    const subAdminUsers = useMemo(() => {
        return users.filter(user => {
            if (user.role !== 'SubAdmin') return false;

            if (filters.status !== 'all' && user.status.toLowerCase() !== filters.status) return false;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower);
            }
            return true;
        });
    }, [searchTerm, filters]);

    const totalPages = Math.ceil(subAdminUsers.length / ROWS_PER_PAGE);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return subAdminUsers.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, subAdminUsers]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'all' });
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.user && <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div></TableCell>}
            {columnVisibility.permissions && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.joinedOn && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
            {columnVisibility.actions && <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-24" /></div></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Sub Admin Verification" />
            
             <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email..."
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
                                        Refine sub admin results.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <RadioGroup value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
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
                                    checked={columnVisibility[column.key]}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility(prev => ({...prev, [column.key]: !!value}))
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
                                        {col.label === 'Actions' ? <span className="sr-only">{col.label}</span> : col.label}
                                    </TableHead>
                                )
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map(user => (
                                <TableRow key={user.id}>
                                    {columnVisibility.user && (
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}
                                    {columnVisibility.permissions && (
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.permissions?.slice(0, 2).map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                                                {user.permissions && user.permissions.length > 2 && <Badge variant="outline">+{user.permissions.length - 2} more</Badge>}
                                            </div>
                                        </TableCell>
                                    )}
                                    {columnVisibility.status && (
                                        <TableCell>
                                            <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    {columnVisibility.joinedOn && (
                                        <TableCell>{format(user.joinedAt, 'MMM d, yyyy')}</TableCell>
                                    )}
                                    {columnVisibility.actions && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/sub-admins/verification/${user.id}`}><Eye className="mr-1 h-4 w-4"/> View</Link>
                                                </Button>
                                                {user.status !== 'Active' ? (
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
                                    No sub admins pending verification.
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
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, subAdminUsers.length)} to {Math.min(currentPage * ROWS_PER_PAGE, subAdminUsers.length)} of {subAdminUsers.length} sub-admins.
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
