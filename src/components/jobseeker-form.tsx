
'use client';

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { businesses, universities } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { CalendarIcon, ChevronLeft, ChevronRight, Trash2, X, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getSkills, getSkillCategories, createJobseeker, updateJobseeker } from '@/services/api';
import type { Skill, SkillCategory, Jobseeker } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const experienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  isCurrent: z.boolean(),
  responsibilities: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
});

const educationSchema = z.object({
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    cgpa: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
});

const projectSchema = z.object({
    title: z.string().min(1, "Project title is required"),
    description: z.string().optional(),
    url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

const jobseekerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  
  profilePhoto: z.any().optional(),
  bannerImage: z.any().optional(),
  resume: z.any().optional(),
  certifications: z.any().optional(),
  
  headline: z.string().optional(),
  summary: z.string().optional(),
  about: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  passportNumber: z.string().optional(),
  
  linkedInProfile: z.string().url().optional().or(z.literal('')),
  githubProfile: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  fieldOfStudy: z.string().optional(),

  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),

  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(z.string()).optional(),

  businessAssociationId: z.string().optional(),
  universityAssociationId: z.string().optional(),
}).refine(data => {
    return !(data.businessAssociationId && data.universityAssociationId);
}, {
    message: "A jobseeker can be associated with either a business or a university, but not both.",
    path: ["businessAssociationId"], 
});

type JobseekerFormValues = z.infer<typeof jobseekerSchema>;

const fieldToTabMap: Record<keyof JobseekerFormValues, string> = {
  name: 'profile',
  email: 'profile',
  phoneNumber: 'profile',
  headline: 'profile',
  experience: 'career',
  education: 'career',
  skills: 'skills',
  projects: 'portfolio',
  linkedInProfile: 'portfolio',
  githubProfile: 'portfolio',
  portfolio: 'portfolio',
  profilePhoto: 'account',
  bannerImage: 'account',
  resume: 'account',
  certifications: 'account',
  password: 'account',
  isVerified: 'account',
  isActive: 'account',
  businessAssociationId: 'profile',
  universityAssociationId: 'profile',
  address: 'profile',
  country: 'profile',
  state: 'profile',
  city: 'profile',
  zipCode: 'profile',
  summary: 'profile',
  about: 'profile',
  dateOfBirth: 'profile',
  gender: 'profile',
  passportNumber: 'profile',
  fieldOfStudy: 'profile',
};


type JobseekerFormProps = {
    jobseeker?: Jobseeker;
}

const ArrayTextarea = ({ value, onChange, ...props }: { value?: string[], onChange: (value: string[]) => void } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'onChange'>) => {
    const [text, setText] = React.useState(Array.isArray(value) ? value.join('\n') : '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        onChange(newText.split('\n').filter(line => line.trim() !== ''));
    };
    
    React.useEffect(() => {
        setText(Array.isArray(value) ? value.join('\n') : '');
    }, [value]);

    return <Textarea {...props} value={text} onChange={handleChange} />;
};


