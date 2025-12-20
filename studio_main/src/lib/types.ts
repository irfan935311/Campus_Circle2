

import type { Timestamp } from 'firebase/firestore';

export type Student = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
  interestIds?: string[];
  skillIds?: string[];
};

export type Team = {
  id:string;
  name: string;
  description: string;
  members: string[]; // array of student ids
  createdAt: Timestamp;
  createdBy: string;
};

// Represents a connection document in Firestore
export type Connection = {
  id: string;
  studentId1: string;
  studentId2: string;
  connectionDate: Timestamp;
};

export type ConnectionRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Timestamp;
}

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | Date | string;
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  isNew: boolean;
  branch: 'All' | 'CSE' | 'CV' | 'ME' | 'ECE' | 'EEE';
  year: 'All' | 1 | 2 | 3 | 4;
};

export type Participation = {
    id: string;
    studentId: string;
    title: string;
    description: string;
    date: string;
    category: 'Project' | 'Sports' | 'Cultural';
    result: string;
};

export type MemberScore = {
  id: string;
  studentId: string;
  score: number;
  comment: string;
};

export type Interest = {
  id: string;
  name: string;
};

export type Skill = {
  id: string;
  name: string;
};
