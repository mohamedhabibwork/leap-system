import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CtaSection() {
  return (
    <div className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Limited Time Offer
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
            Ready to Transform Your Learning?
          </h2>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students and instructors who are already using LEAP PM to achieve their goals. Start your journey today—completely free!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-lg text-blue-600 bg-white hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/hub/courses"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-lg text-white hover:bg-white/10 transition-all duration-200"
            >
              Browse Courses
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
