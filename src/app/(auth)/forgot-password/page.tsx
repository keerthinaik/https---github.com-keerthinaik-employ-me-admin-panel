'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock reset logic
        alert('Password reset link sent!');
        router.push('/login');
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                 <div className="flex justify-center items-center gap-2 mb-4">
                    <Globe className="h-8 w-8 text-primary" />
                    <h1 className="font-bold text-2xl">Employ Me</h1>
                </div>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
            </CardHeader>
            <form onSubmit={handleReset}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full">Send Reset Link</Button>
                     <Button variant="link" asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
