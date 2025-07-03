
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/theme-toggle'

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
    const { toast } = useToast()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    })

    const onPasswordSubmit = (data: PasswordFormValues) => {
        console.log(data)
        toast({
            title: 'Password Updated',
            description: 'Your password has been successfully changed.',
        })
        reset()
    }

    return (
        <div>
            <PageHeader title="Settings" />
            <Tabs defaultValue="password" className="w-full">
                <TabsList>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="password">
                    <form onSubmit={handleSubmit(onPasswordSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your login password here.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input id="currentPassword" type="password" {...register('currentPassword')} />
                                    {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input id="newPassword" type="password" {...register('newPassword')} />
                                    {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Update Password'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </TabsContent>
                <TabsContent value="theme">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme</CardTitle>
                            <CardDescription>Change the appearance of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center space-x-2">
                            <Label>Appearance</Label>
                            <ThemeToggle />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delete Account</CardTitle>
                            <CardDescription className="text-destructive">
                                Once you delete your account, there is no going back. Please be certain.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="destructive">Delete Account</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
