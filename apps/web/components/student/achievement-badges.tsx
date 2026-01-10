'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Achievement } from '@leap-lms/shared-types';
import { format } from 'date-fns';

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievements & Certificates
        </CardTitle>
        <CardDescription>Your completed courses and earned certificates</CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Complete a course to earn your first certificate!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">{achievement.courseName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Completed {format(new Date(achievement.completedAt), 'MMM d, yyyy')}</span>
                      {achievement.certificateCode && (
                        <Badge variant="outline" className="text-xs">
                          {achievement.certificateCode}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {achievement.certificateUrl && (
                    <>
                      <a 
                        href={achievement.certificateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </a>
                      <a 
                        href={achievement.certificateUrl} 
                        download
                      >
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
