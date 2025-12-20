import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Code,
  Dumbbell,
  Mic,
  Brush,
  Gamepad2,
  Globe,
  Bot,
  Cpu,
  Sun,
  Home,
  Users,
  Footprints,
  Music,
  Clapperboard,
  CodeXml,
  Laptop,
  MessageSquare,
  Waves,
  Car,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: 'Projects',
    icon: <Code className="w-6 h-6" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    subsections: [
      {
        title: 'Web Based Project',
        icon: <Globe className="w-5 h-5 text-sky-500" />,
      },
      {
        title: 'IoT based Project',
        icon: <Cpu className="w-5 h-5 text-teal-500" />,
      },
      {
        title: 'AI/ML Based Project',
        icon: <Bot className="w-5 h-5 text-indigo-500" />,
      },
    ],
  },
  {
    title: 'Sports',
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    subsections: [
      {
        title: 'Outdoor',
        icon: <Sun className="w-5 h-5 text-yellow-500" />,
        items: ['Cricket', 'Volleyball', 'Football'],
      },
      {
        title: 'Indoor',
        icon: <Home className="w-5 h-5 text-purple-500" />,
        items: ['BGMI', 'Free Fire', 'Chess', 'Carom'],
      },
    ],
  },
  {
    title: 'Cultural',
    icon: <Mic className="w-6 h-6" />,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    subsections: [
      { title: 'Dance', icon: <Footprints className="w-5 h-5 text-rose-500" /> },
      { title: 'Song', icon: <Music className="w-5 h-5 text-pink-500" /> },
      { title: 'Drama', icon: <Clapperboard className="w-5 h-5 text-fuchsia-500" /> },
    ],
  },
  {
    title: 'Skills',
    icon: <Brush className="w-6 h-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    subsections: [
      {
        title: 'Web',
        icon: <CodeXml className="w-5 h-5 text-amber-500" />,
        items: ['HTML', 'CSS', 'JavaScript'],
      },
      {
        title: 'Programming',
        icon: <Laptop className="w-5 h-5 text-lime-500" />,
        items: ['C', 'C++', 'Python', 'Java'],
      },
    ],
  },
  {
    title: 'Others',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    subsections: [
      { title: 'Communication', icon: <MessageSquare className="w-5 h-5 text-violet-500" /> },
      { title: 'Swimming', icon: <Waves className="w-5 h-5 text-cyan-500" /> },
      { title: 'Driving', icon: <Car className="w-5 h-5 text-gray-500" /> },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Explore opportunities and connect with peers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="flex flex-col hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${section.bgColor} ${section.color}`}
                >
                  {section.icon}
                </div>
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <Accordion type="single" collapsible className="w-full">
                {section.subsections.map((subsection) => (
                  <AccordionItem
                    key={subsection.title}
                    value={`item-${subsection.title}`}
                  >
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        {subsection.icon}
                        <span className="font-medium">{subsection.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {subsection.items ? (
                        <div className="pl-8 space-y-2">
                          {subsection.items.map((item) => (
                            <Link
                              key={item}
                              href="#"
                              className="block text-muted-foreground hover:text-foreground"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      ) : (
                         <div className="pl-8 text-muted-foreground">
                            Explore {subsection.title.toLowerCase()} opportunities.
                         </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
