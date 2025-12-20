
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import type { Team, Message, Student } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SendHorizonal, Search, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateTeamForm } from '@/components/shared/create-team-form';
import { RegisterTeamForm } from '@/components/shared/register-team-form';
import { Skeleton } from '@/components/ui/skeleton';
import { teams as mockTeams } from '@/lib/data';

export default function TeamsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [displayLimit, setDisplayLimit] = useState(5); // Start with 5 teams
  const [searchTerm, setSearchTerm] = useState('');

  const userTeamsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'teams'), where('members', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: userTeams, isLoading: teamsLoading } = useCollection<Team>(userTeamsQuery);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateTeamOpen, setCreateTeamOpen] = useState(false);
  const [isRegisterTeamOpen, setRegisterTeamOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const studentsCollection = useMemoFirebase(() => {
    // Lazy load students - only fetch when a team is selected
    if (selectedTeam && firestore) {
      return collection(firestore, 'students');
    }
    return null;
  }, [firestore, selectedTeam]);
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsCollection);
  const studentMap = useMemo(() => new Map(students?.map((s) => [s.id, s]) || []), [students]);

  const isMember = useMemo(() => {
    if (!selectedTeam || !user) return false;
    return selectedTeam.members.includes(user.uid);
  }, [selectedTeam, user]);
  
  const messagesCollectionQuery = useMemoFirebase(() => {
    if (!firestore || !selectedTeam || !isMember) return null;
    return query(
        collection(firestore, 'teams', selectedTeam.id, 'messages'),
        orderBy('timestamp', 'asc')
    );
  }, [firestore, selectedTeam, isMember]);

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesCollectionQuery);

  // Filter teams based on search term
  const filteredTeams = useMemo(() => {
    // Use mock teams as fallback if Firestore returns nothing
    const teamsToUse = (userTeams && userTeams.length > 0) ? userTeams : mockTeams;
    
    if (!searchTerm.trim()) return teamsToUse;
    
    const lowercased = searchTerm.toLowerCase();
    return teamsToUse.filter(team => 
      team.name.toLowerCase().includes(lowercased) ||
      team.description.toLowerCase().includes(lowercased)
    );
  }, [userTeams, searchTerm]);

  // Show only first N teams
  const displayedTeams = useMemo(() => {
    return filteredTeams.slice(0, displayLimit);
  }, [filteredTeams, displayLimit]);

  const hasMoreTeams = filteredTeams.length > displayLimit;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedTeam || !firestore || !isMember) return;

    const messagesCol = collection(firestore, 'teams', selectedTeam.id, 'messages');
    try {
      await addDoc(messagesCol, {
        senderId: user.uid,
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleTeamCreated = (newTeamId: string) => {
      const newTeam = userTeams?.find(team => team.id === newTeamId) ?? null;
      setSelectedTeam(newTeam);
      setCreateTeamOpen(false);
  };

  useEffect(() => {
    if(!selectedTeam && userTeams && userTeams.length > 0) {
        setSelectedTeam(userTeams[0]);
    }
  }, [userTeams, selectedTeam])

  return (
    <div className="grid h-[calc(100vh-140px)] w-full md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
      <div className="flex-col border-r bg-card hidden md:flex">
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold">Your Teams</h1>
            <div className="flex flex-col items-end gap-2">
              <Dialog open={isCreateTeamOpen} onOpenChange={setCreateTeamOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create your team.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateTeamForm setOpen={setCreateTeamOpen} onTeamCreated={handleTeamCreated} />
                </DialogContent>
              </Dialog>
              <Dialog open={isRegisterTeamOpen} onOpenChange={setRegisterTeamOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={!selectedTeam}>
                    Register Your Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Register Team: {selectedTeam?.name}</DialogTitle>
                    <DialogDescription>
                      Choose a payment method to complete the registration.
                    </DialogDescription>
                  </DialogHeader>
                  <RegisterTeamForm 
                    team={selectedTeam} 
                    setOpen={setRegisterTeamOpen} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search teams..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {teamsLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              {displayedTeams?.map((team) => (
                <div key={team.id} onClick={() => setSelectedTeam(team)}>
                  <div
                    className={cn(
                      'flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50',
                      selectedTeam?.id === team.id && 'bg-muted'
                    )}
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1 flex-1">
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {team.description}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
              {hasMoreTeams && (
                <div className="p-4">
                  <Button 
                    onClick={() => setDisplayLimit(prev => prev + 5)} 
                    variant="outline" 
                    className="w-full"
                    size="sm"
                  >
                    Load More Teams
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>

      <div className="flex-col hidden md:flex">
        {selectedTeam ? (
          <>
            <div className="flex items-center p-4 border-b">
               <Avatar className="h-10 w-10 border mr-4">
                  <AvatarFallback>{selectedTeam.name.charAt(0)}</AvatarFallback>
                </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                <div className="flex -space-x-2 overflow-hidden mt-1">
                  {studentsLoading ? <Skeleton className="h-6 w-20" /> : selectedTeam.members.map((memberId) => {
                    const member = studentMap.get(memberId);
                    if (!member) return null;
                    return (
                      <Avatar
                        key={memberId}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-card"
                      >
                        <AvatarImage
                          src={member.profilePictureUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          data-ai-hint="person"
                        />
                        <AvatarFallback>
                          {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              </div>
            </div>
            {isMember ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                          <Skeleton className="h-10 w-3/5" />
                          <Skeleton className="h-10 w-3/5 ml-auto" />
                          <Skeleton className="h-10 w-2/5" />
                      </div>
                    ) : (messages || []).map((msg: Message) => {
                      const sender = studentMap.get(msg.senderId);
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex items-end gap-2',
                            msg.senderId === user?.uid
                              ? 'justify-end'
                              : 'justify-start'
                          )}
                        >
                          {msg.senderId !== user?.uid && (
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage
                                src={sender?.profilePictureUrl}
                                data-ai-hint="person"
                              />
                              <AvatarFallback>
                                {sender?.firstName?.charAt(0)}{sender?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              'max-w-xs lg:max-w-md rounded-lg p-3 text-sm',
                              msg.senderId === user?.uid
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            {msg.senderId !== user?.uid && <p className="text-xs font-semibold mb-1">{sender?.firstName} {sender?.lastName}</p>}
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      );
                      })}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-card">
                  <form className="relative" onSubmit={handleSendMessage}>
                    <Input placeholder="Type a message..." className="pr-12" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={!isMember} />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      disabled={!newMessage.trim() || !isMember}
                    >
                      <SendHorizonal className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>You are not a member of this team.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {teamsLoading ? <p>Loading teams...</p> : <p>Select a team to start chatting or create a new one.</p>}
          </div>
        )}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold">Teams</h1>
           <div className="flex flex-col gap-2">
            <Dialog open={isCreateTeamOpen} onOpenChange={setCreateTeamOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create your team.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateTeamForm setOpen={setCreateTeamOpen} onTeamCreated={handleTeamCreated}/>
                </DialogContent>
              </Dialog>
              <Dialog open={isRegisterTeamOpen} onOpenChange={setRegisterTeamOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={!selectedTeam}>
                    Register Your Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Register Team: {selectedTeam?.name}</DialogTitle>
                    <DialogDescription>
                      Choose a payment method to complete the registration.
                    </DialogDescription>
                  </DialogHeader>
                  <RegisterTeamForm 
                    team={selectedTeam} 
                    setOpen={setRegisterTeamOpen} 
                  />
                </DialogContent>
              </Dialog>
           </div>
        </div>
        <ScrollArea className="h-[calc(100vh-220px)]">
           {teamsLoading ? (
             <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
           ) : (
            <>
              {displayedTeams?.map((team) => (
                // In a real app, this would link to a dynamic chat page e.g. /teams/[id]
                <div key={team.id} onClick={() => setSelectedTeam(team)}>
                  <div className="flex items-start gap-4 p-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1 flex-1">
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {team.description}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
              {hasMoreTeams && (
                <div className="p-4">
                  <Button 
                    onClick={() => setDisplayLimit(prev => prev + 5)} 
                    variant="outline" 
                    className="w-full"
                    size="sm"
                  >
                    Load More Teams
                  </Button>
                </div>
              )}
            </>
           )}
        </ScrollArea>
      </div>
    </div>
  );
}
