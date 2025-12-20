
'use client';

import * as z from 'zod';
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ALL_INTERESTS, ALL_SKILLS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export const editProfileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(160, "Bio cannot be longer than 160 characters.").optional(),
  profilePictureUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  interestIds: z.array(z.string()).max(3, "You can select a maximum of 3 interests.").optional(),
  skillIds: z.array(z.string()).max(3, "You can select a maximum of 3 skills.").optional(),
});

export function EditProfileForm() {
  const { control } = useFormContext<z.infer<typeof editProfileFormSchema>>();
  const { toast } = useToast();

  return (
    <>
        <div className="flex gap-4">
            <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your first name" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your last name" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio / Headline</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell everyone a little about yourself" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


         <FormField
          control={control}
          name="profilePictureUrl"
          render={({ field }) => (
                <FormItem>
                <FormLabel>Profile Picture URL</FormLabel>
                <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.png"
                      {...field}
                      value={field.value ?? ''}
                    />
                </FormControl>
                <FormDescription>
                    Enter the URL of your new profile picture. Leave blank to keep your current one.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )
         }
        />


        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={control}
            name="interestIds"
            render={({ field }) => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Interests (Max 3)</FormLabel>
                </div>
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                  {ALL_INTERESTS.map((interest) => (
                    <FormItem
                      key={interest.id}
                      className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(interest.name)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked && currentValues.length >= 3) {
                              toast({ variant: 'destructive', title: 'You can only select up to 3 interests.'});
                              return;
                            }
                            return checked
                              ? field.onChange([...currentValues, interest.name])
                              : field.onChange(
                                  currentValues.filter(
                                    (value) => value !== interest.name
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        {interest.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="skillIds"
            render={({ field }) => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Skills (Max 3)</FormLabel>
                </div>
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                  {ALL_SKILLS.map((skill) => (
                    <FormItem
                      key={skill.id}
                      className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(skill.name)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked && currentValues.length >= 3) {
                                toast({ variant: 'destructive', title: 'You can only select up to 3 skills.'});
                                return;
                            }
                            return checked
                              ? field.onChange([...currentValues, skill.name])
                              : field.onChange(
                                  currentValues.filter(
                                    (value) => value !== skill.name
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        {skill.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </>
  );
}
