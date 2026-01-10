import Link from 'next/link';
import { ArrowRight, PlayCircle, Users, BookOpen } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now with Real-time Learning & Analytics
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
            Transform Your Future with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              LEAP PM
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed">
            The most comprehensive Learning Management System built for modern education. 
            Master new skills, connect with peers, and advance your career—all in one place.
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span><strong className="text-gray-900">50,000+</strong> Active Learners</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span><strong className="text-gray-900">1,000+</strong> Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-green-600" />
              <span><strong className="text-gray-900">100,000+</strong> Lessons Completed</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/hub/courses"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-lg font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Explore Courses
            </Link>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-gray-500 pt-4">
            No credit card required • Free forever plan • Cancel anytime
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 transform translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
}
