

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type JobCategory } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { createJobCategory, updateJobCategory } from '@/services/api';

const jobCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type JobCategoryFormValues = z.infer<typeof jobCategorySchema>;

type JobCategoryFormProps = {
    category?: JobCategory;
}

export function JobCategoryForm({ category }: JobCategoryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
  } = useForm<JobCategoryFormValues>({
    resolver: zodResolver(jobCategorySchema),
    defaultValues: {
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
        isActive: category?.isActive ?? true,
    }
  });

  const onSubmit = async (data: JobCategoryFormValues) => {
    try {
      if (category) {
        await updateJobCategory(category.id, data);
      } else {
        await createJobCategory(data);
      }
      toast({
          title: category ? 'Category Updated' : 'Category Created',
          description: `${data.name} has been successfully ${category ? 'updated' : 'created'}.`,
      });
      
      const page = searchParams.get('page');
      const backUrl = `/job-categories${page ? `?page=${page}` : ''}`;
      router.push(backUrl);
      router.refresh(); 
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            Object.keys(serverErrors).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(jobCategorySchema.shape, key)) {
                    setError(key as keyof JobCategoryFormValues, {
                        type: 'server',
                        message: serverErrors[key],
                    });
                }
            });
            toast({
                title: 'Could not save category',
                description: error.data.message || 'Please correct the errors and try again.',
                variant: 'destructive',
            });
        } else {
           toast({
              title: 'An error occurred',
              description: error.message,
              variant: 'destructive',
          });
        }
    }
  };
  
  const handleCancel = () => {
    const page = searchParams.get('page');
    const backUrl = `/job-categories${page ? `?page=${page}` : ''}`;
    router.push(backUrl);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{category ? 'Edit' : 'Create'} Job Category</CardTitle>
                        <CardDescription>
                        {category ? 'Update the details for this category.' : 'Fill in the details for the new category.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input id="name" {...register('name')} placeholder="e.g. Software Development" />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} placeholder="e.g. Roles related to designing and creating software." />
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>
                    </CardContent>
                </Card>
             </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                        <CardDescription>Set the visibility of the category.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
                                <CardDescription>Inactive categories will not be available for new job postings.</CardDescription>
                            </div>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="isActive"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
             </div>
        </div>
        <CardFooter className="flex justify-end gap-2 mt-6 px-0">
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Category'}
            </Button>
        </CardFooter>
    </form>
  );
}
