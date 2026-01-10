import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Students',
    description: 'Learning every day',
  },
  {
    icon: BookOpen,
    value: '1,000+',
    label: 'Courses Available',
    description: 'Across all topics',
  },
  {
    icon: GraduationCap,
    value: '500+',
    label: 'Expert Instructors',
    description: 'Industry professionals',
  },
  {
    icon: TrendingUp,
    value: '95%',
    label: 'Success Rate',
    description: 'Course completion',
  },
];

export function StatsSection() {
  return (
    <div className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
            Join a Thriving Community
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Thousands of learners and instructors trust LEAP PM for their educational needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center space-y-4 p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
              >
                <div className="inline-flex p-4 rounded-full bg-white/20">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl font-extrabold">{stat.value}</div>
                <div className="space-y-1">
                  <div className="text-xl font-semibold">{stat.label}</div>
                  <div className="text-sm text-blue-100">{stat.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
