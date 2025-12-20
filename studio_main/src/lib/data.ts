
import type { Student, Team, Connection, Message, Announcement, Participation, MemberScore, Interest, Skill } from './types';
import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map(PlaceHolderImages.map((img) => [img.id, img.imageUrl]));

// Set the current user
export const currentUser = {
  id: 'student-1',
  name: 'Md Irfan Khan',
  avatarUrl: imageMap.get('student-1') || 'https://picsum.photos/seed/s1/100/100',
  interests: ['Learning', 'Singing', 'Cricket', 'Music'],
  skills: ['HTML', 'SQL', 'Power BI', 'DAX Query'],
  bio: 'One which believes nothing is like failure; either we succeed or learn.',
};

// Mock student data for faster initial display
export const students: (Student & { bio: string })[] = [
  {
    id: 'student-1',
    firstName: 'Aarav',
    lastName: 'Patel',
    email: 'aarav.patel@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/aarav/100/100',
    bio: 'Passionate about web development and AI. Coffee enthusiast.',
    interestIds: ['Web Development', 'Machine Learning', 'Reading'],
    skillIds: ['React', 'Node.js', 'Python'],
  },
  {
    id: 'student-2',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/priya/100/100',
    bio: 'Data scientist exploring big data analytics and visualization.',
    interestIds: ['Data Science', 'Reading', 'Gaming'],
    skillIds: ['Python', 'SQL', 'Power BI'],
  },
  {
    id: 'student-3',
    firstName: 'Rohan',
    lastName: 'Kumar',
    email: 'rohan.kumar@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/rohan/100/100',
    bio: 'Mobile app developer with a love for UI/UX design.',
    interestIds: ['Mobile Development', 'Web Development', 'Gaming'],
    skillIds: ['React', 'JavaScript', 'Figma'],
  },
  {
    id: 'student-4',
    firstName: 'Neha',
    lastName: 'Singh',
    email: 'neha.singh@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/neha/100/100',
    bio: 'Cricket enthusiast and aspiring sports analyst.',
    interestIds: ['Cricket', 'Music', 'Singing'],
    skillIds: ['SQL', 'Power BI', 'HTML'],
  },
  {
    id: 'student-5',
    firstName: 'Arjun',
    lastName: 'Verma',
    email: 'arjun.verma@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/arjun/100/100',
    bio: 'AI researcher focused on natural language processing.',
    interestIds: ['Machine Learning', 'Gaming', 'Reading'],
    skillIds: ['Python', 'TensorFlow', 'Node.js'],
  },
  {
    id: 'student-6',
    firstName: 'Divya',
    lastName: 'Iyer',
    email: 'divya.iyer@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/divya/100/100',
    bio: 'Full-stack developer passionate about blockchain technology.',
    interestIds: ['Web Development', 'Mobile Development', 'Music'],
    skillIds: ['React', 'Node.js', 'JavaScript'],
  },
  {
    id: 'student-7',
    firstName: 'Akshay',
    lastName: 'Gupta',
    email: 'akshay.gupta@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/akshay/100/100',
    bio: 'Backend engineer with expertise in database optimization.',
    interestIds: ['Data Science', 'Reading', 'Cricket'],
    skillIds: ['Python', 'SQL', 'Node.js'],
  },
  {
    id: 'student-8',
    firstName: 'Shreya',
    lastName: 'Menon',
    email: 'shreya.menon@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/shreya/100/100',
    bio: 'UX designer and creative thinker working on user-centered solutions.',
    interestIds: ['Web Development', 'Dancing', 'Music'],
    skillIds: ['Figma', 'HTML', 'CSS'],
  },
  {
    id: 'student-9',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/rajesh/100/100',
    bio: 'DevOps engineer passionate about cloud infrastructure and automation.',
    interestIds: ['Web Development', 'Reading', 'Gaming'],
    skillIds: ['Node.js', 'Docker', 'AWS'],
  },
  {
    id: 'student-10',
    firstName: 'Isha',
    lastName: 'Patel',
    email: 'isha.patel@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/isha/100/100',
    bio: 'Mobile developer specializing in React Native and iOS development.',
    interestIds: ['Mobile Development', 'Machine Learning', 'Dancing'],
    skillIds: ['React', 'JavaScript', 'Swift'],
  },
  {
    id: 'student-11',
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/vikram/100/100',
    bio: 'Cybersecurity specialist interested in ethical hacking and network security.',
    interestIds: ['Data Science', 'Gaming', 'Music'],
    skillIds: ['Python', 'HTML', 'JavaScript'],
  },
  {
    id: 'student-12',
    firstName: 'Ananya',
    lastName: 'Desai',
    email: 'ananya.desai@university.edu',
    profilePictureUrl: 'https://picsum.photos/seed/ananya/100/100',
    bio: 'Product manager and tech enthusiast exploring startup ecosystems.',
    interestIds: ['Web Development', 'Cricket', 'Singing'],
    skillIds: ['Figma', 'CSS', 'Power BI'],
  },
];


