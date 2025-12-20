
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, orderBy, or, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Connection, Message, Student, ConnectionRequest } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SendHorizonal, Search, Check, X, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';


// Represents the data needed for the UI, combining Connection and Student info
interface ConnectionWithStudent {
  connectionId: string;
  otherStudent: Student;
}

interface RequestWithStudent {
    request: ConnectionRequest;
    sender: Student;
}

export default function ConnectionsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedConnection, setSelectedConnection] = useState<ConnectionWithStudent | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // 1. Fetch all students to easily get their details
  const studentsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsCollection);
  const studentMap = useMemo(() => new Map(students?.map((s) => [s.id, s]) || []), [students]);

  // 2. Fetch all connections for the current user in a single query
  const connectionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'connections'),
      or(
        where('studentId1', '==', user.uid),
        where('studentId2', '==', user.uid)
      )
    );
  }, [firestore, user]);
  const { data: connections, isLoading: connectionsLoading } = useCollection<Connection>(connectionsQuery);

  // 3. Fetch incoming connection requests
  const requestsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(
          collection(firestore, 'connectionRequests'),
          where('receiverId', '==', user.uid),
          where('status', '==', 'pending')
      );
  }, [firestore, user]);
  const { data: connectionRequests, isLoading: requestsLoading } = useCollection<ConnectionRequest>(requestsQuery);

  // 4. Combine connections and map to UI-friendly format
  const userConnections = useMemo((): ConnectionWithStudent[] => {
    if (!connections || !user || studentMap.size === 0) return [];

    return connections.map(conn => {
      const otherStudentId = conn.studentId1 === user.uid ? conn.studentId2 : conn.studentId1;
      const otherStudent = studentMap.get(otherStudentId);
      return {
        connectionId: conn.id,
        otherStudent: otherStudent!,
      };
    }).filter(c => c.otherStudent); // Filter out cases where student data might not be loaded yet
  }, [connections, user, studentMap]);

  const incomingRequests = useMemo((): RequestWithStudent[] => {
      if (!connectionRequests || studentMap.size === 0) return [];
      return connectionRequests.map(req => ({
          request: req,
          sender: studentMap.get(req.senderId)!
      })).filter(r => r.sender);
  }, [connectionRequests, studentMap]);

  // 5. Fetch messages for the selected connection
  const messagesCollection = useMemoFirebase(() => {
    if (!firestore || !selectedConnection) return null;
    return query(
      collection(firestore, 'connections', selectedConnection.connectionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, selectedConnection]);

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesCollection);

  // Auto-select the first connection
  useEffect(() => {
    if (!selectedConnection && userConnections.length > 0) {
      setSelectedConnection(userConnections[0]);
    }
  }, [userConnections, selectedConnection]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedConnection || !firestore) return;

    const messagesCol = collection(firestore, 'connections', selectedConnection.connectionId, 'messages');
    try {
      await addDoc(messagesCol, {
        senderId: user.uid,
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
    }
  };

  const handleRequestAction = async (request: ConnectionRequest, action: 'accept' | 'reject') => {
      if (!firestore || !user) return;
      
      const requestDocRef = doc(firestore, 'connectionRequests', request.id);

      if (action === 'accept') {
          try {
              // Create a new connection
              await addDoc(collection(firestore, 'connections'), {
                  studentId1: request.senderId,
                  studentId2: request.receiverId,
                  connectionDate: serverTimestamp(),
              });
              
              // Delete the request
              await deleteDoc(requestDocRef);

              toast({ title: 'Connection accepted!', description: `You are now connected with ${studentMap.get(request.senderId)?.firstName}.`});
          } catch (error) {
              console.error("Error accepting request: ", error);
              toast({ variant: 'destructive', title: 'Error', description: 'Could not accept the request.' });
          }
      } else { // reject
          try {
              await deleteDoc(requestDocRef);
              toast({ title: 'Request rejected.' });
          } catch (error) {
              console.error("Error rejecting request: ", error);
              toast({ variant: 'destructive', title: 'Error', description: 'Could not reject the request.' });
          }
      }
  };
  
  const isLoading = studentsLoading || connectionsLoading || requestsLoading;

  return (
     <div className="grid h-[calc(100vh-140px)] w-full md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
        <div className="flex-col border-r bg-card hidden md:flex">
             <Tabs defaultValue="connections" className="flex flex-col h-full">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold mb-4">Messages</h1>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="connections">
                            Connections ({userConnections.length})
                        </TabsTrigger>
                        <TabsTrigger value="requests">
                            Requests ({incomingRequests.length})
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="connections" className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full">
                      {isLoading ? (
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : userConnections.length > 0 ? (
                        userConnections.map((conn) => (
                          <div key={conn.connectionId} onClick={() => setSelectedConnection(conn)}>
                            <div
                              className={cn(
                                'flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50',
                                selectedConnection?.connectionId === conn.connectionId && 'bg-muted'
                              )}
                            >
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={conn.otherStudent.profilePictureUrl}
                                  alt={`${conn.otherStudent.firstName} ${conn.otherStudent.lastName}`}
                                  data-ai-hint="person"
                                />
                                <AvatarFallback>{conn.otherStudent.firstName?.charAt(0)}{conn.otherStudent.lastName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="grid gap-0.5 flex-1">
                                <p className="font-semibold">{conn.otherStudent.firstName} {conn.otherStudent.lastName}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{/* Last message can go here */}</p>
                              </div>
                            </div>
                            <Separator />
                          </div>
                        ))
                      ) : (
                          <p className="p-4 text-sm text-muted-foreground">No active connections. Find new students on the Discover page.</p>
                      )}
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="requests" className="flex-grow overflow-hidden">
                   <ScrollArea className="h-full">
                        {isLoading ? (
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : incomingRequests.length > 0 ? (
                            incomingRequests.map(({ request, sender }) => (
                                <div key={request.id}>
                                    <div className="flex items-center gap-4 p-4">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={sender.profilePictureUrl} alt={sender.firstName} data-ai-hint="person" />
                                            <AvatarFallback>{sender.firstName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 grid gap-0.5">
                                            <p className="font-semibold">{sender.firstName} {sender.lastName}</p>
                                            <p className="text-xs text-muted-foreground">Wants to connect with you.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleRequestAction(request, 'accept')}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleRequestAction(request, 'reject')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Separator />
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-muted-foreground">No new connection requests.</p>
                        )}
                   </ScrollArea>
                </TabsContent>
             </Tabs>
        </div>

      <div className="flex-col hidden md:flex bg-background/50">
        {selectedConnection ? (
          <>
            <div className="flex items-center gap-4 p-4 border-b bg-card">
              <Avatar className="h-11 w-11 border">
                 <AvatarImage
                    src={selectedConnection.otherStudent.profilePictureUrl}
                    alt={`${selectedConnection.otherStudent.firstName} ${selectedConnection.otherStudent.lastName}`}
                    data-ai-hint="person"
                  />
                  <AvatarFallback>
                    {selectedConnection.otherStudent.firstName?.charAt(0)}{selectedConnection.otherStudent.lastName?.charAt(0)}
                  </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{selectedConnection.otherStudent.firstName} {selectedConnection.otherStudent.lastName}</h2>
                <p className="text-sm text-muted-foreground line-clamp-1">{selectedConnection.otherStudent.bio || 'Student'}</p>
              </div>
            </div>
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
                          'max-w-xs lg:max-w-md rounded-lg p-3 text-sm shadow-sm',
                          msg.senderId === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card'
                        )}
                      >
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-card">
              <form className="relative" onSubmit={handleSendMessage}>
                <Input placeholder="Type a message..." className="pr-12" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled={!newMessage.trim()}
                >
                  <SendHorizonal className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {isLoading ? <p>Loading...</p> : <p>Select a connection to start chatting</p>}
          </div>
        )}
      </div>

      {/* Mobile view: list only */}
      <div className="md:hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Connections</h1>
        </div>
        <ScrollArea className="h-[calc(100vh-220px)]">
          {isLoading ? (
             <div className="p-4 space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (userConnections.map((conn) => (
            // In a real app, this would link to a dynamic chat page e.g. /connections/[id]
            <div key={conn.connectionId}>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10 border">
                   <AvatarImage
                      src={conn.otherStudent.profilePictureUrl}
                      alt={`${conn.otherStudent.firstName} ${conn.otherStudent.lastName}`}
                      data-ai-hint="person"
                    />
                  <AvatarFallback>{conn.otherStudent.firstName?.charAt(0)}{conn.otherStudent.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5 flex-1">
                  <p className="font-semibold">{conn.otherStudent.firstName} {conn.otherStudent.lastName}</p>
                </div>
              </div>
              <Separator />
            </div>
          )))}
        </ScrollArea>
      </div>
    </div>
  );
}
