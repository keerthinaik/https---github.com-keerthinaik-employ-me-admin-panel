
'use client'

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator';


const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  avatar: z.any().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, {message: "Please provide a valid US zip code"}).optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// Function to center the crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ProfilePage() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Admin User',
      email: 'admin@talent.hub',
      phoneNumber: '+1-555-0199',
      address: '123 Admin Lane',
      city: 'Techville',
      state: 'CA',
      country: 'USA',
      zipCode: '90210',
    },
  })
  
  const [imgSrc, setImgSrc] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [aspect, setAspect] = useState<number | undefined>(1)
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader()
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(file)
      setDialogOpen(true)
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (width < 200 || height < 200) {
      toast({
        title: 'Image Too Small',
        description: 'Please select an image that is at least 200x200 pixels.',
        variant: 'destructive',
      });
      setDialogOpen(false);
      setImgSrc('');
      return;
    }
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleCropImage = async () => {
    const image = imgRef.current
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
      toast({ title: "Crop Error", description: "Could not crop image. Please try again.", variant: "destructive" });
      return;
    }
    
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast({ title: "Crop Error", description: "Could not process image.", variant: "destructive" });
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
        if (!blob) {
            toast({ title: "Crop Error", description: "Failed to create image blob.", variant: "destructive" });
            return;
        }
        const croppedUrl = URL.createObjectURL(blob);
        setCroppedImageUrl(croppedUrl);
        setValue('avatar', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }), { shouldValidate: true });
        setDialogOpen(false);
    }, 'image/jpeg');
  }

  const onSubmit = (data: ProfileFormValues) => {
    console.log(data)
    // Here you would typically upload the data.avatar file
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PageHeader title="My Profile" />
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information and photo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={croppedImageUrl || "https://placehold.co/80x80.png"} alt="User avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-grow space-y-2">
                <Label htmlFor="avatar-input">Update your photo</Label>
                <Input id="avatar-input" type="file" accept="image/*" onChange={onFileChange} />
                <p className="text-xs text-muted-foreground">Image must be at least 200x200px.</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Contact Information</h3>
              <p className="text-sm text-muted-foreground">How we can reach you.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...register('phoneNumber')} />
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Location</h3>
              <p className="text-sm text-muted-foreground">Your location details.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" {...register('state')} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip / Postal Code</Label>
                <Input id="zipCode" {...register('zipCode')} />
                {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Crop your new profile picture</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    circularCrop
                    minWidth={200}
                    minHeight={200}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCropImage}>Crop & Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