// Function to center the crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function JobseekerForm({ jobseeker }: JobseekerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('profile');
  const TABS = ['profile', 'career', 'skills', 'portfolio', 'account'];
  
  // State for profile photo cropping
  const [imgSrc, setImgSrc] = React.useState('')
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('')
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // State for banner image cropping
  const [bannerImgSrc, setBannerImgSrc] = React.useState('')
  const bannerImgRef = React.useRef<HTMLImageElement>(null)
  const [bannerCrop, setBannerCrop] = React.useState<Crop>()
  const [completedBannerCrop, setCompletedBannerCrop] = React.useState<Crop>()
  const [croppedBannerImageUrl, setCroppedBannerImageUrl] = React.useState<string>('')
  const [bannerDialogOpen, setBannerDialogOpen] = React.useState(false)

  const form = useForm<JobseekerFormValues>({
    resolver: zodResolver(jobseekerSchema),
    defaultValues: {
        name: jobseeker?.name || '',
        email: jobseeker?.email || '',
        password: '',
        phoneNumber: jobseeker?.phoneNumber || '',
        address: jobseeker?.address || '',
        country: jobseeker?.country || '',
        state: jobseeker?.state || '',
        city: jobseeker?.city || '',
        zipCode: jobseeker?.zipCode || '',
        headline: jobseeker?.headline || '',
        summary: jobseeker?.summary || '',
        about: jobseeker?.about || '',
        dateOfBirth: jobseeker?.dateOfBirth ? new Date(jobseeker.dateOfBirth) : undefined,
        gender: jobseeker?.gender,
        passportNumber: jobseeker?.passportNumber || '',
        linkedInProfile: jobseeker?.linkedInProfile || '',
        githubProfile: jobseeker?.githubProfile || '',
        portfolio: jobseeker?.portfolio || '',
        fieldOfStudy: jobseeker?.fieldOfStudy || '',
        businessAssociationId: jobseeker?.businessAssociationId || '',
        universityAssociationId: jobseeker?.universityAssociationId || '',
        isVerified: jobseeker?.isVerified || false,
        isActive: jobseeker?.isActive ?? true,
        experience: jobseeker?.experience?.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: exp.endDate ? new Date(exp.endDate) : undefined, responsibilities: exp.responsibilities || [], achievements: exp.achievements || [] })) || [],
        education: jobseeker?.education?.map(edu => ({ ...edu, cgpa: edu.cgpa || '', startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })) || [],
        projects: jobseeker?.projects || [],
        skills: jobseeker?.skills || [],
        profilePhoto: undefined,
        bannerImage: undefined,
        resume: undefined,
        certifications: undefined,
    }
  });

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, setValue, getValues, register } = form;

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: "projects" });
  
  React.useEffect(() => {
    if (jobseeker?.profilePhoto) {
        const fullUrl = `${API_BASE_URL}${jobseeker.profilePhoto.startsWith('/') ? '' : '/'}${jobseeker.profilePhoto}`;
        setCroppedImageUrl(fullUrl);
    }
    if (jobseeker?.bannerImage) {
        const fullUrl = `${API_BASE_URL}${jobseeker.bannerImage.startsWith('/') ? '' : '/'}${jobseeker.bannerImage}`;
        setCroppedBannerImageUrl(fullUrl);
    }
  }, [jobseeker]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader()
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(file)
      setDialogOpen(true)
    }
  }
  
  const onBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader()
      reader.addEventListener('load', () => setBannerImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(file)
      setBannerDialogOpen(true)
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (width < 200 || height < 200) {
      toast({
        title: 'Image Too Small',
        description: 'Please select an image that is at least 200x200 pixels.',
        variant: 'destructive',
      });
      setDialogOpen(false);
      setImgSrc('');
      return;
    }
    setCrop(centerAspectCrop(width, height, 1));
  }
  
  function onBannerImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width } = e.currentTarget;
    if (width < 1000) {
      toast({
        title: 'Image May Be Too Small',
        description: 'Banner image should be at least 1000px wide for best quality.',
        variant: 'default',
      });
    }
    setBannerCrop(centerAspectCrop(width, e.currentTarget.height, 1128 / 191));
  }

  const handleCropImage = async () => {
    const image = imgRef.current
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
      toast({ title: "Crop Error", description: "Could not crop image. Please try again.", variant: "destructive" });
      return;
    }
    
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast({ title: "Crop Error", description: "Could not process image.", variant: "destructive" });
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
        if (!blob) {
            toast({ title: "Crop Error", description: "Failed to create image blob.", variant: "destructive" });
            return;
        }
        const croppedUrl = URL.createObjectURL(blob);
        setCroppedImageUrl(croppedUrl);
        form.setValue('profilePhoto', new File([blob], 'profilePhoto.jpg', { type: 'image/jpeg' }), { shouldValidate: true });
        setDialogOpen(false);
    }, 'image/jpeg');
  }
  
  const handleCropBannerImage = async () => {
    const image = bannerImgRef.current
    if (!image || !completedBannerCrop || !completedBannerCrop.width || !completedBannerCrop.height) {
      toast({ title: "Crop Error", description: "Could not crop banner image. Please try again.", variant: "destructive" });
      return;
    }
    
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = completedBannerCrop.width
    canvas.height = completedBannerCrop.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast({ title: "Crop Error", description: "Could not process banner image.", variant: "destructive" });
      return;
    }

    ctx.drawImage(
      image,
      completedBannerCrop.x * scaleX,
      completedBannerCrop.y * scaleY,
      completedBannerCrop.width * scaleX,
      completedBannerCrop.height * scaleY,
      0,
      0,
      completedBannerCrop.width,
      completedBannerCrop.height
    );

    canvas.toBlob((blob) => {
        if (!blob) {
            toast({ title: "Crop Error", description: "Failed to create banner image blob.", variant: "destructive" });
            return;
        }
        const croppedUrl = URL.createObjectURL(blob);
        setCroppedBannerImageUrl(croppedUrl);
        form.setValue('bannerImage', new File([blob], 'bannerImage.jpg', { type: 'image/jpeg' }), { shouldValidate: true });
        setBannerDialogOpen(false);
    }, 'image/jpeg');
  }

  const [allSkills, setAllSkills] = React.useState<Skill[]>([]);
  const [skillCategories, setSkillCategories] = React.useState<SkillCategory[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = React.useState(true);
  
  React.useEffect(() => {
    async function fetchData() {
        try {
            const [skillsRes, categoriesRes] = await Promise.all([
                getSkills({ limit: 1000, sort: 'name' }),
                getSkillCategories({ limit: 1000, sort: 'name' })
            ]);
            setAllSkills(skillsRes.data);
            setSkillCategories(categoriesRes.data);
        } catch (error) {
            toast({ title: "Failed to load skills data", variant: "destructive" });
        } finally {
            setIsLoadingSkills(false);
        }
    }
    fetchData();
  }, [toast]);
  
  const groupedSkills = React.useMemo(() => {
    return skillCategories.map(category => ({
        ...category,
        skills: allSkills.filter(skill => skill.skillCategory?.id === category.id)
    })).filter(category => category.skills.length > 0);
  }, [skillCategories, allSkills]);


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
    const firstErrorField = Object.keys(errors)[0] as keyof JobseekerFormValues;
    if (firstErrorField) {
      // If the error is in a nested object (like experience), we need to get the top-level key.
      const topLevelField = firstErrorField.split('.')[0] as keyof JobseekerFormValues;
      const tab = fieldToTabMap[topLevelField];
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

  const onSubmit = async (data: JobseekerFormValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (key === 'businessAssociationId' || key === 'universityAssociationId') {
            if (value === '') return; // Don't append if empty string (i.e. 'None' was selected)
        }
        
        if (['experience', 'education', 'projects'].includes(key) && Array.isArray(value)) {
          value.forEach((item, index) => {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              if (itemValue !== null && itemValue !== undefined) { 
                const formattedKey = `${key}[${index}][${itemKey}]`;
                
                if (Array.isArray(itemValue)) {
                    itemValue.forEach((arrVal, arrIndex) => {
                        if (arrVal !== null && arrVal !== undefined && arrVal !== '') {
                            const nestedFormattedKey = `${formattedKey}[${arrIndex}]`;
                            formData.append(nestedFormattedKey, String(arrVal));
                        }
                    });
                } else if (itemValue instanceof Date) {
                  formData.append(formattedKey, itemValue.toISOString());
                } else if (itemValue !== '') {
                  formData.append(formattedKey, String(itemValue));
                }
              }
            });
          });
        } else if (['profilePhoto', 'bannerImage'].includes(key) && value instanceof File) {
            formData.append(key, value);
        } else if (key === 'resume' && value instanceof FileList) {
             if (value.length > 0) formData.append(key, value[0]);
        } else if (key === 'certifications' && value instanceof FileList) {
            for (let i = 0; i < value.length; i++) {
                formData.append('certifications', value[i]);
            }
        } else if (key === 'skills' && Array.isArray(value)) {
            value.forEach(v => formData.append('skills[]', v));
        } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (value !== '') {
            formData.append(key, String(value));
        }
    });
    
    try {
        if (jobseeker) {
            await updateJobseeker(jobseeker.id, formData);
        } else {
            await createJobseeker(formData);
        }
        toast({
            title: jobseeker ? 'Jobseeker Updated' : 'Jobseeker Created',
            description: `${data.name} has been successfully ${jobseeker ? 'updated' : 'created'}.`,
        });
        router.push('/jobseekers');
        router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
             let firstErrorField: keyof JobseekerFormValues | null = null;
            Object.keys(serverErrors).forEach((key) => {
                 if (!firstErrorField) {
                    firstErrorField = key.split('.')[0] as keyof JobseekerFormValues;
                }
                if (jobseekerSchema.shape && Object.prototype.hasOwnProperty.call(jobseekerSchema.shape, key)) {
                    setError(key as keyof JobseekerFormValues, {
                        type: 'server',
                        message: serverErrors[key],
                    });
                }
            });
            
            if (firstErrorField) {
                const tab = fieldToTabMap[firstErrorField];
                if (tab && tab !== activeTab) {
                    setActiveTab(tab);
                }
            }

            toast({
                title: 'Could not save jobseeker',
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
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="career">Career</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField name="name" control={control} render={({field}) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                <FormField name="email" control={control} render={({field}) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>}/>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField name="phoneNumber" control={control} render={({field}) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                <FormField name="headline" control={control} render={({field}) => <FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} placeholder="e.g. Senior Software Engineer" /></FormControl><FormMessage /></FormItem>}/>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField name="passportNumber" control={control} render={({field}) => <FormItem><FormLabel>Passport Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                <FormField name="fieldOfStudy" control={control} render={({field}) => <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                            </div>
                            <FormField name="summary" control={control} render={({field}) => <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea {...field} placeholder="A brief summary..." /></FormControl><FormMessage /></FormItem>}/>
                            <FormField name="about" control={control} render={({field}) => <FormItem><FormLabel>About</FormLabel><FormControl><Textarea {...field} className="min-h-32" placeholder="More detailed information..."/></FormControl><FormMessage /></FormItem>}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Associations</CardTitle><CardDescription>Associate with a business or university.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="businessAssociationId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Association</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(value === '--none--' ? '' : value)} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="None" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="--none--">None</SelectItem>
                                                    {businesses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="universityAssociationId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>University Association</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(value === '--none--' ? '' : value)} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="None" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="--none--">None</SelectItem>
                                                    {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {errors.businessAssociationId && <p className="text-sm text-destructive">{errors.businessAssociationId.message}</p>}
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-end">
                        <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </TabsContent>

                <TabsContent value="career" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {expFields.map((field, index) => {
                                return (
                                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4"/></Button>
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input {...register(`experience.${index}.jobTitle`)} />
                                        {errors.experience?.[index]?.jobTitle && <p className="text-sm text-destructive">{errors.experience[index]?.jobTitle?.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input {...register(`experience.${index}.companyName`)} />
                                        {errors.experience?.[index]?.companyName && <p className="text-sm text-destructive">{errors.experience[index]?.companyName?.message}</p>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={control} name={`experience.${index}.startDate`} render={({ field: dateField, fieldState }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal",!dateField.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dateField.value ? format(dateField.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus /></PopoverContent></Popover>{fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}</FormItem>)}/>
                                        <FormField control={control} name={`experience.${index}.endDate`} render={({ field: dateField, fieldState }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal",!dateField.value && "text-muted-foreground")} disabled={form.watch(`experience.${index}.isCurrent`)}><CalendarIcon className="mr-2 h-4 w-4" />{dateField.value ? format(dateField.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus /></PopoverContent></Popover>{fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}</FormItem>)}/>
                                    </div>
                                    <FormField control={control} name={`experience.${index}.isCurrent`} render={({field}) => <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">I currently work here</FormLabel></FormItem>} />
                                    <div className="space-y-2">
                                        <Label>Responsibilities (one per line)</Label>
                                        <Controller name={`experience.${index}.responsibilities`} control={control} render={({ field }) => <ArrayTextarea {...field} />} />
                                        {errors.experience?.[index]?.responsibilities && <p className="text-sm text-destructive">{errors.experience[index]?.responsibilities?.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Achievements (one per line)</Label>
                                        <Controller name={`experience.${index}.achievements`} control={control} render={({ field }) => <ArrayTextarea {...field} />} />
                                        {errors.experience?.[index]?.achievements && <p className="text-sm text-destructive">{errors.experience[index]?.achievements?.message}</p>}
                                    </div>
                                </div>
                            )})}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ jobTitle: '', companyName: '', startDate: new Date(), isCurrent: false, responsibilities: [], achievements: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {eduFields.map((field, index) => {
                                return (
                                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4"/></Button>
                                    <div className="space-y-2">
                                        <Label>Institution</Label>
                                        <Input {...register(`education.${index}.institution`)} />
                                        {errors.education?.[index]?.institution && <p className="text-sm text-destructive">{errors.education[index]?.institution?.message}</p>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Degree</Label>
                                            <Input {...register(`education.${index}.degree`)} />
                                            {errors.education?.[index]?.degree && <p className="text-sm text-destructive">{errors.education[index]?.degree?.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Field of Study</Label>
                                            <Input {...register(`education.${index}.fieldOfStudy`)} />
                                            {errors.education?.[index]?.fieldOfStudy && <p className="text-sm text-destructive">{errors.education[index]?.fieldOfStudy?.message}</p>}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <FormField control={control} name={`education.${index}.startDate`} render={({ field: dateField, fieldState }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal",!dateField.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dateField.value ? format(dateField.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus /></PopoverContent></Popover>{fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}</FormItem>)}/>
                                        <FormField control={control} name={`education.${index}.endDate`} render={({ field: dateField, fieldState }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal",!dateField.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dateField.value ? format(dateField.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus /></PopoverContent></Popover>{fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}</FormItem>)}/>
                                        <div className="space-y-2">
                                            <Label>CGPA/Grade</Label>
                                            <Input {...register(`education.${index}.cgpa`)} />
                                            {errors.education?.[index]?.cgpa && <p className="text-sm text-destructive">{errors.education[index]?.cgpa?.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            )})}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '', startDate: new Date(), endDate: new Date(), cgpa: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-between">
                        <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </TabsContent>

                <TabsContent value="skills">
                    <Card>
                        <CardHeader><CardTitle>Skills</CardTitle><CardDescription>Select all relevant skills.</CardDescription></CardHeader>
                        <CardContent>
                            <FormField
                                control={control}
                                name="skills"
                                render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {field.value && field.value.length > 0 ? (
                                                                field.value.map(skillId => {
                                                                    const skill = allSkills.find(s => s.id === skillId);
                                                                    return <Badge key={skillId} variant="secondary">{skill?.name || skillId}</Badge>
                                                                })
                                                            ) : ( "Select skills..." )}
                                                        </div>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search skills..." />
                                                    <CommandEmpty>No skills found.</CommandEmpty>
                                                    <CommandGroup className="max-h-60 overflow-auto">
                                                        {isLoadingSkills ? (
                                                            <CommandItem disabled>Loading skills...</CommandItem>
                                                        ) : (
                                                            groupedSkills.map(category => (
                                                                <CommandGroup key={category.id} heading={category.name}>
                                                                    {category.skills.map(skill => (
                                                                        <CommandItem
                                                                            key={skill.id}
                                                                            value={skill.name}
                                                                            onSelect={() => {
                                                                                const currentSkills = field.value || [];
                                                                                const isSelected = currentSkills.includes(skill.id);
                                                                                if (isSelected) {
                                                                                    field.onChange(currentSkills.filter(s => s !== skill.id));
                                                                                } else {
                                                                                    field.onChange([...currentSkills, skill.id]);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4", field.value?.includes(skill.id) ? "opacity-100" : "opacity-0")}/>
                                                                            {skill.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-between">
                        <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </TabsContent>
                
                <TabsContent value="portfolio" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Online Presence</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField name="linkedInProfile" control={control} render={({field}) => <FormItem><FormLabel>LinkedIn Profile</FormLabel><FormControl><Input {...field} placeholder="https://linkedin.com/in/..."/> </FormControl><FormMessage /></FormItem>}/>
                            <FormField name="githubProfile" control={control} render={({field}) => <FormItem><FormLabel>GitHub Profile</FormLabel><FormControl><Input {...field} placeholder="https://github.com/..."/> </FormControl><FormMessage /></FormItem>}/>
                            <FormField name="portfolio" control={control} render={({field}) => <FormItem><FormLabel>Portfolio Website</FormLabel><FormControl><Input {...field} placeholder="https://..."/> </FormControl><FormMessage /></FormItem>}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {projFields.map((field, index) => {
                                return (
                                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removeProj(index)}><Trash2 className="h-4 w-4"/></Button>
                                    <FormField name={`projects.${index}.title`} control={control} render={({field}) => <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                    <FormField name={`projects.${index}.url`} control={control} render={({field}) => <FormItem><FormLabel>Project URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                    <FormField name={`projects.${index}.description`} control={control} render={({field}) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>}/>
                                </div>
                            )})}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendProj({ title: '', url: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-between">
                        <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </TabsContent>
                
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Media & Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={control}
                                name="profilePhoto"
                                render={() => (
                                <FormItem>
                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={croppedImageUrl} alt="Jobseeker profile photo" />
                                            <AvatarFallback>{getValues('name')?.slice(0,2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow space-y-2">
                                            <FormLabel>Profile Photo</FormLabel>
                                            <FormControl>
                                                <Input id="profilePhoto-input" type="file" accept="image/*" onChange={onFileChange} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">Image must be at least 200x200px.</p>
                                            <FormMessage />
                                        </div>
                                    </div>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="bannerImage"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Banner Image</FormLabel>
                                    <FormControl>
                                        <div className="w-full aspect-[4/1] bg-muted rounded-md flex items-center justify-center overflow-hidden border">
                                            {croppedBannerImageUrl ? (
                                                <img src={croppedBannerImageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Banner Preview (1128x191px)</span>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormControl>
                                        <Input
                                            id="bannerImage-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={onBannerFileChange}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">Recommended size: 1128x191px.</p>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField control={control} name="resume" render={({field}) => <FormItem><FormLabel>Resume/CV</FormLabel><FormControl><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>}/>
                            <FormField control={control} name="certifications" render={({field}) => <FormItem><FormLabel>Certifications</FormLabel><FormControl><Input type="file" accept=".pdf,image/*" multiple onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                                <FormField control={control} name="password" render={({ field }) => ( <FormItem><FormLabel>Set New Password</FormLabel><FormControl><Input type="password" {...field} placeholder={jobseeker ? "Leave blank to keep unchanged" : ""} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={control} name="isVerified" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Verification Status</FormLabel><CardDescription>Indicates if the jobseeker has been verified.</CardDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                <FormField control={control} name="isActive" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Active Status</FormLabel><CardDescription>Inactive jobseekers cannot log in or apply for jobs.</CardDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
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
                    {isSubmitting ? 'Saving...' : jobseeker ? 'Save Changes' : 'Create Jobseeker'}
                </Button>
            </CardFooter>
        </form>
    </Form>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Crop your profile photo</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                    minWidth={200}
                    minHeight={200}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCropImage}>Crop & Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Crop your banner image</DialogTitle>
            </DialogHeader>
            {bannerImgSrc && (
                <ReactCrop
                    crop={bannerCrop}
                    onChange={(_, percentCrop) => setBannerCrop(percentCrop)}
                    onComplete={(c) => setCompletedBannerCrop(c)}
                    aspect={1128 / 191}
                    minWidth={400}
                >
                    <img
                        ref={bannerImgRef}
                        alt="Crop me"
                        src={bannerImgSrc}
                        onLoad={onBannerImageLoad}
                    />
                </ReactCrop>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setBannerDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCropBannerImage}>Crop & Save Banner</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
