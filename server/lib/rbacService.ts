import { db } from '../db';
import { roles, userRoles, adminInvitations, adminAuditLogs, users } from '@shared/schema';
import { eq, and, or, isNull, gte } from 'drizzle-orm';
import crypto from 'crypto';

export interface Permission {
  resource: string; // 'users', 'plans', 'roles', 'system'
  action: string;   // 'read', 'write', 'delete', 'manage'
  scope?: string;   // 'own', 'all', 'admin'
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Define our role hierarchy
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'user',
    name: 'Regular User',
    description: 'Standard teacher account with basic features',
    permissions: [
      { resource: 'own_classes', action: 'read' },
      { resource: 'own_classes', action: 'write' },
      { resource: 'own_students', action: 'read' },
      { resource: 'own_students', action: 'write' },
      { resource: 'own_questions', action: 'read' },
      { resource: 'own_questions', action: 'write' },
      { resource: 'own_games', action: 'read' },
      { resource: 'own_games', action: 'write' },
      { resource: 'own_profile', action: 'read' },
      { resource: 'own_profile', action: 'write' },
    ]
  },
  {
    id: 'support',
    name: 'Support Staff',
    description: 'Can view user data and provide support',
    permissions: [
      { resource: 'users', action: 'read', scope: 'all' },
      { resource: 'user_plans', action: 'read', scope: 'all' },
      { resource: 'user_usage', action: 'read', scope: 'all' },
      { resource: 'system_stats', action: 'read' },
    ]
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Can manage users, plans, and system settings',
    permissions: [
      { resource: 'users', action: 'read', scope: 'all' },
      { resource: 'users', action: 'write', scope: 'all' },
      { resource: 'user_plans', action: 'read', scope: 'all' },
      { resource: 'user_plans', action: 'write', scope: 'all' },
      { resource: 'user_usage', action: 'read', scope: 'all' },
      { resource: 'user_usage', action: 'write', scope: 'all' },
      { resource: 'system_stats', action: 'read' },
      { resource: 'admin_audit', action: 'read' },
    ]
  },
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access including role management',
    permissions: [
      { resource: 'users', action: 'read', scope: 'all' },
      { resource: 'users', action: 'write', scope: 'all' },
      { resource: 'users', action: 'delete', scope: 'all' },
      { resource: 'user_plans', action: 'read', scope: 'all' },
      { resource: 'user_plans', action: 'write', scope: 'all' },
      { resource: 'user_usage', action: 'read', scope: 'all' },
      { resource: 'user_usage', action: 'write', scope: 'all' },
      { resource: 'roles', action: 'read', scope: 'all' },
      { resource: 'roles', action: 'write', scope: 'all' },
      { resource: 'roles', action: 'delete', scope: 'all' },
      { resource: 'system_stats', action: 'read' },
      { resource: 'system_settings', action: 'read' },
      { resource: 'system_settings', action: 'write' },
      { resource: 'admin_audit', action: 'read' },
      { resource: 'admin_audit', action: 'write' },
    ]
  }
];

export class RBACService {
  /**
   * Initialize the RBAC system with default roles
   */
  static async initializeRoles(): Promise<void> {
    try {
      console.log('Initializing RBAC roles...');
      
      for (const roleDef of ROLE_DEFINITIONS) {
        const existingRole = await db.select().from(roles).where(eq(roles.id, roleDef.id));
        
        if (existingRole.length === 0) {
          await db.insert(roles).values({
            id: roleDef.id,
            name: roleDef.name,
            description: roleDef.description,
            permissions: roleDef.permissions,
            isActive: true
          });
          console.log(`✅ Created role: ${roleDef.name}`);
        } else {
          console.log(`⏭️  Role already exists: ${roleDef.name}`);
        }
      }
      
      console.log('✅ RBAC roles initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize RBAC roles:', error);
      throw error;
    }
  }

  /**
   * Get all roles
   */
  static async getRoles(): Promise<any[]> {
    return await db.select().from(roles).where(eq(roles.isActive, true));
  }

