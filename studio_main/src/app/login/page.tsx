
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
  updateProfile,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const collegeIdPrefix = '3LA';

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);

    if (!isSigningIn) {
        if (!collegeId.toUpperCase().startsWith(collegeIdPrefix)) {
            toast({
                variant: 'destructive',
                title: 'Invalid College ID',
                description: `Your College ID must start with "${collegeIdPrefix}".`,
            });
            setIsAuthLoading(false);
            return;
        }
        if (collegeId.length !== 10) {
            toast({
                variant: 'destructive',
                title: 'Invalid College ID',
                description: 'Your College ID must be exactly 10 characters long.',
            });
            setIsAuthLoading(false);
            return;
        }
    }


    try {
      if (isSigningIn) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(firebaseUser, { displayName: name });

        // Create student document in Firestore
        const [firstName, ...lastName] = name.split(' ');
        const studentDocRef = doc(firestore, 'students', firebaseUser.uid);
        await setDoc(studentDocRef, {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: firstName || '',
            lastName: lastName.join(' ') || '',
            collegeId: collegeId,
            profilePictureUrl: `https://api.onedrive.com/v1.0/shares/u!aHR0cHM6Ly8xZHJ2Lm1zL2kvYy84ZWRhMWNjYmM2YWM3Y2Q4L0lRQ2tDckYzWmJrTlRJSGdejJMMy1RVllBU0d2VUY0NllUdkRUNk9UWEtNZUx2OD9lPWxIS2pvOQ==/root/content`,
        });
      }
      // onAuthStateChanged will handle the redirect
    } catch (error) {
      console.error(error);
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';

      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Incorrect email or password. Please try again.';
          break;
        case 'auth/invalid-credential':
            errorMessage = 'The credentials you provided are invalid. Please check your email and password.';
            break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use. Please sign in.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please use at least 6 characters.';
          break;
        default:
          errorMessage = authError.message;
          break;
      }

      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (isUserLoading || user) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
        <Briefcase className="h-8 w-8 text-primary" />
        <span>Campus Circle</span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isSigningIn ? 'Login' : 'Sign Up'}</CardTitle>
          <CardDescription>
            Enter your email and password below to {isSigningIn ? 'login to' : 'create'} your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuthAction}>
          <CardContent className="grid gap-4">
            {!isSigningIn && (
              <>
               <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAuthLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="collegeId">College ID</Label>
                <Input
                  id="collegeId"
                  type="text"
                  placeholder="e.g. 3LA23CS046"
                  required
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  disabled={isAuthLoading}
                  maxLength={10}
                />
              </div>
              </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isAuthLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isAuthLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isAuthLoading}>
              {isAuthLoading ? 'Loading...' : (isSigningIn ? 'Sign In' : 'Sign Up')}
            </Button>
          </CardFooter>
        </form>
        <div className="p-6 pt-0 text-center text-sm">
          <Button variant="link" onClick={() => setIsSigningIn(!isSigningIn)} disabled={isAuthLoading}>
            {isSigningIn
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
