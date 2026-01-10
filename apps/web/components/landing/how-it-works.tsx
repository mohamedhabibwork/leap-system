import { UserPlus, Search, GraduationCap, Award } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account in seconds. No credit card required to get started.',
    step: '01',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Search,
    title: 'Explore Courses',
    description: 'Browse our extensive catalog of courses across various topics and skill levels.',
    step: '02',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: GraduationCap,
    title: 'Learn & Engage',
    description: 'Watch lessons, complete assignments, interact with peers, and track your progress.',
    step: '03',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Award,
    title: 'Get Certified',
    description: 'Earn verified certificates and showcase your achievements to advance your career.',
    step: '04',
    color: 'from-orange-500 to-orange-600',
  },
];

export function HowItWorks() {
  return (
    <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            How LEAP PM Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your learning journey in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Step Number */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-lg flex items-center justify-center shadow-lg z-10`}>
                    {step.step}
                  </div>

                  {/* Icon Container */}
                  <div className={`mt-8 w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 pt-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/register"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Learning Today
          </a>
        </div>
      </div>
    </div>
  );
}
