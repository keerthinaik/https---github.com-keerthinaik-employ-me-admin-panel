
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { testSkills, type TestSkill } from '@/lib/data';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DialogMode = 'addSkill' | 'editSkill' | 'addSubSkill' | 'editSubSkill';

export default function TestSkillsPage() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<TestSkill[]>(testSkills);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('addSkill');
  const [currentName, setCurrentName] = useState('');
  const [currentItem, setCurrentItem] = useState<{ skillId?: string; subSkillId?: string } | null>(null);

  const dialogTitles: Record<DialogMode, string> = {
    addSkill: 'Add New Skill',
    editSkill: 'Edit Skill',
    addSubSkill: 'Add New Sub-skill',
    editSubSkill: 'Edit Sub-skill',
  };

  const openDialog = (mode: DialogMode, item?: { skillId?: string; subSkillId?: string; name?: string }) => {
    setDialogMode(mode);
    setCurrentItem(item || null);
    setCurrentName(item?.name || '');
    setDialogOpen(true);
  };
  
  const handleDialogSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentName.trim()) {
          toast({ title: 'Name cannot be empty.', variant: 'destructive' });
          return;
      }

      switch (dialogMode) {
          case 'addSkill':
              setSkills([
                  ...skills,
                  { id: `skill-${Date.now()}`, name: currentName, subSkills: [] },
              ]);
              toast({ title: 'Skill added successfully.' });
              break;
          case 'editSkill':
              setSkills(skills.map(s => s.id === currentItem?.skillId ? { ...s, name: currentName } : s));
              toast({ title: 'Skill updated successfully.' });
              break;
          case 'addSubSkill':
              setSkills(skills.map(s => s.id === currentItem?.skillId ? {
                  ...s,
                  subSkills: [...s.subSkills, { id: `sub-${Date.now()}`, name: currentName }]
              } : s));
              toast({ title: 'Sub-skill added successfully.' });
              break;
          case 'editSubSkill':
              setSkills(skills.map(s => s.id === currentItem?.skillId ? {
                  ...s,
                  subSkills: s.subSkills.map(sub => sub.id === currentItem?.subSkillId ? { ...sub, name: currentName } : sub)
              } : s));
              toast({ title: 'Sub-skill updated successfully.' });
              break;
      }
      setDialogOpen(false);
      setCurrentName('');
      setCurrentItem(null);
  };

  const handleDeleteSkill = (skillId: string) => {
    setSkills(skills.filter(s => s.id !== skillId));
    toast({ title: 'Skill deleted successfully.' });
  };
  
  const handleDeleteSubSkill = (skillId: string, subSkillId: string) => {
    setSkills(skills.map(s => s.id === skillId ? {
        ...s,
        subSkills: s.subSkills.filter(sub => sub.id !== subSkillId)
    } : s));
    toast({ title: 'Sub-skill deleted successfully.' });
  };

  return (
    <div>
      <PageHeader title="Test Skills Management">
        <Button onClick={() => openDialog('addSkill')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </PageHeader>

      <div className="rounded-lg border">
        <Accordion type="multiple" className="w-full">
          {skills.map((skill) => (
            <AccordionItem value={skill.id} key={skill.id} className="last:border-b-0">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2 mr-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDialog('editSkill', { skillId: skill.id, name: skill.name }); }}>
                            <Edit className="h-4 w-4"/>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={e => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete Skill?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{skill.name}" and all its sub-skills. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted/20">
                <div className="space-y-2">
                  {skill.subSkills.length > 0 ? (
                    skill.subSkills.map((subSkill) => (
                      <div key={subSkill.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm">{subSkill.name}</span>
                        <div className="flex items-center gap-1">
                           <Button variant="ghost" size="icon" onClick={() => openDialog('editSubSkill', { skillId: skill.id, subSkillId: subSkill.id, name: subSkill.name })}>
                                <Edit className="h-4 w-4"/>
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete Sub-skill?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{subSkill.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSubSkill(skill.id, subSkill.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">No sub-skills yet.</p>
                  )}
                  <div className="pt-2 border-t border-dashed">
                     <Button variant="outline" size="sm" onClick={() => openDialog('addSubSkill', { skillId: skill.id })}>
                        <PlusCircle className="mr-1 h-4 w-4"/>
                        Add Sub-skill
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <form onSubmit={handleDialogSubmit}>
                <DialogHeader>
                    <DialogTitle>{dialogTitles[dialogMode]}</DialogTitle>
                    <DialogDescription>
                        Enter the name for the {dialogMode.includes('Sub') ? 'sub-skill' : 'skill'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} className="col-span-3" autoFocus />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
