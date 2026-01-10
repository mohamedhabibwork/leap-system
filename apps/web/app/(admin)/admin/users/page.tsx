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
import {
  useAdminUsers,
  useSuspendUser,
  useActivateUser,
  useUpdateUserRole,
  useBulkUserActions,
} from '@/lib/hooks/use-admin-api';
import {
  useDashboardUIStore,
  selectPageFilters,
  selectPagePagination,
  selectModalState,
} from '@/stores/dashboard-ui.store';
import { useBulkActionsStore } from '@/stores/bulk-actions.store';
import { PageLoader } from '@/components/loading/page-loader';

const PAGE_KEY = 'admin-users';

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Zustand stores
  const { updateFilter, openModal, closeModal } = useDashboardUIStore();
  const filters = useDashboardUIStore(selectPageFilters(PAGE_KEY));
  const pagination = useDashboardUIStore(selectPagePagination(PAGE_KEY));
  const isDialogOpen = useDashboardUIStore(selectModalState('user-action'));
  const [actionType, setActionType] = useState<'block' | 'ban' | 'role' | 'delete' | null>(null);

  // Bulk actions
  const { selectedItems, toggleItem, clearSelection, getSelectedCount } = useBulkActionsStore();
  const selectedCount = getSelectedCount(PAGE_KEY);

  // TanStack Query hooks
  const { data: usersResponse, isLoading } = useAdminUsers({
    search: filters.search,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const updateRole = useUpdateUserRole();
  const bulkActions = useBulkUserActions();

  const handleAction = () => {
    if (!selectedUser) return;

    switch (actionType) {
      case 'block':
        suspendUser.mutate({ userId: selectedUser.id, reason: actionReason }, {
          onSuccess: () => {
            toast.success('User suspended successfully');
            closeModal('user-action');
            setActionReason('');
          },
        });
        break;
      case 'ban':
        if (!actionReason) {
          toast.error('Please provide a reason');
          return;
        }
        suspendUser.mutate({ userId: selectedUser.id, reason: actionReason }, {
          onSuccess: () => {
            toast.success('User banned successfully');
            closeModal('user-action');
            setActionReason('');
          },
        });
        break;
      case 'role':
        if (!selectedRole) {
          toast.error('Please select a role');
          return;
        }
        updateRole.mutate({ userId: selectedUser.id, role: selectedRole }, {
          onSuccess: () => {
            toast.success('User role updated successfully');
            closeModal('user-action');
          },
        });
        break;
      case 'delete':
        // Would use delete mutation here
        toast.success('Delete functionality to be implemented');
        closeModal('user-action');
        break;
    }
  };

  const users = usersResponse?.data || [];
  const totalUsers = usersResponse?.total || 0;

  if (isLoading) {
    return <PageLoader message="Loading users..." />;
  }

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
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u: any) => !u.isBlocked && !u.isBanned).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u: any) => u.isBlocked).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCount}</div>
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
                value={filters.search || ''}
                onChange={(e) => updateFilter(PAGE_KEY, { search: e.target.value })}
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
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCount === users.length && users.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          bulkActions.mutate({
                            action: 'select-all',
                            userIds: users.map((u: any) => u.id),
                          });
                        } else {
                          clearSelection(PAGE_KEY);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems[PAGE_KEY]?.has(user.id)}
                        onChange={() => toggleItem(PAGE_KEY, user.id)}
                      />
                    </TableCell>
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
                            setActionType('role');
                            openModal('user-action');
                          }}>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          {!user.isBlocked && !user.isBanned && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setActionType('block');
                              openModal('user-action');
                            }}>
                              <Lock className="mr-2 h-4 w-4" />
                              Block User
                            </DropdownMenuItem>
                          )}
                          {user.isBlocked && (
                            <DropdownMenuItem onClick={() => {
                              activateUser.mutate(user.id);
                            }}>
                              <Unlock className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setActionType('ban');
                            openModal('user-action');
                          }}>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('delete');
                              openModal('user-action');
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
      <Dialog open={isDialogOpen} onOpenChange={() => closeModal('user-action')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'block' && 'Block User'}
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'role' && 'Change User Role'}
              {actionType === 'delete' && 'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'block' && 'Block this user from accessing the platform.'}
              {actionType === 'ban' && 'Permanently ban this user. This action cannot be undone.'}
              {actionType === 'role' && 'Change the role for this user.'}
              {actionType === 'delete' && 'Permanently delete this user account. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>

          {(actionType === 'block' || actionType === 'ban') && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason {actionType === 'ban' && '(Required)'}</label>
                <Textarea
                  placeholder="Enter reason..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {actionType === 'role' && (
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
            <Button variant="outline" onClick={() => closeModal('user-action')}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' || actionType === 'ban' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={suspendUser.isPending || updateRole.isPending}
            >
              {(suspendUser.isPending || updateRole.isPending) ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
