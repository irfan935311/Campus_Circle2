
'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { announcements } from '@/lib/data';
import type { Announcement } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Circle } from 'lucide-react';

const branches: Announcement['branch'][] = ['CSE', 'CV', 'ME', 'ECE', 'EEE'];
const years: (Announcement['year'] | 'All')[] = ['All', 1, 2, 3, 4];

// Sample data for the calendar
const events = [
  { date: new Date('2025-12-10'), title: 'Project Presentation', category: 'Projects' },
  { date: new Date('2025-12-16'), title: 'Inter-Departmental Cricket', category: 'Sports' },
  { date: new Date('2025-11-20'), title: 'Annual Cultural Fest "Sanskriti"', category: 'Cultural' },
  { date: new Date('2025-11-25'), title: 'Hackathon 2024 Kick-off!', category: 'Projects' },
  { date: new Date('2025-12-01'), title: 'Guest Lecture on Bridge Design', category: 'Skills' },
  { date: new Date('2025-12-26'), title: 'Cultural Event', category: 'Cultural' },
];

const categoryColors: { [key: string]: string } = {
  Projects: 'bg-blue-500',
  Sports: 'bg-green-500',
  Cultural: 'bg-red-500',
  Skills: 'bg-orange-500',
  Events: 'bg-purple-500',
};


function formatYear(year: Announcement['year']) {
  if (year === 'All') return 'All Years';
  if (year === 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  if (year === 4) return '4th Year';
  return year;
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{announcement.title}</CardTitle>
            <CardDescription className="mt-1">
              Posted on {announcement.date}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge>{announcement.category}</Badge>
            {announcement.isNew && <Badge variant="destructive">New</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {announcement.content}
        </p>
      </CardContent>
    </Card>
  );
}

function BranchSection({ branch }: { branch: Announcement['branch'] }) {
  const [selectedYear, setSelectedYear] = useState<Announcement['year'] | 'All'>('All');

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const branchMatch = a.branch === branch;
      const yearMatch = selectedYear === 'All' || a.year === selectedYear || a.year === 'All';
      return branchMatch && yearMatch;
    });
  }, [branch, selectedYear]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {years.map((year) => (
          <Button
            key={year}
            variant={selectedYear === year ? 'secondary' : 'outline'}
            onClick={() => setSelectedYear(year)}
            size="sm"
            className="h-8"
          >
            {formatYear(year)}
          </Button>
        ))}
      </div>
      <Separator />
      {filteredAnnouncements.length > 0 ? (
        <div className="grid gap-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4">
          No announcements for this selection.
        </p>
      )}
    </div>
  );
}


export default function AnnouncementsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const eventDays = useMemo(() => events.map(e => e.date), []);

  const selectedDayEvents = useMemo(() => {
    if (!date) return [];
    return events.filter(
      (event) => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  }, [date]);

  const allBranchAnnouncements = useMemo(() => {
    return announcements.filter((a) => a.branch === 'All');
  }, []);

  const recentAnnouncements = useMemo(() => {
    return announcements.filter((a) => a.isNew);
  }, []);

  const pastAnnouncements = useMemo(() => {
    return announcements.filter((a) => !a.isNew);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news and events.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Announcements Based On Branch</h2>
        <Accordion type="single" collapsible className="w-full">
            {branches.map((branch) => (
                <AccordionItem key={branch} value={branch}>
                    <AccordionTrigger className="text-lg font-medium">
                        {branch}
                    </AccordionTrigger>
                    <AccordionContent>
                      <BranchSection branch={branch} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Event Calendar</h2>
        <Card>
            <CardContent className="p-4 grid md:grid-cols-2 gap-6">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border justify-center"
                    modifiers={{
                        event: eventDays,
                    }}
                    modifiersStyles={{
                        event: {
                            textDecoration: 'underline',
                            textDecorationColor: 'hsl(var(--primary))',
                            textDecorationThickness: '2px',
                            textUnderlineOffset: '0.2rem',
                        }
                    }}
                />
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                        Events on {date ? format(date, 'PPP') : 'N/A'}
                    </h3>
                    <Separator />
                    {selectedDayEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {selectedDayEvents.map((event, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${categoryColors[event.category] || 'bg-gray-400'}`}></div>
                                    <div>
                                        <p className="font-medium">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">{event.category}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm pt-2">No events scheduled for this day.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="all-announcements">
                <AccordionTrigger className="text-xl font-bold tracking-tight">
                    Announcements For All
                </AccordionTrigger>
                <AccordionContent>
                    {allBranchAnnouncements.length > 0 ? (
                        <div className="grid gap-4 pt-4">
                            {allBranchAnnouncements.map((announcement) => (
                                <AnnouncementCard key={announcement.id} announcement={announcement} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm py-4">
                            No general announcements at this time.
                        </p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="recent-announcements">
                <AccordionTrigger className="text-xl font-bold tracking-tight">
                    Recent Announcements
                </AccordionTrigger>
                <AccordionContent>
                    {recentAnnouncements.length > 0 ? (
                        <div className="grid gap-4 pt-4">
                            {recentAnnouncements.map((announcement) => (
                                <AnnouncementCard key={announcement.id} announcement={announcement} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm py-4">
                            No recent announcements at this time.
                        </p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="past-announcements">
            <AccordionTrigger className="text-xl font-bold tracking-tight">
              Past Announcements
            </AccordionTrigger>
            <AccordionContent>
              {pastAnnouncements.length > 0 ? (
                <div className="grid gap-4 pt-4">
                  {pastAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4">
                  No past announcements.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}
