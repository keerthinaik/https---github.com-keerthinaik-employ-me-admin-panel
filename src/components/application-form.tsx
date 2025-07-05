
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import type { Application } from '@/lib/types';
import { applicationStatuses } from '@/lib/types';
import { updateApplication } from '@/services/api';

const applicationSchema = z.object({
  status: z.enum(applicationStatuses),
  feedback: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

type ApplicationFormProps = {
    application: Application;
}

export function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
        status: application.status,
        feedback: application.feedback || '',
    }
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
        await updateApplication(application.id, data);
        toast({
            title: 'Application Updated',
            description: `Application for ${(application.jobSeeker as any).name} has been successfully updated.`,
        });
        router.push('/applications');
        router.refresh();
    } catch(error: any) {
        toast({
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive',
        });
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Application for {(application.jobSeeker as any).name}</CardTitle>
                    <CardDescription>
                        Update the application status and provide internal feedback.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Application Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {applicationStatuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                     <FormField
                        control={form.control}
                        name="feedback"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Internal Feedback</FormLabel>
                                 <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Add internal notes or feedback about the candidate..."
                                        className="min-h-[150px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
  );
}