export const connections: {
    id: string;
    name: string;
    avatarUrl: string;
    lastMessage: string;
    lastMessageTimestamp: string;
}[] = [];


export const messages: Record<string, Message[]> = {};

// Mock team data for faster initial display
export const teams: Team[] = [
  {
    id: 'team-1',
    name: 'AI Innovators',
    description: 'Building next-generation AI solutions and machine learning applications.',
    members: ['student-1', 'student-5', 'student-11'],
    createdAt: new Date('2024-08-15') as any,
    createdBy: 'student-1',
  },
  {
    id: 'team-2',
    name: 'Web Warriors',
    description: 'Full-stack web development team focused on modern web technologies.',
    members: ['student-2', 'student-3', 'student-6'],
    createdAt: new Date('2024-08-10') as any,
    createdBy: 'student-6',
  },
  {
    id: 'team-3',
    name: 'Mobile Masters',
    description: 'Cross-platform mobile app development and iOS/Android expertise.',
    members: ['student-4', 'student-10', 'student-7'],
    createdAt: new Date('2024-07-20') as any,
    createdBy: 'student-10',
  },
  {
    id: 'team-4',
    name: 'Data Dynasty',
    description: 'Data science and analytics team exploring big data solutions.',
    members: ['student-2', 'student-9', 'student-12'],
    createdAt: new Date('2024-09-01') as any,
    createdBy: 'student-2',
  },
  {
    id: 'team-5',
    name: 'Design Dream Team',
    description: 'UI/UX design and creative solutions for web and mobile platforms.',
    members: ['student-8', 'student-12', 'student-3'],
    createdAt: new Date('2024-08-25') as any,
    createdBy: 'student-8',
  },
  {
    id: 'team-6',
    name: 'Cloud Crusaders',
    description: 'Cloud infrastructure, DevOps, and deployment automation experts.',
    members: ['student-9', 'student-6', 'student-11'],
    createdAt: new Date('2024-07-30') as any,
    createdBy: 'student-9',
  },
];

export const announcements: Announcement[] = [
  {
    id: 1,
    title: 'Hackathon 2024 Kick-off!',
    content: 'Join us for the annual university hackathon. This year\'s theme is "AI for Social Good". Exciting prizes and learning opportunities await! Registration is now open.',
    date: '2024-08-01',
    category: 'Projects',
    isNew: true,
    branch: 'CSE',
    year: 'All',
  },
  {
    id: 2,
    title: 'Inter-Departmental Cricket Tournament',
    content: 'The much-awaited cricket tournament is back! Form your teams and compete for the championship trophy. All departments are welcome.',
    date: '2024-07-28',
    category: 'Sports',
    isNew: true,
    branch: 'All',
    year: 'All',
  },
  {
    id: 3,
    title: 'Guest Lecture on Bridge Design (3rd Year)',
    content: 'A guest lecture on modern bridge design and construction techniques will be held for all 3rd Year Civil Engineering students.',
    date: '2024-08-05',
    category: 'Skills',
    isNew: true,
    branch: 'CV',
    year: 3,
  },
  {
    id: 4,
    title: 'Annual Cultural Fest "Sanskriti"',
    content: 'Get ready to showcase your talents in music, dance, and drama. Auditions for Sanskriti 2024 will be held next week.',
    date: '2024-07-25',
    category: 'Cultural',
    isNew: false,
    branch: 'All',
    year: 'All',
  },
  {
    id: 5,
    title: 'Workshop on UI/UX Design with Figma (2nd Years)',
    content: 'Learn the fundamentals of UI/UX design and create stunning prototypes with Figma in this hands-on workshop led by industry experts. Open to all 2nd year students.',
    date: '2024-07-20',
    category: 'Skills',
    isNew: false,
    branch: 'CSE',
    year: 2,
  },
  {
    id: 6,
    title: 'Mechanical Engineering Job Fair (Final Years)',
    content: 'Top companies are coming to campus to recruit ME graduates. Don\'t miss this opportunity.',
    date: '2024-07-18',
    category: 'Projects',
    isNew: false,
    branch: 'ME',
    year: 4,
  },
  {
    id: 7,
    title: 'Seminar on VLSI Design (3rd & 4th Year)',
    content: 'A seminar for ECE students on the latest trends in VLSI design. Open to 3rd and 4th year students.',
    date: '2024-07-15',
    category: 'Skills',
    isNew: false,
    branch: 'ECE',
    year: 'All', // This applies to multiple years, so 'All' is a reasonable choice if we don't support multi-select for year
  },
  {
    id: 8,
    title: 'Freshers Induction Program',
    content: 'Welcome to the university! Join the induction program to get acquainted with the campus and faculty.',
    date: '2024-08-10',
    category: 'Events',
    isNew: true,
    branch: 'EEE',
    year: 1,
  },
];

