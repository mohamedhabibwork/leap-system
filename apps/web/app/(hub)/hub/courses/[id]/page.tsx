'use client';

import { useCourse } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnrollButton } from '@/components/buttons/enroll-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { ShareButton } from '@/components/buttons/share-button';
import { Comments } from '@/components/shared/comments';
import { CourseCard } from '@/components/cards/course-card';
import { Star, Clock, Users, PlayCircle, FileText, Award } from 'lucide-react';
import Image from 'next/image';
import { use } from 'react';

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: course, isLoading } = useCourse(parseInt(id));

  if (isLoading) {
    return <PageLoader message="Loading course..." />;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="relative">
        {course.thumbnail && (
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={1200}
            height={400}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <FavoriteButton
            entityType="course"
            entityId={course.id}
            isFavorited={course.isFavorited}
          />
          <ShareButton
            entityType="course"
            entityId={course.id}
            url={`/hub/courses/${course.id}`}
            title={course.title}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{course.rating}</span>
              <span className="text-muted-foreground">
                ({course.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{course.duration} hours</span>
            </div>
            <Badge>{course.level}</Badge>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">What you'll learn</h3>
                  <ul className="space-y-2">
                    {course.learningOutcomes?.map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 mt-0.5 text-primary" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {course.requirements?.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {course.sections?.map((section: any) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{section.title}</h4>
                        <ul className="space-y-2">
                          {section.lessons?.map((lesson: any) => (
                            <li key={lesson.id} className="flex items-center gap-2 text-sm">
                              {lesson.type === 'video' ? (
                                <PlayCircle className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <span>{lesson.title}</span>
                              <span className="ml-auto text-muted-foreground">
                                {lesson.duration} min
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Comments
                entityType="course"
                entityId={course.id}
                entityUserId={course.instructorId}
              />
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Resources will be available after enrollment
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={course.instructor?.avatar} />
                  <AvatarFallback>
                    {course.instructor?.firstName?.[0]}
                    {course.instructor?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-semibold">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Price</span>
                  <span className="text-2xl font-bold">
                    {course.price === 0
                      ? 'Free'
                      : `${course.currency} ${course.price}`}
                  </span>
                </div>
              </div>

              <EnrollButton
                courseId={course.id}
                price={course.price}
                enrollmentType={course.price === 0 ? 'free' : 'paid'}
                isEnrolled={course.isEnrolled}
                size="lg"
              />
            </CardContent>
          </Card>

          {/* Related Courses */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Related Courses</h3>
            <div className="space-y-4">
              {course.relatedCourses?.slice(0, 3).map((relatedCourse: any) => (
                <CourseCard
                  key={relatedCourse.id}
                  course={relatedCourse}
                  variant="list"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
