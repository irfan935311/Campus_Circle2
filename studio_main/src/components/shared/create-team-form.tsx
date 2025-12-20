
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Team name must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Project description must be at least 5 characters.',
  }),
  members: z.array(z.string()).refine((value) => value.length > 0, {
    message: 'You have to select at least one member.',
  }),
});

type CreateTeamFormProps = {
  setOpen: (open: boolean) => void;
  onTeamCreated?: (teamId: string) => void;
};

export function CreateTeamForm({ setOpen, onTeamCreated }: CreateTeamFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const studentsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);
  const { data: allStudents, isLoading } = useCollection<Student>(studentsCollection);
  
  const otherStudents = allStudents?.filter(s => s.id !== user?.uid);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      members: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a team.',
      });
      return;
    }
    
    const newTeamData = {
      name: values.name,
      description: values.description,
      members: [user.uid, ...values.members],
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'teams'), newTeamData)
      .then((docRef) => {
        toast({
          title: 'Success!',
          description: `Team "${values.name}" has been created.`,
        });
        if (onTeamCreated) {
          onTeamCreated(docRef.id);
        }
        setOpen(false);
        form.reset();
      })
      .catch((error) => {
        console.error('Error creating team:', error);
        
        const permissionError = new FirestorePermissionError({
          path: 'teams',
          operation: 'create',
          requestResourceData: newTeamData,
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: 'Could not create the team. Check permissions and try again.',
        });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Data Dynamos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Power BI Dashboard for Sales" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="members"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Select Members</FormLabel>
                <FormDescription>
                  Select the students you want to add to your team. You are automatically included.
                </FormDescription>
              </div>
              <ScrollArea className="h-40 w-full rounded-md border p-4">
                 {isLoading ? <p>Loading students...</p> : (otherStudents || []).map((student) => (
                    <FormItem
                      key={student.id}
                      className="flex flex-row items-start space-x-3 space-y-0 mb-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(student.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), student.id])
                              : field.onChange(
                                  (field.value || []).filter(
                                    (value) => value !== student.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {student.firstName} {student.lastName}
                      </FormLabel>
                    </FormItem>
                 ))}
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