export const pastParticipations: Omit<Participation, 'id' | 'studentId'>[] = [
  {
    title: 'National Hackathon 2024',
    description: 'Developed an AI-powered chatbot for customer support using React and Node.js',
    date: '2024-09-15',
    category: 'Project',
    result: 'Runner-up',
  },
  {
    title: 'Cricket Tournament Finals',
    description: 'Played as opening batsman in the final match against CSE department',
    date: '2024-08-28',
    category: 'Sports',
    result: 'Finalist',
  },
  {
    title: 'Web Development Workshop',
    description: 'Completed advanced React and Next.js training with 95% score',
    date: '2024-08-10',
    category: 'Project',
    result: 'Participant',
  },
  {
    title: 'University Dance Competition',
    description: 'Participated in group dance performance showcasing classical and contemporary styles',
    date: '2024-07-25',
    category: 'Cultural',
    result: 'Participant',
  },
  {
    title: 'Machine Learning Bootcamp',
    description: 'Built predictive models using TensorFlow and scikit-learn',
    date: '2024-07-15',
    category: 'Project',
    result: 'Participant',
  },
];

export const memberScores: MemberScore[] = [
  {
    id: 'score-1',
    studentId: 'student-2',
    score: 8,
    comment: 'A fantastic team player, always brings great energy and creative ideas.'
  },
  {
    id: 'score-2',
    studentId: 'student-3',
    score: 9,
    comment: 'Incredibly reliable and skilled. A true asset to any project.'
  },
  {
    id: 'score-3',
    studentId: 'student-5',
    score: 8.5,
    comment: 'Excellent problem solver with strong technical expertise in multiple areas.'
  },
  {
    id: 'score-4',
    studentId: 'student-4',
    score: 7,
    comment: 'Great at executing tasks and always willing to help out.'
  },
  {
    id: 'score-5',
    studentId: 'student-6',
    score: 9,
    comment: 'Outstanding communication skills and leadership qualities. A natural team leader.'
  },
  {
    id: 'score-6',
    studentId: 'student-10',
    score: 8.5,
    comment: 'Very dedicated and produces high-quality work consistently. Great to work with.'
  }
];

export const ALL_INTERESTS: Interest[] = [
  { id: 'interest-1', name: 'Web Development' },
  { id: 'interest-2', name: 'Machine Learning' },
  { id: 'interest-3', name: 'Mobile Development' },
  { id: 'interest-4', name: 'Data Science' },
  { id: 'interest-5', name: 'Cricket' },
  { id: 'interest-6', name: 'Music' },
  { id: 'interest-7', name: 'Singing' },
  { id: 'interest-8', name: 'Dancing' },
  { id: 'interest-9', name: 'Gaming' },
  { id: 'interest-10', name: 'Reading' },
];

export const ALL_SKILLS: Skill[] = [
  { id: 'skill-1', name: 'React' },
  { id: 'skill-2', name: 'Node.js' },
  { id: 'skill-3', name: 'Python' },
  { id: 'skill-4', name: 'TensorFlow' },
  { id: 'skill-5', name: 'SQL' },
  { id: 'skill-6', name: 'Power BI' },
  { id: 'skill-7', name: 'HTML' },
  { id: 'skill-8', name: 'CSS' },
  { id: 'skill-9', name: 'JavaScript' },
  { id: 'skill-10', name: 'Figma' },
];
