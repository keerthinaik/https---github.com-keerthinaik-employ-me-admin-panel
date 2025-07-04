
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type University } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const universityTypes = ["Public", "Private", "Community College", "Technical Institute", "Research University", "Liberal Arts College", "Online University", "Vocational School", "Other"] as const;

const universitySchema = z.object({
  name: z.string().min(1, 'University name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),

  logo: z.any().optional(),
  about: z.string().optional(),
  
  type: z.enum(universityTypes),
  otherType: z.string().optional(),
  
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine(data => {
    if (data.type === 'Other') {
        return !!data.otherType && data.otherType.length > 0;
    }
    return true;
}, {
    message: 'Please specify the university type',
    path: ['otherType'],
});

type UniversityFormValues = z.infer<typeof universitySchema>;

const fieldToTabMap: Record<keyof UniversityFormValues, string> = {
  name: 'university',
  email: 'university',
  phoneNumber: 'university',
  type: 'university',
  otherType: 'university',
  about: 'university',
  address: 'location',
  country: 'location',
  state: 'location',
  city: 'location',
  zipCode: 'location',
  logo: 'account',
  password: 'account',
  isVerified: 'account',
  isActive: 'account',
};


type UniversityFormProps = {
    university?: University;
}

export function UniversityForm({ university }: UniversityFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('university');
  const TABS = ['university', 'location', 'account'];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch
  } = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
        name: university?.name || '',
        email: university?.email || '',
        phoneNumber: university?.phoneNumber || '',
        address: university?.address || '',
        country: university?.country || '',
        state: university?.state || '',
        city: university?.city || '',
        zipCode: university?.zipCode || '',
        about: university?.about || '',
        type: university?.type || 'Public',
        otherType: university?.otherType || '',
        isVerified: university?.isVerified || false,
        isActive: university?.isActive ?? true,
        logo: undefined,
    }
  });

  const selectedType = watch('type');

  const goToNextTab = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1]);
    }
  };

  const goToPrevTab = () => {
     const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0] as keyof UniversityFormValues;
    if (firstErrorField) {
      const tab = fieldToTabMap[firstErrorField];
      if (tab && tab !== activeTab) {
        setActiveTab(tab);
      }
    }
    toast({
        title: "Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive"
    });
  };

  const onSubmit = (data: UniversityFormValues) => {
    console.log(data);
    toast({
        title: university ? 'University Updated' : 'University Created',
        description: `${data.name} has been successfully ${university ? 'updated' : 'created'}.`,
    });
    router.push('/universities');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="university">University Info</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="account">Account & Media</TabsTrigger>
            </TabsList>

             <TabsContent value="university">
                <Card>
                    <CardHeader><CardTitle>University Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">University Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" {...register('phoneNumber')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                {universityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        {selectedType === 'Other' && (
                             <div className="space-y-2">
                                <Label htmlFor="otherType">Please Specify Type</Label>
                                <Input id="otherType" {...register('otherType')} />
                                {errors.otherType && <p className="text-sm text-destructive">{errors.otherType.message}</p>}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="about">About University</Label>
                            <Textarea id="about" {...register('about')} placeholder="Brief description of the university..."/>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex justify-end">
                    <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </TabsContent>

             <TabsContent value="location">
                 <Card>
                    <CardHeader><CardTitle>Location Information</CardTitle></CardHeader>
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
                <div className="mt-6 flex justify-between">
                    <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                    <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </TabsContent>

             <TabsContent value="account">
                 <Card className="mb-6">
                    <CardHeader><CardTitle>Media & Account</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="logo">University Logo</Label>
                            <Input id="logo" type="file" {...register('logo')} accept="image/*,.svg" />
                            {university?.logo && <p className="text-sm text-muted-foreground mt-1">Current: <a href={university.logo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Logo</a></p>}
                            {errors.logo && <p className="text-sm text-destructive">{errors.logo.message as string}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Set New Password</Label>
                            <Input id="password" type="password" {...register('password')} placeholder={university ? "Leave blank to keep unchanged" : ""} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Verification Status</Label>
                                <CardDescription>Indicates if the university has been verified.</CardDescription>
                            </div>
                            <Controller name="isVerified" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <CardDescription>Inactive universities cannot be associated with new jobseekers.</CardDescription>
                            </div>
                            <Controller name="isActive" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex justify-between">
                    <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                </div>
            </TabsContent>

        </Tabs>
        <CardFooter className="flex justify-end gap-2 mt-6 px-0">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
    </form>
  );
}
