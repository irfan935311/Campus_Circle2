
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, or, getDocs, and } from 'firebase/firestore';
import type { Student, Connection, ConnectionRequest } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Search, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { students as mockStudents } from '@/lib/data';

function StudentCard({ student, currentUserId, existingConnections, sentRequests }: { student: Student, currentUserId: string, existingConnections: Connection[], sentRequests: ConnectionRequest[] }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fullName = `${student.firstName} ${student.lastName}`;

  const connectionStatus = useMemo(() => {
    if (existingConnections.some(conn => 
      (conn.studentId1 === currentUserId && conn.studentId2 === student.id) ||
      (conn.studentId2 === currentUserId && conn.studentId1 === student.id)
    )) {
      return 'connected';
    }
    if (sentRequests.some(req => req.receiverId === student.id)) {
      return 'pending';
    }
    return 'none';
  }, [existingConnections, sentRequests, currentUserId, student.id]);

  const handleConnect = async () => {
    if (!firestore || !currentUserId || connectionStatus !== 'none') return;

    try {
      const requestsRef = collection(firestore, 'connectionRequests');
      
      // Check if a request already exists
      const q = query(requestsRef, 
        where('senderId', '==', currentUserId),
        where('receiverId', '==', student.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({ title: "Request already sent!" });
        return;
      }
      
      await addDoc(requestsRef, {
        senderId: currentUserId,
        receiverId: student.id,
        status: 'pending',
        requestDate: serverTimestamp(),
      });
      toast({
        title: 'Request Sent!',
        description: `Your connection request has been sent to ${fullName}.`,
      });
    } catch (error) {
      console.error("Error creating connection request:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Could not send request. Please try again.',
      });
    }
  };

  const getButtonContent = () => {
    switch(connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'pending':
        return <><Clock className="mr-2 h-4 w-4" /> Request Sent</>;
      default:
        return <><UserPlus className="mr-2 h-4 w-4" /> Connect</>;
    }
  }

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg h-full flex flex-col">
      <CardContent className="p-4 flex flex-col items-center text-center flex-grow">
        <Avatar className="w-24 h-24 mb-4 border-4 border-muted">
          <AvatarImage
            src={student.profilePictureUrl}
            alt={fullName}
            data-ai-hint="person"
          />
          <AvatarFallback>{(student.firstName || '').charAt(0)}{(student.lastName || '').charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{fullName}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 h-10">
          {student.bio || 'This student has not written a bio yet.'}
        </p>

        <div className="flex-grow w-full mt-4">
          <div className="mb-3">
             <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</h4>
             <div className="flex flex-wrap gap-1 justify-center h-12 overflow-hidden">
              {(student.interestIds && student.interestIds.length > 0) ? student.interestIds.slice(0, 3).map((interest) => (
                <Badge key={interest} variant="outline">{interest}</Badge>
              )) : <span className="text-xs text-muted-foreground">No interests listed.</span>}
            </div>
          </div>
        </div>

        <Button className="mt-auto w-full" size="sm" onClick={handleConnect} disabled={connectionStatus !== 'none'}>
          {getButtonContent()}
        </Button>
      </CardContent>
    </Card>
  );
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [displayLimit, setDisplayLimit] = useState(8); // Start with 8 items
  const { user } = useUser();
  const firestore = useFirestore();

  const studentsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Query for students who are not the current user
    return query(collection(firestore, 'students'), where('id', '!=', user.uid));
  }, [firestore, user]);

  const { data: allOtherStudents, isLoading: isLoadingStudents } = useCollection<Student>(studentsCollection);

  const connectionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'connections'), or(
      where('studentId1', '==', user.uid),
      where('studentId2', '==', user.uid)
    ));
  }, [firestore, user]);
  // Only load when needed
  const { data: userConnections, isLoading: isLoadingConnections } = useCollection<Connection>(connectionsQuery);

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'connectionRequests'), 
        or(
            where('senderId', '==', user.uid),
            where('receiverId', '==', user.uid)
        )
    );
  }, [firestore, user]);
  // Lazy load requests - only fetch when user hovers or clicks
  const { data: allRequests, isLoading: isLoadingRequests } = useCollection<ConnectionRequest>(requestsQuery);

  const sentRequests = useMemo(() => {
    if (!allRequests || !user) return [];
    return allRequests.filter(req => req.senderId === user.uid && req.status === 'pending');
  }, [allRequests, user]);
  
  const otherStudents = useMemo(() => {
    if (!user) return [];
    // Use mock data as fallback or if Firestore returns nothing
    const studentsToUse = (allOtherStudents && allOtherStudents.length > 0) ? allOtherStudents : mockStudents;
    
    // Simple filtering - don't check requests if not loaded
    return studentsToUse.filter((s) => s.id !== user.uid);
  }, [allOtherStudents, user]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return otherStudents;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    return otherStudents.filter((student) => {
        const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(lowercasedTerm);
        const interestMatch = (student.interestIds || []).some(interest => interest.toLowerCase().includes(lowercasedTerm));
        return nameMatch || interestMatch;
    });
  }, [searchTerm, otherStudents]);

  const displayedStudents = useMemo(() => {
    return filteredStudents.slice(0, displayLimit);
  }, [filteredStudents, displayLimit]);

  const hasMore = filteredStudents.length > displayLimit;

  const isLoading = isLoadingStudents || isLoadingConnections || isLoadingRequests;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 8);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discover Students</h1>
        <p className="text-muted-foreground">
          Find and connect with students who share your interests.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search by name or interest..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          {searchTerm ? `Search Results (${filteredStudents.length})` : 'Suggested Students'}
        </h2>
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-[380px]">
                <CardContent className="p-4 flex flex-col items-center text-center h-full">
                  <Skeleton className="w-24 h-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                   <Skeleton className="h-4 w-full mb-4" />
                   <div className="flex-grow" />
                   <Skeleton className="h-9 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayedStudents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedStudents.map((student) => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                  currentUserId={user!.uid}
                  existingConnections={userConnections || []}
                  sentRequests={sentRequests || []}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={handleLoadMore} variant="outline" size="lg">
                  Load More Students
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No students found matching your search.</p>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-[380px]">
            <CardContent className="p-4 flex flex-col items-center text-center h-full">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex-grow" />
                <Skeleton className="h-9 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>}>
      <DiscoverContent />
    </Suspense>
  );
}
