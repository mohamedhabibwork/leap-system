import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    features: [
      'Access to free courses',
      'Basic course features',
      'Community forum access',
      'Progress tracking',
      'Mobile app access',
      'Email support',
    ],
    cta: 'Get Started Free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'For serious learners',
    features: [
      'All Free features',
      'Access to premium courses',
      'Unlimited course enrollments',
      'Priority support',
      'Advanced analytics',
      'Downloadable resources',
      'Live session recordings',
      'Certificate templates',
    ],
    cta: 'Start Pro Trial',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and organizations',
    features: [
      'All Pro features',
      'Custom branding',
      'Dedicated account manager',
      'SSO integration',
      'API access',
      'Advanced security',
      'Custom integrations',
      'SLA guarantee',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day money-back guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-900 border-2 border-gray-200'
              } p-8 hover:shadow-xl transition-all duration-300`}
            >
              {plan.highlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold">{plan.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-extrabold">${plan.price}</span>
                      <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>
                        /month
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 py-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 flex-shrink-0 ${
                          plan.highlighted ? 'text-blue-200' : 'text-green-500'
                        }`}
                      />
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={plan.href}>
                  <button
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.highlighted
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-600">
          <p>All plans include basic features. Upgrade or downgrade anytime.</p>
          <p className="mt-2">
            Need a custom plan?{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
