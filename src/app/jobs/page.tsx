"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import type { JobPosting } from "@/lib/types"

const mockJobs: JobPosting[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    location: "Remote",
    description: "Seeking a senior frontend engineer with 5+ years of experience in React and TypeScript. You will be responsible for building our next-generation user interfaces.",
    tags: ["React", "TypeScript", "Remote", "Senior"],
    status: "Pending",
    submittedAt: "2024-05-20T10:00:00Z"
  },
  {
    id: "2",
    title: "UX/UI Designer",
    companyName: "Creative Solutions",
    location: "New York, NY",
    description: "Creative Solutions is looking for a talented UX/UI designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design.",
    tags: ["UX", "UI", "Figma", "Design"],
    status: "Pending",
    submittedAt: "2024-05-19T14:30:00Z"
  },
  {
    id: "3",
    title: "Data Scientist",
    companyName: "DataDriven Co.",
    location: "London, UK",
    description: "Join our team of data scientists to help us make sense of large datasets and build predictive models. Strong background in Python and machine learning is required.",
    tags: ["Python", "Machine Learning", "Data Analysis"],
    status: "Pending",
    submittedAt: "2024-05-19T09:00:00Z"
  },
  {
    id: "4",
    title: "Product Manager",
    companyName: "Productify Ltd.",
    location: "Berlin, Germany",
    description: "We are hiring an experienced Product Manager to lead one of our core product lines. You will work with cross-functional teams to design, build and roll-out products that deliver the company’s vision.",
    tags: ["Product Management", "Agile", "Roadmap"],
    status: "Pending",
    submittedAt: "2024-05-18T16:45:00Z"
  },
]

export default function JobsPage() {
  const [jobs, setJobs] = React.useState(mockJobs)

  const handleDecision = (id: string, decision: "Approved" | "Rejected") => {
    setJobs(jobs.filter(job => job.id !== id))
    // Here you would typically call an API to update the job status
    console.log(`Job ${id} has been ${decision}.`)
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
         <CheckCircleIcon className="w-24 h-24 text-green-500" />
        <h2 className="mt-6 text-2xl font-semibold">All Caught Up!</h2>
        <p className="mt-2 text-muted-foreground">There are no pending job postings to review.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Card key={job.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.companyName} - {job.location}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-4">{job.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDecision(job.id, "Rejected")}>
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button size="sm" onClick={() => handleDecision(job.id, "Approved")}>
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
