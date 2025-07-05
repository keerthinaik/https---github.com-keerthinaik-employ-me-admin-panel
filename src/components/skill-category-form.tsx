'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { SkillCategory } from '@/lib/types';
import { createSkillCategory, updateSkillCategory } from '@/services/api';
import { Switch } from '@/components/ui/switch';

const skillCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required'),
  isActive: z.boolean().default(true),
});

type SkillCategoryFormValues = z.infer<typeof skillCategorySchema>;

type SkillCategoryFormProps = {
    category?: SkillCategory;
}

export function SkillCategoryForm({ category }: SkillCategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
  } = useForm<SkillCategoryFormValues>({
    resolver: zodResolver(skillCategorySchema),
    defaultValues: {
        name: category?.name || '',
        description: category?.description || '',
        isActive: category?.isActive ?? true,
    }
  });

  const onSubmit = async (data: SkillCategoryFormValues) => {
    try {
      if (category) {
        await updateSkillCategory(category.id, data);
      } else {
        await createSkillCategory(data);
      }
      toast({
          title: category ? 'Category Updated' : 'Category Created',
          description: `${data.name} has been successfully ${category ? 'updated' : 'created'}.`,
      });
      router.push('/skill-categories');
      router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            Object.keys(serverErrors).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(skillCategorySchema.shape, key)) {
                    setError(key as keyof SkillCategoryFormValues, {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>{category ? 'Edit' : 'Create'} Skill Category</CardTitle>
                    <CardDescription>
                    {category ? 'Update the details for this category.' : 'Fill in the details for the new category.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" {...register('name')} placeholder="e.g. Programming Languages" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register('description')} placeholder="e.g. Languages used for software development." />
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
                            <CardDescription>Inactive categories will not be available for new skills.</CardDescription>
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
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
      </CardFooter>
    </form>
  );
}
