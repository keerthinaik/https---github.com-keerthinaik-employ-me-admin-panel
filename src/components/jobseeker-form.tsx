
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
import { CalendarIcon, ChevronLeft, ChevronRight, Trash2, X, ChevronsUpDown, Check } from 'lucide-react';
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

const fieldToTabMap: Record<string, string> = {
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
};


type JobseekerFormProps = {
    jobseeker?: Jobseeker;
}

export function JobseekerForm({ jobseeker }: JobseekerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('profile');
  const TABS = ['profile', 'career', 'skills', 'portfolio', 'account'];
  
  const form = useForm<JobseekerFormValues>({
    resolver: zodResolver(jobseekerSchema),
    defaultValues: {
        name: jobseeker?.name || '',
        email: jobseeker?.email || '',
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
        fieldOfStudy: jobseeker?.fieldOfStudy || '',
        businessAssociationId: jobseeker?.businessAssociationId || '',
        universityAssociationId: jobseeker?.universityAssociationId || '',
        linkedInProfile: jobseeker?.linkedInProfile || '',
        githubProfile: jobseeker?.githubProfile || '',
        portfolio: jobseeker?.portfolio || '',
        isVerified: jobseeker?.isVerified || false,
        isActive: jobseeker?.isActive ?? true,
        experience: jobseeker?.experience?.map(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: exp.endDate ? new Date(exp.endDate) : undefined, responsibilities: exp.responsibilities || [], achievements: exp.achievements || [] })) || [],
        education: jobseeker?.education?.map(edu => ({ ...edu, startDate: new Date(edu.startDate), endDate: new Date(edu.endDate) })) || [],
        projects: jobseeker?.projects || [],
        skills: jobseeker?.skills || [],
        profilePhoto: undefined,
        bannerImage: undefined,
        resume: undefined,
        certifications: undefined,
    }
  });

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = form;

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: "projects" });

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

  const onSubmit = async (data: JobseekerFormValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;

        if (['profilePhoto', 'bannerImage', 'resume'].includes(key) && value instanceof FileList) {
            if (value.length > 0) formData.append(key, value[0]);
        } else if (key === 'certifications' && value instanceof FileList) {
            for (let i = 0; i < value.length; i++) {
                formData.append('certifications', value[i]);
            }
        } else if (key === 'skills' && Array.isArray(value)) {
            value.forEach(v => formData.append('skills[]', v));
        } else if (['experience', 'education', 'projects'].includes(key)) {
            formData.append(key, JSON.stringify(value));
        } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
        } else {
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
                    firstErrorField = key as keyof JobseekerFormValues;
                }
                if (Object.prototype.hasOwnProperty.call(jobseekerSchema._def.schema.shape, key)) {
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
                                    <FormItem><FormLabel>Business Association</FormLabel><Select onValueChange={(value) => field.onChange(value === '--none--' ? '' : value)} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a business" /></SelectTrigger></FormControl><SelectContent><SelectItem value="--none--">None</SelectItem>{businesses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="universityAssociationId"
                                render={({ field }) => (
                                    <FormItem><FormLabel>University Association</FormLabel><Select onValueChange={(value) => field.onChange(value === '--none--' ? '' : value)} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="Select a university" /></SelectTrigger></FormControl><SelectContent><SelectItem value="--none--">None</SelectItem>{universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
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
                {/* Career Content (Experience, Education) */}
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
            
            <TabsContent value="portfolio">
                {/* Portfolio Content */}
                 <div className="mt-6 flex justify-between">
                    <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                    <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </TabsContent>
            
            <TabsContent value="account">
                {/* Account Content */}
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
  );
}
