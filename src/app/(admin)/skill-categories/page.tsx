
'use client';

import { useState, useMemo, useEffect, type Key, useCallback } from 'react';
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type SkillCategory, type Pagination, type GetAllParams } from "@/lib/types";
import {
    Edit,
    MoreHorizontal,
    Trash2,
    Search,
    Columns,
    ChevronLeft,
    ChevronRight,
    LayoutList,
    SlidersHorizontal,
    FilterX,
    ArrowDownUp,
    ArrowUp,
    ArrowDown,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSkillCategories, deleteSkillCategory } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/lib/hooks';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format, isValid } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type SortConfig = {
    key: keyof SkillCategory;
    direction: 'asc' | 'desc';
} | null;

const allFieldsConfig = [
    { key: 'name' as const, label: 'Name', sortable: true, sortKey: 'name' as keyof SkillCategory },
    { key: 'description' as const, label: 'Description', sortable: true, sortKey: 'description' as keyof SkillCategory },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'isActive' as keyof SkillCategory },
    { key: 'updatedAt' as const, label: 'Last Updated', sortable: true, sortKey: 'updatedAt' as keyof SkillCategory },
    { key: 'createdAt' as const, label: 'Created At', sortable: true, sortKey: 'createdAt' as keyof SkillCategory },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof allFieldsConfig[number]['key'];
const defaultDisplayFields: ColumnKeys[] = ['name', 'description', 'status', 'updatedAt'];

const initialColumnVisibility = allFieldsConfig.reduce((acc, col) => {
  acc[col.key] = defaultDisplayFields.includes(col.key) || col.key === 'actions';
  return acc;
}, {} as Record<ColumnKeys, boolean>);


const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
);

const searchFields = ['name', 'description'] as const;

export default function SkillCategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<SkillCategory[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSearchFields, setSelectedSearchFields] = useState<string[]>(['name', 'description']);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filters, setFilters] = useState({ isActive: 'all' });


    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>(initialColumnVisibility);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rowsPerPageInput, setRowsPerPageInput] = useState<number | string>(10);

    const fetchCategories = useCallback(() => {
        setIsLoading(true);
        
        const apiFilters: Record<string, any> = {};
        if (debouncedSearchTerm && selectedSearchFields.length > 0) {
            selectedSearchFields.forEach(field => {
                apiFilters[field] = debouncedSearchTerm;
            });
        }
        if (filters.isActive !== 'all') {
            apiFilters.isActive = filters.isActive === 'active';
        }
        
        const sortString = sortConfig ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}` : undefined;

        const fieldKeys = allFieldsConfig
            .filter(c => columnVisibility[c.key])
            .map(c => c.sortKey || c.key)
            .filter(k => k !== 'actions');
            
        const essentialFields = ['id', sortConfig?.key].filter(Boolean) as (keyof SkillCategory)[];
        const uniqueFields = [...new Set([...fieldKeys, ...essentialFields])];
        const fieldsString = uniqueFields.join(',');

        const params: GetAllParams = { page: currentPage, limit: rowsPerPage, filters: apiFilters, sort: sortString, fields: fieldsString };
        
        getSkillCategories(params)
            .then(data => {
                setCategories(data.data);
                setPagination(data.pagination);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching categories',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => setIsLoading(false));
    }, [currentPage, rowsPerPage, debouncedSearchTerm, selectedSearchFields, filters, sortConfig, toast, columnVisibility]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, rowsPerPage, selectedSearchFields, filters, sortConfig]);

    const handleDelete = async (categoryId: string) => {
        try {
            await deleteSkillCategory(categoryId);
            toast({
                title: 'Category Deleted',
                description: 'The skill category has been successfully deleted.',
            });
            fetchCategories(); // Refetch data after deletion
        } catch (error: any) {
             toast({
                title: 'Error deleting category',
                description: error.message,
                variant: 'destructive',
            });
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSearchFields(['name', 'description']);
        setFilters({ isActive: 'all' });
        setSortConfig({ key: 'updatedAt', direction: 'desc' });
    };
    
    const requestSort = (key: keyof SkillCategory) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof SkillCategory) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    return (
        <div>
            <PageHeader title="Skill Categories">
                <Button asChild>
                    <Link href="/skill-categories/new">
                        <LayoutList className="mr-1 h-4 w-4" />
                        Add New Category
                    </Link>
                </Button>
            </PageHeader>

             <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
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
                        <PopoverContent className="w-60" align="end">
                             <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Search Fields</h4>
                                    <p className="text-sm text-muted-foreground">Select fields to search in.</p>
                                </div>
                                <div className="grid gap-2">
                                    {searchFields.map(field => (
                                        <div key={field} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`search-${field}`}
                                                checked={selectedSearchFields.includes(field)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedSearchFields(prev => [...prev, field]);
                                                    } else {
                                                        setSelectedSearchFields(prev => prev.filter(f => f !== field));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`search-${field}`} className="font-normal capitalize">{field}</Label>
                                        </div>
                                    ))}
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
                                <Columns className="mr-1 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allFieldsConfig.filter(c => c.key !== 'actions').map(column => (
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
                            {allFieldsConfig.map(col => (
                                columnVisibility[col.key] && (
                                    <TableHead key={col.key} className={cn({
                                        'hidden md:table-cell': col.key === 'description',
                                        'hidden lg:table-cell': col.key === 'createdAt',
                                    })}>
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as keyof SkillCategory)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as keyof SkillCategory)}
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
                        ) : categories.length > 0 ? (
                            categories.map(category => (
                                <TableRow key={category.id}>
                                    {columnVisibility.name && <TableCell className="font-medium">{category.name}</TableCell>}
                                    {columnVisibility.description && <TableCell className="hidden md:table-cell text-muted-foreground max-w-md truncate">{category.description}</TableCell>}
                                    {columnVisibility.status && (
                                        <TableCell>
                                            <Badge variant={category.isActive ? 'default' : 'destructive'} className={category.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    {columnVisibility.updatedAt && <TableCell>{isValid(new Date(category.updatedAt)) ? format(new Date(category.updatedAt), 'MMM d, yyyy') : 'N/A'}</TableCell>}
                                    {columnVisibility.createdAt && <TableCell className="hidden lg:table-cell">{isValid(new Date(category.createdAt)) ? format(new Date(category.createdAt), 'MMM d, yyyy') : 'N/A'}</TableCell>}
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
                                                            <Link href={`/skill-categories/${category.id}`}>
                                                                <Eye className="mr-1 h-4 w-4"/>
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/skill-categories/${category.id}/edit`}>
                                                                <Edit className="mr-1 h-4 w-4"/>
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
                                                        This action cannot be undone. This will permanently delete the category
                                                        and may affect skills associated with it.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(category.id)}>Continue</AlertDialogAction>
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
                        `Showing ${pagination.totalRecords === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1} to ${Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of ${pagination.totalRecords} categories.`
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
    );
}
