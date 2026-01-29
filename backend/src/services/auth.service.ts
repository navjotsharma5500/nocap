import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { appConfig } from '../config/config';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    rollNo: string;
    year?: string;
    branch?: string;
    hostel: string;
    gender: string;
    role?: string;
  }) {
    // Validate password format: firstname@tiet1
    const firstName = data.name.split(' ')[0].toLowerCase();
    const expectedPassword = `${firstName}@tiet1`;
    if (data.password !== expectedPassword) {
      throw new Error(`Password must be in format: (firstname)@tiet1. Expected: ${expectedPassword}`);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if rollNo already exists
    const existingRollNo = await prisma.user.findUnique({ where: { rollNo: data.rollNo } });
    if (existingRollNo) {
      throw new Error('Roll number already registered');
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        rollNo: data.rollNo,
        year: data.year,
        branch: data.branch,
        hostel: data.hostel,
        gender: data.gender,
        role: (data.role as any) || 'STUDENT',
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  /**
   * Login user and return JWT token
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { society: true },
    });

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token with user claims
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        societyId: user.societyId || null,
        societyName: user.society?.name || null,
      },
      appConfig.jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo,
        year: user.year,
        branch: user.branch,
        hostel: user.hostel,
        gender: user.gender,
        societyId: user.societyId,
        societyName: user.society?.name,
      },
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // EB members cannot change password
    if (user.role === 'SOCIETY_EB') {
      throw new Error('EB members cannot change their password');
    }

    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password format: firstname@tiet1
    const firstName = user.name.split(' ')[0].toLowerCase();
    const expectedPassword = `${firstName}@tiet1`;
    if (newPassword !== expectedPassword) {
      throw new Error(`Password must be in format: (firstname)@tiet1. Expected: ${expectedPassword}`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { society: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNo: user.rollNo,
      year: user.year,
      branch: user.branch,
      hostel: user.hostel,
      gender: user.gender,
      societyId: user.societyId,
      societyName: user.society?.name,
    };
  }
}

export const authService = new AuthService();
