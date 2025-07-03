"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Locale, Translation } from "@/lib/types"

const mockLocales: Locale[] = [
  {
    name: "English",
    code: "en",
    translations: [
      { key: "home.welcome", value: "Welcome to the Admin Panel" },
      { key: "jobs.approve", value: "Approve" },
      { key: "users.create", value: "Create User" },
    ],
  },
  {
    name: "Español",
    code: "es",
    translations: [
      { key: "home.welcome", value: "Bienvenido al Panel de Administración" },
      { key: "jobs.approve", value: "Aprobar" },
      { key: "users.create", value: "Crear Usuario" },
    ],
  },
  {
    name: "Français",
    code: "fr",
    translations: [
      { key: "home.welcome", value: "Bienvenue sur le Panneau d'Administration" },
      { key: "jobs.approve", value: "Approuver" },
      { key: "users.create", value: "Créer un Utilisateur" },
    ],
  },
  {
    name: "Deutsch",
    code: "de",
    translations: [
      { key: "home.welcome", value: "Willkommen im Admin-Panel" },
      { key: "jobs.approve", value: "Genehmigen" },
      { key: "users.create", value: "Benutzer erstellen" },
    ],
  },
]

export default function LocalizationPage() {
  const [locales, setLocales] = React.useState<Locale[]>(mockLocales)
  const [activeTab, setActiveTab] = React.useState<string>(locales[0].code)

  const handleTranslationChange = (localeCode: string, key: string, value: string) => {
    setLocales(locales.map(locale => 
      locale.code === localeCode 
        ? { ...locale, translations: locale.translations.map(t => t.key === key ? { ...t, value } : t) }
        : locale
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Localization Management</CardTitle>
            <CardDescription>Manage multilingual content and ensure accurate translations.</CardDescription>
          </div>
          <Button>Save All Changes</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            {locales.map(locale => (
              <TabsTrigger key={locale.code} value={locale.code}>{locale.name}</TabsTrigger>
            ))}
          </TabsList>
          {locales.map(locale => (
            <TabsContent key={locale.code} value={locale.code}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Translation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locale.translations.map(translation => (
                    <TableRow key={translation.key}>
                      <TableCell className="font-mono text-sm">{translation.key}</TableCell>
                      <TableCell>
                        <Input 
                          value={translation.value} 
                          onChange={(e) => handleTranslationChange(locale.code, translation.key, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
