
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type Application } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const allStatuses: [Application['status'], ...Application['status'][]] = ['Applied', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];

const applicationSchema = z.object({
  status: z.enum(allStatuses),
  feedback: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

type ApplicationFormProps = {
    application: Application;
}

export function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
        status: application.status,
        feedback: application.feedback || '',
    }
  });

  const onSubmit = (data: ApplicationFormValues) => {
    console.log(data);
    toast({
        title: 'Application Updated',
        description: `Application for ${application.applicantName} has been successfully updated.`,
    });
    router.push('/applications');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>Manage Application for {application.applicantName}</CardTitle>
                <CardDescription>
                    Update the application status and provide internal feedback.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="status">Application Status</Label>
                     <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allStatuses.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                
                 <div className="space-y-2">
                    <Label htmlFor="feedback">Internal Feedback</Label>
                    <Textarea
                        id="feedback"
                        {...register('feedback')}
                        placeholder="Add internal notes or feedback about the candidate..."
                        className="min-h-[150px]"
                    />
                    {errors.feedback && <p className="text-sm text-destructive">{errors.feedback.message}</p>}
                </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>
    </form>
  );
}
