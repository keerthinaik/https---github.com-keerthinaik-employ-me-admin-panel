'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Skill, type SkillCategory } from '@/lib/types';
import { getSkillCategories, createSkill, updateSkill } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SkillFormValues = z.infer<typeof skillSchema>;

type SkillFormProps = {
    skill?: Skill;
}

export function SkillForm({ skill }: SkillFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<SkillCategory[]>([]);

  React.useEffect(() => {
    getSkillCategories({ limit: 1000 })
        .then(res => setCategories(res.data))
        .catch(err => console.error("Failed to fetch skill categories", err));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
        name: skill?.name || '',
        categoryId: skill?.skillCategory?.id || '',
        description: skill?.description || '',
        isActive: skill?.isActive ?? true,
    }
  });

  const onSubmit = async (data: SkillFormValues) => {
    try {
      const payload = {
          name: data.name,
          skillCategory: data.categoryId,
          description: data.description,
          isActive: data.isActive,
      };

      if (skill) {
        await updateSkill(skill.id, payload as any);
      } else {
        await createSkill(payload as any);
      }

      toast({
          title: skill ? 'Skill Updated' : 'Skill Created',
          description: `${data.name} has been successfully ${skill ? 'updated' : 'created'}.`,
      });
      router.push('/skills');
      router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            Object.keys(serverErrors).forEach((key) => {
                const formKey = key === 'skillCategory' ? 'categoryId' : key;
                if (Object.prototype.hasOwnProperty.call(skillSchema.shape, formKey)) {
                    setError(formKey as keyof SkillFormValues, {
                        type: 'server',
                        message: serverErrors[key],
                    });
                }
            });
            toast({
                title: 'Could not save skill',
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
                        <CardTitle>{skill ? 'Edit' : 'Create'} Skill</CardTitle>
                        <CardDescription>
                        {skill ? 'Update the details for this skill.' : 'Fill in the details for the new skill.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Skill Name</Label>
                            <Input id="name" {...register('name')} placeholder="e.g. React" />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                            >
                                            {field.value
                                                ? categories.find((category) => category.id === field.value)?.name
                                                : "Select category..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search category..." />
                                                <CommandEmpty>No category found.</CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                    <CommandItem
                                                        value={category.name}
                                                        key={category.id}
                                                        onSelect={() => {
                                                            field.onChange(category.id)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value === category.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                        />
                                                        {category.name}
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
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
