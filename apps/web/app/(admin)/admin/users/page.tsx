'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Ban, Lock, Unlock, Shield, Trash2, Eye, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<'block' | 'ban' | 'role' | 'delete' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/users?page=1&limit=100'),
  });

  const blockMutation = useMutation({
    mutationFn: (data: { id: number; reason?: string }) =>
      apiClient.post(`/users/${data.id}/block`, { reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User blocked successfully');
      setActionDialog(null);
      setActionReason('');
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/users/${id}/unblock`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User unblocked successfully');
    },
  });

  const banMutation = useMutation({
    mutationFn: (data: { id: number; reason: string }) =>
      apiClient.post(`/users/${data.id}/ban`, { reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User banned successfully');
      setActionDialog(null);
      setActionReason('');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { id: number; roleId: number }) =>
      apiClient.patch(`/users/${data.id}/role`, { roleId: data.roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
      setActionDialog(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
      setActionDialog(null);
    },
  });

  const handleAction = () => {
    if (!selectedUser) return;

    switch (actionDialog) {
      case 'block':
        blockMutation.mutate({ id: selectedUser.id, reason: actionReason });
        break;
      case 'ban':
        if (!actionReason) {
          toast.error('Please provide a reason');
          return;
        }
        banMutation.mutate({ id: selectedUser.id, reason: actionReason });
        break;
      case 'role':
        if (!selectedRole) {
          toast.error('Please select a role');
          return;
        }
        updateRoleMutation.mutate({ id: selectedUser.id, roleId: parseInt(selectedRole) });
        break;
      case 'delete':
        deleteMutation.mutate(selectedUser.id);
        break;
    }
  };

  const filteredUsers = (users as any)?.filter((user: any) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all platform users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(users as any)?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(users as any)?.filter((u: any) => !u.isBlocked && !u.isBanned).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(users as any)?.filter((u: any) => u.isBlocked).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(users as any)?.filter((u: any) => u.isBanned).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username || user.firstName + ' ' + user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role || 'User'}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : user.isBlocked ? (
                        <Badge variant="secondary">Blocked</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            // View user details
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setActionDialog('role');
                          }}>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          {!user.isBlocked && !user.isBanned && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setActionDialog('block');
                            }}>
                              <Lock className="mr-2 h-4 w-4" />
                              Block User
                            </DropdownMenuItem>
                          )}
                          {user.isBlocked && (
                            <DropdownMenuItem onClick={() => {
                              unblockMutation.mutate(user.id);
                            }}>
                              <Unlock className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setActionDialog('ban');
                          }}>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog('delete');
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === 'block' && 'Block User'}
              {actionDialog === 'ban' && 'Ban User'}
              {actionDialog === 'role' && 'Change User Role'}
              {actionDialog === 'delete' && 'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === 'block' && 'Block this user from accessing the platform.'}
              {actionDialog === 'ban' && 'Permanently ban this user. This action cannot be undone.'}
              {actionDialog === 'role' && 'Change the role for this user.'}
              {actionDialog === 'delete' && 'Permanently delete this user account. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>

          {(actionDialog === 'block' || actionDialog === 'ban') && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason {actionDialog === 'ban' && '(Required)'}</label>
                <Textarea
                  placeholder="Enter reason..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {actionDialog === 'role' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">User</SelectItem>
                    <SelectItem value="2">Instructor</SelectItem>
                    <SelectItem value="3">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={actionDialog === 'delete' || actionDialog === 'ban' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={blockMutation.isPending || banMutation.isPending || updateRoleMutation.isPending || deleteMutation.isPending}
            >
              {(blockMutation.isPending || banMutation.isPending || updateRoleMutation.isPending || deleteMutation.isPending) ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
