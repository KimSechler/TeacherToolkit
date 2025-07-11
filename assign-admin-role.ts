import { RBACService } from './server/lib/rbacService';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

// This function will be called after the server starts and RBAC is initialized
export async function assignSuperAdminRole() {
  try {
    console.log('🔧 Assigning super admin role to andrewjstoy@gmail.com...');
    
    // Find the user account
    const userAccount = await db.select().from(users).where(eq(users.email, 'andrewjstoy@gmail.com'));
    
    if (userAccount.length === 0) {
      console.log('⏳ User account not found yet. Will retry when user logs in.');
      return;
    }

    const userId = userAccount[0].id;
    console.log(`✅ Found user account: ${userAccount[0].email} (ID: ${userId})`);

    // Check if user already has super admin role
    const hasRole = await RBACService.hasRole(userId, 'super_admin');
    if (hasRole) {
      console.log('⏭️  User already has super admin role!');
      return;
    }

    // Assign super admin role (self-assign for initial setup)
    await RBACService._assignRoleInternal(userId, 'super_admin', userId);
    console.log('👑 Super admin role assigned successfully!');
    
    // Verify the assignment
    const userRoles = await RBACService.getUserRoles(userId);
    const hasAdminRole = await RBACService.hasAdminRole(userId);
    
    console.log(`📊 User roles: ${userRoles.map(r => r.role.name).join(', ')}`);
    console.log(`🔐 Has admin role: ${hasAdminRole}`);
    
  } catch (error) {
    console.error('❌ Failed to assign super admin role:', error);
  }
}

// Export for use in server startup
export default assignSuperAdminRole; 