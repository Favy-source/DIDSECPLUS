import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
  lastLogin?: string;
  isActive: boolean;
}

// In-memory storage for demo - replace with database
const users: User[] = [
  {
    id: 'user-001',
    firstName: 'Adebayo',
    lastName: 'Ogundimu',
    email: 'admin@security.gov.ng',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5VBpM2SFyO', // admin123
    rank: 'Commissioner of Police (CP)',
    department: 'Operations Department',
    stationId: 'NGP-HQ-001',
    permissions: ['admin', 'alerts:create', 'alerts:read', 'alerts:update', 'alerts:delete', 'tickets:manage', 'users:manage'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'user-002',
    firstName: 'Chioma',
    lastName: 'Okwu',
    email: 'officer@police.gov.ng',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5VBpM2SFyO', // officer123
    rank: 'Inspector',
    department: 'Criminal Investigation Department (CID)',
    stationId: 'LAG-VI-001',
    permissions: ['alerts:read', 'alerts:create', 'tickets:read', 'tickets:create'],
    createdAt: '2024-01-02T00:00:00Z',
    isActive: true
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without password) and token
    const { password: _userPassword, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
