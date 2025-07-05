
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type User, permissionableModels, crudOperations } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const subAdminSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  status: z.enum(['Active', 'Inactive']),
  permissions: z.array(z.string()).optional(),
});

type SubAdminFormValues = z.infer<typeof subAdminSchema>;

type SubAdminFormProps = {
    user?: User;
}

export function SubAdminForm({ user }: SubAdminFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    getValues,
    setValue,
  } = useForm<SubAdminFormValues>({
    resolver: zodResolver(subAdminSchema),
    defaultValues: {
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        status: user?.status || 'Active',
        permissions: user?.permissions || [],
    }
  });

  const onSubmit = (data: SubAdminFormValues) => {
    const payload = { ...data };
    if (user && !payload.password) {
      delete payload.password;
    }
    console.log(payload);
    toast({
        title: user ? 'Sub Admin Updated' : 'Sub Admin Created',
        description: `${data.name} has been successfully ${user ? 'updated' : 'created'}.`,
    });
    router.push('/sub-admins');
  };

  const handleSelectAllForModel = (modelId: string, shouldSelect: boolean) => {
    const currentPermissions = getValues('permissions') || [];
    const modelPermissions = crudOperations.map(op => `${modelId}:${op}`);
    
    let newPermissions: string[];
    if (shouldSelect) {
      newPermissions = [...new Set([...currentPermissions, ...modelPermissions])];
    } else {
      newPermissions = currentPermissions.filter(p => !modelPermissions.includes(p));
    }
    setValue('permissions', newPermissions, { shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sub Admin Details</CardTitle>
                        <CardDescription>
                            Enter the main details for the sub admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" {...register('phoneNumber')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" {...register('password')} placeholder={user ? 'Leave blank to keep current password' : ''} />
                                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>Control what this sub admin can do for each module.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Controller
                            name="permissions"
                            control={control}
                            render={({ field }) => (
                                <Accordion type="multiple" className="w-full">
                                    {permissionableModels.map((model) => {
                                        const modelPermissions = crudOperations.map(op => `${model.id}:${op}`);
                                        const areAllSelected = modelPermissions.every(p => field.value?.includes(p));

                                        return (
                                            <AccordionItem key={model.id} value={model.id}>
                                                <AccordionTrigger>
                                                    <div className="flex items-center gap-4">
                                                        <span>{model.name}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4">
                                                    <div className="flex items-center space-x-2 pl-2">
                                                        <Checkbox
                                                            id={`select-all-${model.id}`}
                                                            checked={areAllSelected}
                                                            onCheckedChange={(checked) => handleSelectAllForModel(model.id, !!checked)}
                                                        />
                                                        <label htmlFor={`select-all-${model.id}`} className="text-sm font-medium leading-none">Select All</label>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 pl-2">
                                                        {crudOperations.map((op) => {
                                                            const permissionString = `${model.id}:${op}`;
                                                            return (
                                                            <div key={op} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={permissionString}
                                                                    checked={field.value?.includes(permissionString)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentPermissions = field.value || [];
                                                                        if (checked) {
                                                                            field.onChange([...currentPermissions, permissionString]);
                                                                        } else {
                                                                            field.onChange(currentPermissions.filter(p => p !== permissionString));
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={permissionString} className="text-sm font-medium capitalize">
                                                                    {op}
                                                                </label>
                                                            </div>
                                                            )
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
               
                <Card>
                    <CardHeader>
                        <CardTitle>Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <CardDescription>Inactive sub admins cannot log in.</CardDescription>
                            </div>
                             <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value === 'Active'}
                                        onCheckedChange={(checked) => field.onChange(checked ? 'Active' : 'Inactive')}
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
