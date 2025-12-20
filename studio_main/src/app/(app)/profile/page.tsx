
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trophy, Code, Dumbbell, Palette, Star, Plus, Trash2 } from 'lucide-react';
import { memberScores, pastParticipations as mockParticipations } from '@/lib/data';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Student, Participation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
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
} from "@/components/ui/alert-dialog"

import { EditProfileForm, editProfileFormSchema } from '@/components/shared/edit-profile-form';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';


const categoryIcons: { [key: string]: React.ReactNode } = {
  Project: <Code className="h-5 w-5" />,
  Sports: <Dumbbell className="h-5 w-5" />,
  Cultural: <Palette className="h-5 w-5" />,
};

const participationSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  category: z.enum(["Project", "Sports", "Cultural"]),
  result: z.string().min(1, "Result is required"),
});


function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex flex-col items-center">
              <Skeleton className="w-32 h-32 rounded-full mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Skeleton className="h-9 w-48 mx-auto md:mx-0 mb-2" />
              <Skeleton className="h-5 w-full max-w-lg mx-auto md:mx-0" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interests</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Skeletons for other sections can be added here if desired */}
    </div>
  );
}

function ParticipationForm({ setOpen, studentId, eventToEdit }: { setOpen: (open: boolean) => void, studentId: string, eventToEdit?: Participation }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof participationSchema>>({
        resolver: zodResolver(participationSchema),
        defaultValues: {
            title: eventToEdit?.title || "",
            description: eventToEdit?.description || "",
            date: eventToEdit?.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : "",
            category: eventToEdit?.category || "Project",
            result: eventToEdit?.result || "",
        },
    });

    async function onSubmit(values: z.infer<typeof participationSchema>) {
        if (!firestore) return;
        
        try {
            if (eventToEdit) {
                // Update existing event
                const eventDocRef = doc(firestore, 'students', studentId, 'participations', eventToEdit.id);
                await updateDoc(eventDocRef, { ...values, studentId });
                toast({ title: "Success", description: "Event updated successfully." });
            } else {
                // Add new event
                const participationsRef = collection(firestore, 'students', studentId, 'participations');
                await addDoc(participationsRef, { ...values, studentId, createdAt: serverTimestamp() });
                toast({ title: "Success", description: "New event added." });
            }
            setOpen(false);
        } catch (error) {
            console.error("Error saving participation: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save event." });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g. Web Project" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Project">Project</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Cultural">Cultural</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="result" render={({ field }) => (
                    <FormItem><FormLabel>Result / Position</FormLabel><FormControl><Input placeholder="e.g. Winner, Runner-up, Participant" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="A brief description of the event" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


export default function ProfilePage() {
  const { user, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isParticipationDialogOpen, setParticipationDialogOpen] = useState(false);
  const [editingParticipation, setEditingParticipation] = useState<Participation | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participationDisplayLimit, setParticipationDisplayLimit] = useState(5);
  const [scoresDisplayLimit, setScoresDisplayLimit] = useState(3);

  const profileForm = useForm<z.infer<typeof editProfileFormSchema>>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      bio: '',
      interestIds: [],
      skillIds: [],
      profilePictureUrl: '',
    },
  });

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'students', user.uid);
  }, [firestore, user]);

  const participationsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'students', user.uid, 'participations');
  }, [firestore, user]);

  const { data: studentData, isLoading: isProfileLoading } = useDoc<Student>(studentDocRef);
  const { data: pastParticipations, isLoading: isParticipationsLoading } = useCollection<Participation>(participationsCollectionRef);

  // Memoize score calculations to avoid recalculating
  const { totalScore, averageScore } = useMemo(() => {
    const total = memberScores.reduce((acc, score) => acc + score.score, 0);
    const avg = memberScores.length > 0 ? total / memberScores.length : 0;
    return { totalScore: total, averageScore: avg };
  }, []);

  // Pagination for participations
  const displayedParticipations = useMemo(() => {
    // Use mock data as fallback if Firestore returns nothing
    const participationsToUse = (pastParticipations && pastParticipations.length > 0) 
      ? pastParticipations 
      : mockParticipations.map((p, index) => ({ 
          ...p, 
          id: `mock-participation-${index}`,
          studentId: user?.uid || ''
        }));
    
    return participationsToUse.slice(0, participationDisplayLimit);
  }, [pastParticipations, participationDisplayLimit, user]);

  const hasMoreParticipations = useMemo(() => {
    const participationsToUse = (pastParticipations && pastParticipations.length > 0) 
      ? pastParticipations 
      : mockParticipations;
    return participationsToUse.length > participationDisplayLimit;
  }, [pastParticipations, participationDisplayLimit]);

  // Pagination for scores
  const displayedScores = useMemo(() => {
    return memberScores.slice(0, scoresDisplayLimit);
  }, [scoresDisplayLimit]);

  const hasMoreScores = memberScores.length > scoresDisplayLimit;

  const isLoading = isAuthUserLoading || isProfileLoading || isParticipationsLoading;

   useEffect(() => {
    if (studentData) {
      profileForm.reset({
        firstName: studentData.firstName || '',
        lastName: studentData.lastName || '',
        bio: studentData.bio || '',
        interestIds: studentData.interestIds || [],
        skillIds: studentData.skillIds || [],
        profilePictureUrl: studentData.profilePictureUrl || user?.photoURL || '',
      });
    }
  }, [studentData, user, profileForm, isEditDialogOpen]);


  async function onProfileSubmit(values: z.infer<typeof editProfileFormSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to edit your profile.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const photoURL = values.profilePictureUrl || studentData?.profilePictureUrl || user.photoURL || '';
      const newFirstName = values.firstName || user.displayName?.split(' ')[0] || '';
      const newLastName = values.lastName || user.displayName?.split(' ').slice(1).join(' ') || '';
      const displayName = [newFirstName, newLastName].filter(Boolean).join(' ');

      // Update both Auth and Firestore
      if (displayName !== user.displayName || photoURL !== user.photoURL) {
        await updateAuthProfile(user, { displayName, photoURL });
      }

      const studentDocRef = doc(firestore, 'students', user.uid);
      const updatedData = {
          id: user.uid,
          email: user.email!,
          firstName: newFirstName,
          lastName: newLastName,
          bio: values.bio,
          profilePictureUrl: photoURL,
          interestIds: values.interestIds,
          skillIds: values.skillIds,
      };

      await setDoc(studentDocRef, updatedData, { merge: true });

      toast({ title: 'Profile Updated!', description: 'Your changes have been saved.' });
      setEditDialogOpen(false);

    } catch (error: any) {
      console.error('Error during profile update process:', error);
      toast({ variant: 'destructive', title: 'Something went wrong', description: error.message || 'Could not update your profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAddParticipation = () => {
    setEditingParticipation(undefined);
    setParticipationDialogOpen(true);
  }

  const handleEditParticipation = (event: Participation) => {
    setEditingParticipation(event);
    setParticipationDialogOpen(true);
  }

  const handleDeleteParticipation = async (eventId: string) => {
      if (!firestore || !user) return;
      const eventDocRef = doc(firestore, 'students', user.uid, 'participations', eventId);
      try {
        await deleteDoc(eventDocRef);
        toast({ title: "Event Deleted", description: "The event has been removed from your profile." });
      } catch (error) {
        console.error("Error deleting participation: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete the event." });
      }
  }


  if (isLoading) {
    return <ProfileSkeleton />;
  }
  
  const userFullName = [studentData?.firstName, studentData?.lastName].filter(Boolean).join(' ') || user?.displayName || user?.email;
  const userAvatarUrl = studentData?.profilePictureUrl || user?.photoURL;
  const userBio = studentData?.bio || "This user hasn't written a bio yet.";

  const userInterests = studentData?.interestIds || [];
  const userSkills = studentData?.skillIds || [];

  return (
    <div className="space-y-6">
       <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4 border-4 border-primary/20">
                  <AvatarImage
                    src={userAvatarUrl || undefined}
                    alt={userFullName || ''}
                    data-ai-hint="person"
                  />
                  <AvatarFallback className="text-4xl">
                    {(userFullName || '?').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <DialogTrigger asChild>
                  <Button>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{userFullName}</h1>
                <p className="text-muted-foreground mt-2">{userBio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interests</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {userInterests.length > 0 ? userInterests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="default"
                          className="bg-accent hover:bg-accent/80"
                        >
                          {interest}
                        </Badge>
                      )) : <p className="text-sm text-muted-foreground">No interests added.</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {userSkills.length > 0 ? userSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      )) : <p className="text-sm text-muted-foreground">No skills added.</p>}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
         <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                <Form {...profileForm}>
                    <form id="edit-profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 pr-1">
                        <EditProfileForm />
                    </form>
                </Form>
            </div>
            <DialogFooter className="flex-shrink-0 pt-4 border-t -mx-6 px-6 pb-6">
                <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Participated Events</CardTitle>
            <Dialog open={isParticipationDialogOpen} onOpenChange={setParticipationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddParticipation}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{editingParticipation ? "Edit Event" : "Add New Event"}</DialogTitle>
                      <DialogDescription>Fill in the details about an event you participated in.</DialogDescription>
                  </DialogHeader>
                  <ParticipationForm setOpen={setParticipationDialogOpen} studentId={user!.uid} eventToEdit={editingParticipation} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="grid gap-4">
            {displayedParticipations.map((item) => (
              <div key={item.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                 <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-lg text-secondary-foreground">
                      {categoryIcons[item.category] || <Trophy className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.result === "Winner" ? "default" : "secondary"}>{item.result}</Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditParticipation(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event from your profile.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteParticipation(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
              </div>
            ))}
            {hasMoreParticipations && (
              <Button 
                onClick={() => setParticipationDisplayLimit(prev => prev + 5)} 
                variant="outline" 
                className="w-full mt-2"
                size="sm"
              >
                Load More Events
              </Button>
            )}
            {displayedParticipations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">You haven't added any participated events yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
                <CardTitle>Team Member Scores</CardTitle>
                {memberScores.length > 0 && (
                  <div className="flex items-center gap-2 text-lg">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
                    <span className="font-bold">{averageScore.toFixed(1)} / 10</span>
                  </div>
                )}
              </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            {displayedScores.map((score) => {
              // This part will need to be updated to fetch student data from Firestore
              const scorerName = `Student ${score.studentId.slice(-4)}`;
              const scorerAvatar = `https://picsum.photos/seed/${score.studentId}/100/100`;
              return (
                <div key={score.id} className="flex items-start gap-4">
                   <Avatar className="w-12 h-12 border">
                      <AvatarImage
                        src={scorerAvatar}
                        alt={scorerName}
                        data-ai-hint="person"
                      />
                      <AvatarFallback>
                        {scorerName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{scorerName}</h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold text-sm text-foreground">{score.score} / 10</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic mt-1">"{score.comment}"</p>
                  </div>
                </div>
              );
            })}
            {hasMoreScores && (
              <Button 
                onClick={() => setScoresDisplayLimit(prev => prev + 3)} 
                variant="outline" 
                className="w-full mt-2"
                size="sm"
              >
                Show More Scores
              </Button>
            )}
             {memberScores.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No team members have scored you yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
