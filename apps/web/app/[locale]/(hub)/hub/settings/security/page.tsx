'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Smartphone, Monitor, Trash2, Clock, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Session {
  id: number;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  ipAddress?: string;
  location?: string;
  lastActivityAt: string;
  createdAt: string;
  isActive: boolean;
  sessionToken: string;
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      loadSecurityData();
    }
  }, [status]);

  const loadSecurityData = async () => {
    try {
      const [sessionsData, twoFactorStatus] = await Promise.all([
        apiClient.get('/auth/sessions'),
        apiClient.get('/auth/2fa/status'),
      ]);

      setSessions(sessionsData);
      setTwoFactorEnabled(twoFactorStatus.enabled);
    } catch (error) {
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = () => {
    router.push('/setup-2fa');
  };

  const handleDisable2FA = async () => {
    // This should prompt for password and 2FA code
    router.push('/settings/security/disable-2fa');
  };

  const handleRevokeSession = async (sessionToken: string) => {
    setRevoking(true);
    try {
      await apiClient.delete(`/auth/sessions/${sessionToken}`);
      toast.success('Session revoked successfully');
      setSessions(sessions.filter(s => s.sessionToken !== sessionToken));
    } catch (error) {
      toast.error('Failed to revoke session');
    } finally {
      setRevoking(false);
      setShowRevokeDialog(false);
      setSessionToRevoke(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const currentToken = session?.accessToken;
      await apiClient.delete('/auth/sessions/other', {
        data: { currentSessionToken: currentToken },
      });
      toast.success('All other sessions revoked');
      await loadSecurityData();
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatLastActive = (date: string) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and active sessions</p>
        </div>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
              {twoFactorEnabled && (
                <Badge variant="default" className="bg-green-500">Enabled</Badge>
              )}
            </div>
            <CardDescription>
              Add an extra layer of security to your account with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {twoFactorEnabled ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Two-factor authentication is currently enabled for your account. You'll need to enter a code from your authenticator app when signing in.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDisable2FA}>
                    Disable 2FA
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/settings/security/regenerate-backup-codes')}>
                    Regenerate Backup Codes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Two-factor authentication is not enabled. We highly recommend enabling it to secure your account.
                </p>
                <Button onClick={handleSetup2FA}>
                  Enable 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Sessions</CardTitle>
              {sessions.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllOtherSessions}
                >
                  Revoke All Others
                </Button>
              )}
            </div>
            <CardDescription>
              Manage devices and locations where you're currently signed in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((sess, index) => (
                <div key={sess.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getDeviceIcon(sess.deviceType)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {sess.deviceName || `${sess.deviceType || 'Device'}`}
                          </p>
                          {sess.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {sess.browser} {sess.browserVersion} • {sess.os} {sess.osVersion}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {sess.ipAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {sess.ipAddress}
                              {sess.location && ` • ${sess.location}`}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLastActive(sess.lastActivityAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!sess.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSessionToRevoke(sess.sessionToken);
                          setShowRevokeDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Security Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Use a strong, unique password for your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Enable two-factor authentication for enhanced security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Review your active sessions regularly and revoke any you don't recognize</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>Keep your backup codes in a safe, secure location</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Revoke Session Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of this device. You'll need to sign in again to access your account from that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToRevoke && handleRevokeSession(sessionToRevoke)}
              disabled={revoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {revoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Session'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