  /**
   * Get user's roles
   */
  static async getUserRoles(userId: string): Promise<any[]> {
    const userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        assignedAt: userRoles.assignedAt,
        expiresAt: userRoles.expiresAt,
        isActive: userRoles.isActive,
        role: {
          id: roles.id,
          name: roles.name,
          description: roles.description,
          permissions: roles.permissions
        }
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          or(
            isNull(userRoles.expiresAt),
            gte(userRoles.expiresAt, new Date())
          )
        )
      );

    return userRolesData;
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(userId: string, roleId: string): Promise<boolean> {
    const userRolesData = await this.getUserRoles(userId);
    return userRolesData.some(ur => ur.roleId === roleId);
  }

  /**
   * Check if user has any admin role
   */
  static async hasAdminRole(userId: string): Promise<boolean> {
    const userRolesData = await this.getUserRoles(userId);
    return userRolesData.some(ur => ['admin', 'super_admin', 'support'].includes(ur.roleId));
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(userId: string, resource: string, action: string, scope?: string): Promise<boolean> {
    const userRolesData = await this.getUserRoles(userId);
    
    for (const userRole of userRolesData) {
      const permissions = userRole.role.permissions as Permission[];
      
      for (const permission of permissions) {
        if (permission.resource === resource && 
            permission.action === action && 
            (!scope || permission.scope === scope || permission.scope === 'all')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    // Check if assigner has permission to assign this role
    const canAssign = await this.hasPermission(assignedBy, 'roles', 'write', 'all');
    if (!canAssign) {
      throw new Error('Insufficient permissions to assign roles');
    }

    await this._assignRoleInternal(userId, roleId, assignedBy);
  }

  /**
   * Internal method to assign role without permission checks (for initial setup)
   */
  static async _assignRoleInternal(userId: string, roleId: string, assignedBy: string): Promise<void> {
    // Check if role exists
    const role = await db.select().from(roles).where(eq(roles.id, roleId));
    if (role.length === 0) {
      throw new Error('Role does not exist');
    }

    // Check if user already has this role
    const existingRole = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
          eq(userRoles.isActive, true)
        )
      );

    if (existingRole.length > 0) {
      throw new Error('User already has this role');
    }

    // Assign the role
    await db.insert(userRoles).values({
      userId,
      roleId,
      assignedBy,
      isActive: true
    });

    // Log the action
    await this.logAdminAction(assignedBy, 'role_assignment', userId, 'user_roles', null, {
      roleId,
      assignedBy
    });
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: string, roleId: string, removedBy: string): Promise<void> {
    // Check if remover has permission
    const canRemove = await this.hasPermission(removedBy, 'roles', 'write', 'all');
    if (!canRemove) {
      throw new Error('Insufficient permissions to remove roles');
    }

    // Get the role assignment
    const roleAssignment = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
          eq(userRoles.isActive, true)
        )
      );

    if (roleAssignment.length === 0) {
      throw new Error('User does not have this role');
    }

    // Soft delete the role assignment
    await db
      .update(userRoles)
      .set({ isActive: false })
      .where(eq(userRoles.id, roleAssignment[0].id));

    // Log the action
    await this.logAdminAction(removedBy, 'role_removal', userId, 'user_roles', {
      roleId,
      assignedBy: roleAssignment[0].assignedBy
    }, null);
  }

  /**
   * Create admin invitation
   */
  static async createInvitation(email: string, roleId: string, invitedBy: string): Promise<string> {
    // Check if inviter has permission
    const canInvite = await this.hasPermission(invitedBy, 'roles', 'write', 'all');
    if (!canInvite) {
      throw new Error('Insufficient permissions to create invitations');
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(adminInvitations).values({
      email,
      roleId,
      invitedBy,
      token,
      expiresAt,
      status: 'pending'
    });

    // Log the action
    await this.logAdminAction(invitedBy, 'admin_invitation_created', null, 'admin_invitations', null, {
      email,
      roleId,
      token: token.substring(0, 8) + '...' // Log partial token for security
    });

    return token;
  }

  /**
   * Accept admin invitation
   */
  static async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await db
      .select()
      .from(adminInvitations)
      .where(
        and(
          eq(adminInvitations.token, token),
          eq(adminInvitations.status, 'pending'),
          gte(adminInvitations.expiresAt, new Date())
        )
      );

    if (invitation.length === 0) {
      throw new Error('Invalid or expired invitation');
    }

    const inv = invitation[0];

    // Assign the role
    await this.assignRole(userId, inv.roleId, inv.invitedBy);

    // Mark invitation as accepted
    await db
      .update(adminInvitations)
      .set({
        status: 'accepted',
        acceptedAt: new Date()
      })
      .where(eq(adminInvitations.id, inv.id));

    // Log the action
    await this.logAdminAction(userId, 'admin_invitation_accepted', userId, 'admin_invitations', null, {
      invitationId: inv.id,
      roleId: inv.roleId
    });
  }

  /**
   * Log admin actions for audit trail
   */
  static async logAdminAction(
    adminId: string,
    action: string,
    targetUserId: string | null,
    resourceType: string,
    oldValue: any,
    newValue: any,
    metadata?: any
  ): Promise<void> {
    await db.insert(adminAuditLogs).values({
      adminId,
      action,
      targetUserId,
      resourceType,
      oldValue,
      newValue,
      metadata,
      timestamp: new Date()
    });
  }

  /**
   * Get admin audit logs
   */
  static async getAuditLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
    return await db
      .select()
      .from(adminAuditLogs)
      .orderBy(adminAuditLogs.timestamp)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get users with their roles
   */
  static async getUsersWithRoles(): Promise<any[]> {
    const allUsers = await db.select().from(users);
    const usersWithRoles = [];

    for (const user of allUsers) {
      const userRolesData = await this.getUserRoles(user.id);
      usersWithRoles.push({
        ...user,
        roles: userRolesData.map(ur => ({
          id: ur.roleId,
          name: ur.role.name,
          assignedAt: ur.assignedAt
        }))
      });
    }

    return usersWithRoles;
  }
} 