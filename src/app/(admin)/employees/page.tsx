
'use client';

import { useState, useMemo, useEffect, type Key } from 'react';
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
import { users, employers, type User } from "@/lib/data";
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
    UserPlus,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type SortConfig = {
    key: keyof User;
    direction: 'asc' | 'desc';
} | null;

const employeeRoles: ('SubAdmin' | 'Recruiter' | 'Member')[] = ['SubAdmin', 'Recruiter', 'Member'];

const columnsConfig = [
    { key: 'user' as const, label: 'User', sortable: true, sortKey: 'name' as keyof User },
    { key: 'role' as const, label: 'Role', sortable: true, sortKey: 'role' as keyof User },
    { key: 'employer' as const, label: 'Employer', sortable: true, sortKey: 'employerName' as keyof User },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'status' as keyof User },
    { key: 'joinedOn' as const, label: 'Joined On', sortable: true, sortKey: 'joinedAt' as keyof User },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof columnsConfig[number]['key'];

const ROWS_PER_PAGE = 10;

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'joinedAt', direction: 'desc' });
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        employerId: 'all',
    });
    const [isLoading, setIsLoading] = useState(true);

    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>({
        user: true,
        role: true,
        employer: true,
        status: true,
        joinedOn: true,
        actions: true,
    });
    
    const [currentPage, setCurrentPage] = useState(1);

    const employees = useMemo(() => users.filter(user => user.role !== 'Admin'), []);

    const filteredAndSortedEmployees = useMemo(() => {
        let sortedItems = [...employees];

        // Filtering
        sortedItems = sortedItems.filter(user => {
            if (filters.role !== 'all' && user.role !== filters.role) return false;
            if (filters.status !== 'all' && user.status !== filters.status) return false;
            if (filters.employerId !== 'all' && user.employerId !== filters.employerId) return false;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    (user.employerName && user.employerName.toLowerCase().includes(searchLower))
                );
            }
            return true;
        });

        // Sorting
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof User];
                const valB = b[key as keyof User];
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sortedItems;
    }, [searchTerm, sortConfig, filters, employees]);

    const totalPages = Math.ceil(filteredAndSortedEmployees.length / ROWS_PER_PAGE);

    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredAndSortedEmployees.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [currentPage, filteredAndSortedEmployees]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const requestSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof User) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ role: 'all', status: 'all', employerId: 'all' });
        setSortConfig({ key: 'joinedAt', direction: 'desc' });
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    }
    
    const getRoleBadge = (role?: 'SubAdmin' | 'Recruiter' | 'Member') => {
        if (!role) {
            return <Badge variant="outline">Not Assigned</Badge>;
        }
        switch (role) {
            case 'SubAdmin':
                return <Badge className="bg-purple-500 hover:bg-purple-600">Sub-Admin</Badge>;
            case 'Recruiter':
                return <Badge className="bg-orange-500 hover:bg-orange-600">Recruiter</Badge>;
            case 'Member':
                return <Badge variant="secondary">Member</Badge>;
            default:
                 return <Badge variant="secondary">{role}</Badge>
        }
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.user && <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div></TableCell>}
            {columnVisibility.role && <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>}
            {columnVisibility.employer && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.joinedOn && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
            {columnVisibility.actions && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Employees">
                 <Button asChild>
                    <Link href="/employees/new">
                        <UserPlus className="mr-1 h-4 w-4" />
                        Add New Employee
                    </Link>
                </Button>
            </PageHeader>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, employer..."
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
                                    <p className="text-sm text-muted-foreground">Refine employee results.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Select value={filters.role} onValueChange={(v) => handleFilterChange('role', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            {employeeRoles.map(role => <SelectItem key={role} value={role}>{role === 'SubAdmin' ? 'Sub-Admin' : role}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Employer</Label>
                                    <Select value={filters.employerId} onValueChange={(v) => handleFilterChange('employerId', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select employer" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employers</SelectItem>
                                            {employers.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.companyName}</SelectItem>)}
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
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof User)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof User)}
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
                        ) : paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map(user => (
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
                                {columnVisibility.role && <TableCell>{getRoleBadge(user.role as 'SubAdmin' | 'Recruiter' | 'Member')}</TableCell>}
                                {columnVisibility.employer && <TableCell>{user.employerName || 'N/A'}</TableCell>}
                                {columnVisibility.status && (
                                    <TableCell>
                                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                )}
                                {columnVisibility.joinedOn && <TableCell>{format(user.joinedAt, 'MMM d, yyyy')}</TableCell>}
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
                                                    <Link href={`/employees/${user.id}/edit`}>
                                                        <Edit className="mr-1 h-4 w-4"/>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    {user.status === 'Active' ? <ToggleLeft className="mr-1 h-4 w-4" /> : <ToggleRight className="mr-1 h-4 w-4" />}
                                                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
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
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredAndSortedEmployees.length)} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedEmployees.length)} of {filteredAndSortedEmployees.length} employees.
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
