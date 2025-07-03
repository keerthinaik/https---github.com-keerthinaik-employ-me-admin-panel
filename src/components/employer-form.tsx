
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Employer } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const employerSchema = z.object({
  name: z.string().min(1, 'Contact person name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  
  companyName: z.string().min(2, 'Company name is required'),
  logo: z.any().optional(),
  about: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  taxCertificate: z.any().optional(),
  registrationNumber: z.string().optional(),
  registrationCertificate: z.any().optional(),

  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type EmployerFormValues = z.infer<typeof employerSchema>;

type EmployerFormProps = {
    employer?: Employer;
}

export function EmployerForm({ employer }: EmployerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<EmployerFormValues>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
        name: employer?.name || '',
        email: employer?.email || '',
        phoneNumber: employer?.phoneNumber || '',
        address: employer?.address || '',
        country: employer?.country || '',
        state: employer?.state || '',
        city: employer?.city || '',
        zipCode: employer?.zipCode || '',
        companyName: employer?.companyName || '',
        about: employer?.about || '',
        website: employer?.website || '',
        taxNumber: employer?.taxNumber || '',
        registrationNumber: employer?.registrationNumber || '',
        isVerified: employer?.isVerified || false,
        isActive: employer?.isActive ?? true,
        logo: undefined,
        taxCertificate: undefined,
        registrationCertificate: undefined,
    }
  });

  const onSubmit = (data: EmployerFormValues) => {
    console.log(data);
    toast({
        title: employer ? 'Employer Updated' : 'Employer Created',
        description: `${data.companyName} has been successfully ${employer ? 'updated' : 'created'}.`,
    });
    router.push('/employers');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="company">Company Info</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="legal">Legal & Web</TabsTrigger>
                <TabsTrigger value="account">Account & Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="company" className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Company & Contact Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" {...register('companyName')} />
                                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="name">Contact Person Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                        </div>
                         <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" {...register('phoneNumber')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="about">About Company</Label>
                            <Textarea id="about" {...register('about')} className="min-h-32" placeholder="Brief description of the company..." />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" {...register('address')} />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" {...register('city')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State / Province</Label>
                                <Input id="state" {...register('state')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input id="country" {...register('country')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input id="zipCode" {...register('zipCode')} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="legal" className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Website & Legal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" {...register('website')} placeholder="https://..." />
                            {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxNumber">Tax Number</Label>
                                <Input id="taxNumber" {...register('taxNumber')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registrationNumber">Registration Number</Label>
                                <Input id="registrationNumber" {...register('registrationNumber')} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Media & Documents</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="logo">Company Logo</Label>
                            <Input id="logo" type="file" {...register('logo')} accept="image/*,.svg" />
                            {employer?.logo && <p className="text-sm text-muted-foreground mt-1">Current: <a href={employer.logo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Logo</a></p>}
                            {errors.logo && <p className="text-sm text-destructive">{errors.logo.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxCertificate">Tax Certificate</Label>
                            <Input id="taxCertificate" type="file" {...register('taxCertificate')} accept="application/pdf,image/*,.doc,.docx" />
                            {employer?.taxCertificate && <p className="text-sm text-muted-foreground mt-1">Current: <a href={employer.taxCertificate} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Certificate</a></p>}
                             {errors.taxCertificate && <p className="text-sm text-destructive">{errors.taxCertificate.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="registrationCertificate">Registration Certificate</Label>
                            <Input id="registrationCertificate" type="file" {...register('registrationCertificate')} accept="application/pdf,image/*,.doc,.docx" />
                            {employer?.registrationCertificate && <p className="text-sm text-muted-foreground mt-1">Current: <a href={employer.registrationCertificate} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Certificate</a></p>}
                             {errors.registrationCertificate && <p className="text-sm text-destructive">{errors.registrationCertificate.message as string}</p>}
                        </div>
                     </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Set New Password</Label>
                            <Input id="password" type="password" {...register('password')} placeholder={employer ? "Leave blank to keep unchanged" : ""} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Verification Status</Label>
                                <CardDescription>Indicates if the employer's identity has been verified.</CardDescription>
                            </div>
                            <Controller name="isVerified" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <CardDescription>Inactive employers cannot log in or post jobs.</CardDescription>
                            </div>
                            <Controller name="isActive" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        <CardFooter className="flex justify-end gap-2 mt-6 px-0">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : employer ? 'Save Changes' : 'Create Employer'}
            </Button>
        </CardFooter>
    </form>
  );
}
