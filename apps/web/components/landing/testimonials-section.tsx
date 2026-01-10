import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    image: null,
    rating: 5,
    content: 'LEAP PM transformed how I learn new skills. The platform is intuitive, and the courses are incredibly well-structured. I earned three certifications in just two months!',
  },
  {
    name: 'Michael Chen',
    role: 'Software Developer',
    image: null,
    rating: 5,
    content: 'The best LMS I\'ve used. The social learning features helped me connect with like-minded professionals, and the real-time chat made collaboration effortless.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Course Instructor',
    image: null,
    rating: 5,
    content: 'As an instructor, LEAP PM gives me all the tools I need. The analytics help me understand my students better, and the platform handles everything from content delivery to payments.',
  },
  {
    name: 'David Park',
    role: 'UX Designer',
    image: null,
    rating: 5,
    content: 'I love the progress tracking and achievement system. It keeps me motivated, and the certificate verification feature has helped me land two job interviews!',
  },
  {
    name: 'Jessica Martinez',
    role: 'Product Manager',
    image: null,
    rating: 5,
    content: 'The job board integration is genius! I completed a course in Product Management and found my dream job through the platform. Highly recommend!',
  },
  {
    name: 'Ryan Thompson',
    role: 'Entrepreneur',
    image: null,
    rating: 5,
    content: 'LEAP PM is more than just a learning platform—it\'s a complete ecosystem. The community features, live sessions, and comprehensive course library are unmatched.',
  },
];

export function TestimonialsSection() {
  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            Loved by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our students and instructors have to say about their experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="space-y-4">
                {/* Quote Icon */}
                <Quote className="h-10 w-10 text-blue-200" />

                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
