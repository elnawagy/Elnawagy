import { useAuth } from './useAuth';
import type { View, PermissionAction } from '../types';

export const usePermissions = () => {
  const { currentRole } = useAuth();

  const hasPermission = (view: View, action: PermissionAction): boolean => {
    if (!currentRole) {
      return false;
    }
    // Admin has all permissions
    if (currentRole.id === 'role-admin') {
      return true;
    }
    const viewPermissions = currentRole.permissions[view];
    if (!viewPermissions) {
      return false;
    }
    return viewPermissions.includes(action);
  };

  return { hasPermission };
};
