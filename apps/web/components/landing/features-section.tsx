import { 
  BookOpen, 
  Users, 
  Award, 
  MessageCircle, 
  BarChart3, 
  Calendar,
  Briefcase,
  CreditCard,
  Video,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Comprehensive Course Management',
    description: 'Create, organize, and deliver engaging courses with sections, lessons, quizzes, and assignments. Support for video, text, and interactive content.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: Users,
    title: 'Social Learning Network',
    description: 'Connect with peers through posts, groups, and pages. Share knowledge, collaborate on projects, and build your professional network.',
    color: 'text-green-600 bg-green-100',
  },
  {
    icon: Award,
    title: 'Certificates & Achievements',
    description: 'Earn verified certificates upon course completion. Track your achievements and showcase your skills to employers with unique verification codes.',
    color: 'text-yellow-600 bg-yellow-100',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat & Collaboration',
    description: 'Stay connected with instructors and classmates through real-time messaging. Get instant help and engage in meaningful discussions.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Gain insights into learning progress, engagement metrics, and performance analytics. Make data-driven decisions to improve outcomes.',
    color: 'text-red-600 bg-red-100',
  },
  {
    icon: Calendar,
    title: 'Live Sessions & Events',
    description: 'Schedule and attend live virtual sessions, webinars, and events. Support for online, in-person, and hybrid formats with integrated video conferencing.',
    color: 'text-orange-600 bg-orange-100',
  },
  {
    icon: Briefcase,
    title: 'Job Board Integration',
    description: 'Discover career opportunities tailored to your skills and learning path. Apply directly and track your applications in one place.',
    color: 'text-indigo-600 bg-indigo-100',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment Options',
    description: 'Support for one-time purchases, subscriptions, and flexible pricing models. Secure payment processing with multiple payment providers.',
    color: 'text-pink-600 bg-pink-100',
  },
  {
    icon: Video,
    title: 'Rich Media Support',
    description: 'Upload and stream videos, share documents, and create interactive multimedia content. Cloud storage integration with S3-compatible services.',
    color: 'text-cyan-600 bg-cyan-100',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Built with security in mind. OAuth 2.0 authentication, role-based access control, audit logging, and data encryption.',
    color: 'text-gray-700 bg-gray-100',
  },
];

export function FeaturesSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            LEAP PM provides a complete ecosystem for online learning with powerful features 
            designed to engage students and empower instructors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
