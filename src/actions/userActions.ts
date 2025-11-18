"use server";

import { prisma } from '@/lib/prisma';
import { User, ActionResult, UserStatus, UserRole } from '@/types';

// Fetch all users
export async function getUsers(): Promise<ActionResult<User[]>> {
  try {
    const users = await prisma.user.findMany({
      include: {
        managedBusinesses: true
      }
    });
    // Map Prisma user objects to our User interface
    const mappedUsers: User[] = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? undefined,
      role: user.role as UserRole,
      managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || [],
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    }));
    
    return { success: true, data: mappedUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

// Create a new user
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'managedBusinessIds'>): Promise<ActionResult<User>> {
  try {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Préparer les données pour la création
    const userDataForPrisma: any = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role as UserRole,
    };
    
    // Ajouter les propriétés optionnelles si elles existent
    if (userData.password !== undefined) {
      userDataForPrisma.password = userData.password;
    }
    if (userData.status !== undefined) {
      userDataForPrisma.status = userData.status as UserStatus;
    }
    if (userData.avatarUrl !== undefined) {
      userDataForPrisma.avatarUrl = userData.avatarUrl;
    }
    if (userData.permissions !== undefined) {
      userDataForPrisma.permissions = userData.permissions;
    }
    
    const user = await prisma.user.create({
      data: userDataForPrisma,
    });
    
    // Map to our User interface
    const mappedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? undefined,
      role: user.role as UserRole,
      managedBusinessIds: [],
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    };
    
    return { success: true, data: mappedUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

// Update a user
export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<ActionResult<User>> {
  try {
    // Préparer les données pour la mise à jour
    const userDataForPrisma: any = {};
    
    // Ajouter les propriétés à mettre à jour si elles existent
    if (userData.name !== undefined) {
      userDataForPrisma.name = userData.name;
    }
    if (userData.email !== undefined) {
      userDataForPrisma.email = userData.email;
    }
    if (userData.password !== undefined) {
      userDataForPrisma.password = userData.password;
    }
    if (userData.role !== undefined) {
      userDataForPrisma.role = userData.role as UserRole;
    }
    if (userData.status !== undefined) {
      userDataForPrisma.status = userData.status as UserStatus;
    }
    if (userData.avatarUrl !== undefined) {
      userDataForPrisma.avatarUrl = userData.avatarUrl;
    }
    if (userData.lastLogin !== undefined) {
      userDataForPrisma.lastLogin = userData.lastLogin ? new Date(userData.lastLogin) : undefined;
    }
    if (userData.permissions !== undefined) {
      userDataForPrisma.permissions = userData.permissions;
    }
    
    // Gérer la mise à jour des managedBusinessIds
    let managedBusinessesConnectDisconnect = undefined;
    if (userData.managedBusinessIds !== undefined) {
      // Récupérer les entreprises actuellement gérées par l'utilisateur
      const currentUser = await prisma.user.findUnique({
        where: { id },
        include: { managedBusinesses: true }
      });
      
      const currentBusinessIds = currentUser?.managedBusinesses?.map(b => b.id) || [];
      const newBusinessIds = userData.managedBusinessIds || [];
      
      // Calculer les différences pour connecter/déconnecter
      const toConnect = newBusinessIds.filter(id => !currentBusinessIds.includes(id));
      const toDisconnect = currentBusinessIds.filter(id => !newBusinessIds.includes(id));
      
      managedBusinessesConnectDisconnect = {
        connect: toConnect.map(id => ({ id })),
        disconnect: toDisconnect.map(id => ({ id }))
      };
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...userDataForPrisma,
        ...(managedBusinessesConnectDisconnect && { managedBusinesses: managedBusinessesConnectDisconnect })
      },
      include: {
        managedBusinesses: true
      }
    });
    
    // Map to our User interface
    const mappedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? undefined,
      role: user.role as UserRole,
      managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || [],
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    };
    
    return { success: true, data: mappedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<ActionResult<{ message: string }>> {
  try {
    await prisma.user.delete({
      where: { id },
    });
    
    return { success: true, data: { message: 'User deleted successfully' } };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<ActionResult<Omit<User, 'password'>>> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        managedBusinesses: true
      }
    });
    
    // Check if user exists and password matches
    // Note: In a production environment, you should use proper password hashing
    if (user && user.password === password) {
      // Map to our User interface without password
      const userWithoutPassword: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || [],
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      };
      
      return { success: true, data: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Failed to authenticate user' };
  }
}