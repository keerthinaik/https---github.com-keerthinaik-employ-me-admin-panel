
import { PageHeader } from "@/components/page-header";
import { subscriptionPlans } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Edit } from "lucide-react";
import Link from "next/link";
import type { SubscriptionPlan } from "@/lib/data";

const b2bUserTypes: ('Employer' | 'Business' | 'University')[] = ['Employer', 'Business', 'University'];

const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => {
    const userType = plan.userTypes[0].toLowerCase();
    const editHref = `/${userType}-plans/${plan.id}/edit`;
    
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">{userType}</Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="text-3xl font-bold">
                    ${plan.prices.find(p => p.currency === 'USD')?.amount || 'N/A'}
                    <span className="text-sm font-normal text-muted-foreground">/ {plan.durationInDays} days</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={editHref}>
                        <Edit className="mr-1 h-4 w-4" /> Edit Plan
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function ActiveB2BPlansPage() {
    const activeB2BPlans = subscriptionPlans.filter(plan =>
        plan.isActive &&
        plan.userTypes.some(ut => b2bUserTypes.includes(ut as any))
    );

    const groupedPlans = {
        Employer: activeB2BPlans.filter(p => p.userTypes.includes('Employer')),
        Business: activeB2BPlans.filter(p => p.userTypes.includes('Business')),
        University: activeB2BPlans.filter(p => p.userTypes.includes('University')),
    };

    return (
        <div>
            <PageHeader title="Active B2B Subscription Plans" />
            
            <div className="space-y-12">
                {Object.entries(groupedPlans).map(([userType, plans]) => {
                    if (plans.length === 0) return null;
                    return (
                        <section key={userType}>
                            <h2 className="text-2xl font-semibold tracking-tight mb-4">{userType} Plans</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <PlanCard key={plan.id} plan={plan} />
                                ))}
                            </div>
                        </section>
                    )
                })}
            </div>
        </div>
    );
}
