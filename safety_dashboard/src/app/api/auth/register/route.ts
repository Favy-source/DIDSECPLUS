import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Mock database - In production, use a real database
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rank: string;
  department: string;
  stationId: string;
  permissions: string[];
  createdAt: string;
  isActive: boolean;
}

// This would be your database in production
const users: User[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, rank, department, stationId } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !rank || !department || !stationId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      rank,
      department,
      stationId,
      permissions: getDefaultPermissions(rank),
      createdAt: new Date().toISOString(),
      isActive: false // Requires admin approval in production
    };

    // Save user to database (mock)
    users.push(newUser);

    // In production, you would:
    // 1. Save to database
    // 2. Send verification email
    // 3. Notify administrators for approval
    // 4. Log the registration attempt

    return NextResponse.json({
      message: 'Registration successful. Your account is pending approval.',
      userId: newUser.id
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Assign default permissions based on rank
function getDefaultPermissions(rank: string): string[] {
  const rankPermissions: { [key: string]: string[] } = {
    'Inspector General of Police (IGP)': ['admin', 'alerts:*', 'tickets:*', 'users:*', 'reports:*', 'system:*'],
    'Deputy Inspector General (DIG)': ['admin', 'alerts:*', 'tickets:*', 'users:manage', 'reports:*'],
    'Assistant Inspector General (AIG)': ['alerts:*', 'tickets:*', 'users:read', 'reports:read'],
    'Commissioner of Police (CP)': ['alerts:*', 'tickets:*', 'users:read', 'reports:read'],
    'Deputy Commissioner of Police (DCP)': ['alerts:read', 'alerts:create', 'alerts:update', 'tickets:*'],
    'Assistant Commissioner of Police (ACP)': ['alerts:read', 'alerts:create', 'tickets:read', 'tickets:create'],
    'Chief Superintendent of Police (CSP)': ['alerts:read', 'alerts:create', 'tickets:read', 'tickets:create'],
    'Superintendent of Police (SP)': ['alerts:read', 'alerts:create', 'tickets:read', 'tickets:create'],
    'Deputy Superintendent of Police (DSP)': ['alerts:read', 'alerts:create', 'tickets:read', 'tickets:create'],
    'Assistant Superintendent of Police (ASP)': ['alerts:read', 'tickets:read', 'tickets:create'],
    'Inspector': ['alerts:read', 'tickets:read', 'tickets:create'],
    'Sergeant': ['alerts:read', 'tickets:read'],
    'Corporal': ['alerts:read', 'tickets:read'],
    'Constable': ['alerts:read']
  };

  return rankPermissions[rank] || ['alerts:read'];
}
