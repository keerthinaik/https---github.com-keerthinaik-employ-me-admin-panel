"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import type { User, Role } from "@/lib/types"

const mockUsers: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", avatarUrl: "https://placehold.co/40x40", role: "Admin", status: "Active", createdAt: "2023-01-15" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", avatarUrl: "https://placehold.co/40x40", role: "Editor", status: "Active", createdAt: "2023-02-20" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", avatarUrl: "https://placehold.co/40x40", role: "Viewer", status: "Disabled", createdAt: "2023-03-10" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", avatarUrl: "https://placehold.co/40x40", role: "Editor", status: "Active", createdAt: "2023-04-05" },
];

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(mockUsers)

  const handleStatusChange = (userId: string, status: boolean) => {
    setUsers(users.map(user => user.id === userId ? { ...user, status: status ? "Active" : "Disabled" } : user))
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>Manage all user accounts in the system.</CardDescription>
          </div>
          <UserFormDialog>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create User</Button>
          </UserFormDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.status === 'Active'}
                    onCheckedChange={(checked) => handleStatusChange(user.id, checked)}
                    aria-label="Toggle user status"
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <UserFormDialog user={user}>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </UserFormDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function UserFormDialog({ children, user }: { children: React.ReactNode, user?: User }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update the details for this user." : "Fill in the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" defaultValue={user?.name} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select defaultValue={user?.role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">{user ? "Save Changes" : "Create User"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Add Card components for styling
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
