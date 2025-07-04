

'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Jobseeker, skills, skillCategories, businesses, universities } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { CalendarIcon, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  address: 'profile',
  country: 'profile',
  state: 'profile',
  city: 'profile',
  zipCode: 'profile',
  headline: 'profile',
  summary: 'profile',
  about: 'profile',
  dateOfBirth: 'profile',
  gender: 'profile',
  passportNumber: 'profile',
  fieldOfStudy: 'profile',
  businessAssociationId: 'profile',
  universityAssociationId: 'profile',
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

  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: "projects" });

  const [allSkills, setAllSkills] = React.useState(skills);
  const [newSkillInputs, setNewSkillInputs] = React.useState<Record<string, string>>({});

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

  const handleAddNewSkill = (categoryId: string, categoryName: string) => {
    const newSkillName = newSkillInputs[categoryId]?.trim();
    if (!newSkillName) {
        toast({ title: "Skill name cannot be empty.", variant: "destructive" });
        return;
    }

    if (allSkills.some(s => s.name.toLowerCase() === newSkillName.toLowerCase())) {
        toast({ title: "Skill already exists.", description: `"${newSkillName}" is already in the list.`, variant: "destructive" });
        return;
    }

    const newSkill = {
        id: `SKL_${Date.now()}`,
        name: newSkillName,
        categoryId,
        categoryName,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setAllSkills(prev => [...prev, newSkill].sort((a, b) => a.name.localeCompare(b.name)));
    
    const currentSelectedSkills = form.getValues('skills') || [];
    form.setValue('skills', [...currentSelectedSkills, newSkill.name], { shouldDirty: true });
    
    setNewSkillInputs(prev => ({...prev, [categoryId]: ''}));
    
    toast({ title: "Skill Added", description: `"${newSkillName}" has been added and selected.` });
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

  const onSubmit = (data: JobseekerFormValues) => {
    const transformedData = {
        ...data,
        experience: data.experience?.map(exp => ({
            ...exp,
            responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities.filter(line => line.trim()) : [],
            achievements: Array.isArray(exp.achievements) ? exp.achievements.filter(line => line.trim()) : [],
        }))
    }
    console.log(transformedData);
    toast({
        title: jobseeker ? 'Jobseeker Updated' : 'Jobseeker Created',
        description: `${data.name} has been successfully ${jobseeker ? 'updated' : 'created'}.`,
    });
    router.push('/jobseekers');
  };

  return (
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
                         <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
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
                            <Label htmlFor="headline">Headline</Label>
                            <Input id="headline" {...register('headline')} placeholder="e.g. Senior Software Engineer" />
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="passportNumber">Passport Number</Label>
                            <Input id="passportNumber" {...register('passportNumber')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="fieldOfStudy">Field of Study</Label>
                            <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="summary">Summary</Label>
                        <Textarea id="summary" {...register('summary')} placeholder="A brief summary..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="about">About</Label>
                        <Textarea id="about" {...register('about')} className="min-h-32" placeholder="More detailed information about the jobseeker..."/>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Associations</CardTitle><CardDescription>Associate with a business or university.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Business Association</Label>
                            <Controller
                                name="businessAssociationId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(value) => field.onChange(value === '--none--' ? '' : value)} value={field.value || ''}>
                                        <SelectTrigger><SelectValue placeholder="Select a business" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="--none--">None</SelectItem>
                                            {businesses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>University Association</Label>
                             <Controller
                                name="universityAssociationId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(value) => field.onChange(value === '--none--' ? '' : value)} value={field.value || ''}>
                                        <SelectTrigger><SelectValue placeholder="Select a university" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="--none--">None</SelectItem>
                                            {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
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
                    {expFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeExp(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Job Title</Label><Input {...register(`experience.${index}.jobTitle`)} /></div>
                                <div className="space-y-2"><Label>Company Name</Label><Input {...register(`experience.${index}.companyName`)} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Controller name={`experience.${index}.startDate`} control={control} render={({ field }) => (
                                        <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-1 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                                    )}/>
                                </div>
                                <div className="flex items-center gap-2"><Controller name={`experience.${index}.isCurrent`} control={control} render={({ field }) => (<Switch id={`exp-current-${index}`} checked={field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor={`exp-current-${index}`}>I currently work here</Label></div>
                            </div>
                            <Controller
                                name={`experience.${index}.responsibilities`}
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Responsibilities (one per line)</Label>
                                        <Textarea
                                            value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                            onChange={e => field.onChange(e.target.value.split('\n'))}
                                        />
                                    </div>
                                )}
                            />
                            <Controller
                                name={`experience.${index}.achievements`}
                                control={control}
                                render={({ field }) => (
                                     <div className="space-y-2">
                                        <Label>Achievements (one per line)</Label>
                                        <Textarea
                                            value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                            onChange={e => field.onChange(e.target.value.split('\n'))}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendExp({ jobTitle: '', companyName: '', startDate: new Date(), isCurrent: false, responsibilities:[], achievements:[] })}>Add Experience</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     {eduFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeEdu(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                             <div className="space-y-2"><Label>Institution</Label><Input {...register(`education.${index}.institution`)} /></div>
                             <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Degree</Label><Input {...register(`education.${index}.degree`)} /></div>
                                <div className="space-y-2"><Label>Field of Study</Label><Input {...register(`education.${index}.fieldOfStudy`)} /></div>
                                <div className="space-y-2"><Label>CGPA</Label><Input {...register(`education.${index}.cgpa`)} /></div>
                             </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Start Date</Label><Controller name={`education.${index}.startDate`} control={control} render={({ field }) => (
                                    <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-1 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                                )}/></div>
                                <div className="space-y-2"><Label>End Date</Label><Controller name={`education.${index}.endDate`} control={control} render={({ field }) => (
                                    <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-1 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                                )}/></div>
                             </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '', startDate: new Date(), endDate: new Date() })}>Add Education</Button>
                </CardContent>
            </Card>
            <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </TabsContent>

        <TabsContent value="skills">
            <Card>
                <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>Select skills for the jobseeker, organized by category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => (
                           <div className="space-y-4">
                                <div className="flex flex-wrap gap-2 min-h-10 border rounded-md p-2">
                                    {field.value?.length > 0 ? (
                                        field.value.map(skillName => (
                                            <Badge key={skillName} variant="secondary">
                                                {skillName}
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    onClick={() => {
                                                        field.onChange(field.value?.filter(s => s !== skillName));
                                                    }}
                                                >
                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground px-2 py-1">No skills selected.</span>
                                    )}
                                </div>
                                <Accordion type="multiple" className="w-full">
                                    {skillCategories.map(category => {
                                        const categorySkills = allSkills
                                            .filter(s => s.categoryId === category.id)
                                            .sort((a,b) => a.name.localeCompare(b.name));
                                            
                                        if (categorySkills.length === 0) return null;

                                        return (
                                            <AccordionItem value={category.id} key={category.id}>
                                                <AccordionTrigger>{category.name}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {categorySkills.map(skill => (
                                                            <div key={skill.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`skill-${skill.id}`}
                                                                    checked={field.value?.includes(skill.name)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentSkills = field.value || [];
                                                                        if (checked) {
                                                                            field.onChange([...currentSkills, skill.name]);
                                                                        } else {
                                                                            field.onChange(currentSkills.filter(s => s !== skill.name));
                                                                        }
                                                                    }}
                                                                />
                                                                <Label htmlFor={`skill-${skill.id}`} className="font-normal cursor-pointer">
                                                                    {skill.name}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-dashed">
                                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Not listed? Add a new skill to this category.</p>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                placeholder="Enter new skill name"
                                                                value={newSkillInputs[category.id] || ''}
                                                                onChange={(e) => setNewSkillInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleAddNewSkill(category.id, category.name);
                                                                    }
                                                                }}
                                                            />
                                                            <Button type="button" onClick={() => handleAddNewSkill(category.id, category.name)}>Add</Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                           </div>
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
                <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Showcase the jobseeker's work.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {projFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                             <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeProj(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                             <div className="space-y-2"><Label>Project Title</Label><Input {...register(`projects.${index}.title`)} /></div>
                             <div className="space-y-2"><Label>Project URL</Label><Input {...register(`projects.${index}.url`)} /></div>
                             <div className="space-y-2"><Label>Description</Label><Textarea {...register(`projects.${index}.description`)} /></div>
                        </div>
                     ))}
                     <Button type="button" variant="outline" onClick={() => appendProj({ title: '', url: '', description: '' })}>Add Project</Button>
                </CardContent>
            </Card>
            <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Profile Media & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="profilePhoto">Profile Photo</Label>
                        <Input id="profilePhoto" type="file" {...register('profilePhoto')} accept="image/png, image/jpeg, image/webp" />
                        {jobseeker?.profilePhoto && <p className="text-sm text-muted-foreground mt-1">Current: <a href={jobseeker.profilePhoto} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Photo</a></p>}
                        {errors.profilePhoto && <p className="text-sm text-destructive">{errors.profilePhoto.message as string}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bannerImage">Banner Image</Label>
                        <Input id="bannerImage" type="file" {...register('bannerImage')} accept="image/png, image/jpeg, image/webp" />
                        {jobseeker?.bannerImage && <p className="text-sm text-muted-foreground mt-1">Current: <a href={jobseeker.bannerImage} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Banner</a></p>}
                        {errors.bannerImage && <p className="text-sm text-destructive">{errors.bannerImage.message as string}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="resume">Resume</Label>
                        <Input id="resume" type="file" {...register('resume')} accept="application/pdf,.doc,.docx" />
                         {jobseeker?.resume && <p className="text-sm text-muted-foreground mt-1">Current: <a href={jobseeker.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Resume</a></p>}
                         {errors.resume && <p className="text-sm text-destructive">{errors.resume.message as string}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="certifications">Certifications</Label>
                        <Input id="certifications" type="file" multiple {...register('certifications')} accept="application/pdf,image/*,.doc,.docx" />
                         {jobseeker?.certifications && jobseeker.certifications.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                                <p>Current certifications:</p>
                                <ul className="list-disc pl-5">
                                    {jobseeker.certifications.map((cert, index) => (
                                        <li key={index}><a href={cert} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Certification {index + 1}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                     <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="space-y-2"><Label>LinkedIn Profile</Label><Input {...register('linkedInProfile')} placeholder="https://linkedin.com/in/..." /></div>
                        <div className="space-y-2"><Label>GitHub Profile</Label><Input {...register('githubProfile')} placeholder="https://github.com/..." /></div>
                        <div className="space-y-2"><Label>Portfolio URL</Label><Input {...register('portfolio')} placeholder="https://..." /></div>
                     </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="password">Set New Password</Label>
                        <Input id="password" type="password" {...register('password')} placeholder={jobseeker ? "Leave blank to keep unchanged" : ""} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><Label>Verification Status</Label><CardDescription>Indicates if the user's identity has been verified.</CardDescription></div>
                        <Controller name="isVerified" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><Label>Active Status</Label><CardDescription>Inactive users cannot log in.</CardDescription></div>
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
              {isSubmitting ? 'Saving...' : jobseeker ? 'Save Changes' : 'Create Jobseeker'}
          </Button>
      </CardFooter>
    </form>
  );
}
