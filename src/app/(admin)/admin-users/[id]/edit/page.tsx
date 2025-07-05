'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ProfileUser, Country, State, City } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAdminUser, updateAdminUser, getCountries, getStates, getCities } from '@/services/api';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const adminUserSchema = z.object({
  name: z.string().min(2, "Name cannot contain only numbers").refine(v => !/^\d+$/.test(v), { message: "Name cannot contain only numbers" }),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Please provide a valid phone number").optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional().refine(v => !v || /^[A-Za-z0-9\s\-]{3,10}$/.test(v), { message: "Please provide a valid postal code" }),
  profilePhoto: z.any().optional(),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type AdminUserFormValues = z.infer<typeof adminUserSchema>;

const fieldToTabMap: Record<keyof AdminUserFormValues, string> = {
  name: 'info', email: 'info', password: 'info', phoneNumber: 'info',
  address: 'location', country: 'location', state: 'location', city: 'location', zipCode: 'location',
  profilePhoto: 'account', isVerified: 'account', isActive: 'account',
};

type AdminUserFormProps = {
    user?: ProfileUser;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth, mediaHeight
  );
}

export function AdminUserForm({ user }: AdminUserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('info');
  const TABS = ['info', 'location', 'account'];
  
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);
  const [openCountry, setOpenCountry] = React.useState(false);
  const [openState, setOpenState] = React.useState(false);
  const [openCity, setOpenCity] = React.useState(false);
  
  const [imgSrc, setImgSrc] = React.useState('')
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('')
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      country: user?.country || '',
      state: user?.state || '',
      city: user?.city || '',
      zipCode: user?.zipCode || '',
      isVerified: user?.isVerified || false,
      isActive: user?.isActive ?? true,
      profilePhoto: undefined,
    }
  });
  
  const { handleSubmit, formState: { errors, isSubmitting }, control, setError, watch, setValue, reset } = form;

  const watchedCountry = watch('country');
  const watchedState = watch('state');

  const countryRef = React.useRef(user?.country);
  const stateRef = React.useRef(user?.state);

  React.useEffect(() => {
    if (user?.profilePhoto) {
      setCroppedImageUrl(`${API_BASE_URL}${user.profilePhoto.startsWith('/') ? '' : '/'}${user.profilePhoto}`);
    }
  }, [user]);
  
  React.useEffect(() => {
    setIsLoadingCountries(true);
    getCountries().then(setCountries).catch(() => toast({ title: "Failed to load countries", variant: "destructive" })).finally(() => setIsLoadingCountries(false));
  }, [toast]);
  
  React.useEffect(() => {
    if (watchedCountry) {
      setIsLoadingStates(true);
      if (countryRef.current !== watchedCountry) setValue('state', '');
      setStates([]);
      getStates(watchedCountry).then(setStates).catch(() => toast({ title: "Failed to load states", variant: "destructive" })).finally(() => setIsLoadingStates(false));
    }
    countryRef.current = watchedCountry;
  }, [watchedCountry, toast, setValue]);

  React.useEffect(() => {
    if (watchedCountry && watchedState) {
      setIsLoadingCities(true);
      if (stateRef.current !== watchedState) setValue('city', '');
      setCities([]);
      getCities(watchedCountry, watchedState).then(setCities).catch(() => toast({ title: "Failed to load cities", variant: "destructive" })).finally(() => setIsLoadingCities(false));
    }
    stateRef.current = watchedState;
  }, [watchedCountry, watchedState, toast, setValue]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      setDialogOpen(true);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setCrop(centerAspectCrop(e.currentTarget.width, e.currentTarget.height, 1));
  }

  const handleCropImage = () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return toast({ title: "Crop Error", variant: "destructive" });
    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width; canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return toast({ title: "Crop Error", variant: "destructive" });
    ctx.drawImage(image, completedCrop.x, completedCrop.y, completedCrop.width, completedCrop.height, 0, 0, completedCrop.width, completedCrop.height);
    canvas.toBlob((blob) => {
      if (!blob) return toast({ title: "Crop Error", variant: "destructive" });
      setCroppedImageUrl(URL.createObjectURL(blob));
      setValue('profilePhoto', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }), { shouldValidate: true });
      setDialogOpen(false);
    }, 'image/jpeg');
  }

  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0] as keyof AdminUserFormValues;
    if (firstErrorField) {
      const tab = fieldToTabMap[firstErrorField];
      if (tab && tab !== activeTab) setActiveTab(tab);
    }
    toast({ title: "Validation Error", description: "Please check the form for errors.", variant: "destructive" });
  };
  
  const onSubmit = async (data: AdminUserFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (user && key === 'password' && !value) return;
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'profilePhoto' && value instanceof File) formData.append('profilePhoto', value);
        else formData.append(key, String(value));
      }
    });

    try {
      const response = user ? await updateAdminUser(user.id, formData) : await createAdminUser(formData);
      toast({ title: user ? 'Admin Updated' : 'Admin Created', description: `${response.name} has been successfully saved.` });
      router.push('/admins');
      router.refresh();
    } catch (error: any) {
      toast({ title: 'An error occurred', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="info">User Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader><CardTitle>Admin Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField name="name" control={control} render={({field}) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                    <FormField name="email" control={control} render={({field}) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>}/>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField name="phoneNumber" control={control} render={({field}) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                    <FormField name="password" control={control} render={({field}) => <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} placeholder={user ? "Leave blank to keep unchanged" : ""} /></FormControl><FormMessage /></FormItem>}/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><Popover open={openCountry} onOpenChange={setOpenCountry}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between">{isLoadingCountries ? <Skeleton className="h-5 w-3/4" /> : field.value ? countries.find(c => c.isoCode === field.value)?.name : "Select country..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search country..." /><CommandEmpty>No country found.</CommandEmpty><CommandGroup className="max-h-60 overflow-auto">{countries.map(c => ( <CommandItem key={c.isoCode} value={c.name} onSelect={() => { setValue('country', c.isoCode, { shouldValidate: true }); setOpenCountry(false); }}> <Check className={cn("mr-2 h-4 w-4", c.isoCode === field.value ? "opacity-100" : "opacity-0")} /> {c.name}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                    <FormField control={control} name="state" render={({ field }) => ( <FormItem><FormLabel>State / Province</FormLabel><Popover open={openState} onOpenChange={setOpenState}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedCountry || isLoadingStates}>{isLoadingStates ? <Skeleton className="h-5 w-3/4" /> : field.value ? states.find(s => s.isoCode === field.value)?.name : "Select state..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search state..." /><CommandEmpty>No state found.</CommandEmpty><CommandGroup className="max-h-60 overflow-auto">{states.map(s => ( <CommandItem key={s.isoCode} value={s.name} onSelect={() => { setValue('state', s.isoCode, { shouldValidate: true }); setOpenState(false); }}> <Check className={cn("mr-2 h-4 w-4", s.isoCode === field.value ? "opacity-100" : "opacity-0")} /> {s.name}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                    <FormField control={control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><Popover open={openCity} onOpenChange={setOpenCity}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedState || isLoadingCities}>{isLoadingCities ? <Skeleton className="h-5 w-3/4" /> : field.value ? field.value : "Select city..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search city..." /><CommandEmpty>No city found.</CommandEmpty><CommandGroup className="max-h-60 overflow-auto">{cities.map(c => ( <CommandItem key={c.name} value={c.name} onSelect={() => {setValue('city', c.name, { shouldValidate: true }); setOpenCity(false);}}><Check className={cn("mr-2 h-4 w-4", c.name === field.value ? "opacity-100" : "opacity-0")} />{c.name}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                  </div>
                  <FormField control={control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField name="profilePhoto" control={control} render={() => (<FormItem><div className="flex items-center gap-6"><Avatar className="h-20 w-20"><AvatarImage src={croppedImageUrl} alt="Admin profile photo" /><AvatarFallback>{form.getValues('name')?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><div className="flex-grow space-y-2"><FormLabel>Profile Photo</FormLabel><FormControl><Input type="file" accept="image/*" onChange={onFileChange} /></FormControl><p className="text-xs text-muted-foreground">Image must be at least 200x200px.</p><FormMessage /></div></div></FormItem>)}/>
                  <FormField control={control} name="isVerified" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Verification Status</FormLabel><CardDescription>Indicates if the admin has been verified.</CardDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                  <FormField control={control} name="isActive" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Active Status</FormLabel><CardDescription>Inactive admins cannot log in.</CardDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex justify-end gap-2 mt-6 px-0">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Admin'}</Button>
          </CardFooter>
        </form>
      </Form>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Crop Profile Photo</DialogTitle></DialogHeader>
          {imgSrc && <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop minWidth={200} minHeight={200}><img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} /></ReactCrop>}
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleCropImage}>Crop & Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
