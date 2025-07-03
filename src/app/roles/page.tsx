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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User, Role } from "@/lib/types"

const mockUsers: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", avatarUrl: "https://placehold.co/40x40", role: "Admin", status: "Active", createdAt: "2023-01-15" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", avatarUrl: "https://placehold.co/40x40", role: "Editor", status: "Active", createdAt: "2023-02-20" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", avatarUrl: "https://placehold.co/40x40", role: "Viewer", status: "Disabled", createdAt: "2023-03-10" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", avatarUrl: "https://placehold.co/40x40", role: "Editor", status: "Active", createdAt: "2023-04-05" },
  { id: "5", name: "Ethan Hunt", email: "ethan@example.com", avatarUrl: "https://placehold.co/40x40", role: "Viewer", status: "Active", createdAt: "2023-05-12" },
];

export default function RolesPage() {
  const [users, setUsers] = React.useState<User[]>(mockUsers)

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user))
    // In a real app, you would call an API to save this change.
    console.log(`User ${userId} role changed to ${newRole}`)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>Assign and manage roles to control access levels across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead className="w-[180px]">Change Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
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
                  <Select
                    defaultValue={user.role}
                    onValueChange={(newRole: Role) => handleRoleChange(user.id, newRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
