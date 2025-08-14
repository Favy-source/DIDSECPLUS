import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Mock user data - In production, fetch from database
const getUserById = (id: string) => {
  const users = [
    {
      id: 'user-001',
      firstName: 'Adebayo',
      lastName: 'Ogundimu',
      email: 'admin@security.gov.ng',
      rank: 'Commissioner of Police (CP)',
      department: 'Operations Department',
      stationId: 'NGP-HQ-001',
      permissions: ['admin', 'alerts:create', 'alerts:read', 'alerts:update', 'alerts:delete', 'tickets:manage', 'users:manage'],
      lastLogin: '2024-01-15T10:30:00Z'
    },
    {
      id: 'user-002',
      firstName: 'Chioma',
      lastName: 'Okwu',
      email: 'officer@police.gov.ng',
      rank: 'Inspector',
      department: 'Criminal Investigation Department (CID)',
      stationId: 'LAG-VI-001',
      permissions: ['alerts:read', 'alerts:create', 'tickets:read', 'tickets:create'],
      lastLogin: '2024-01-15T09:15:00Z'
    }
  ];
  
  return users.find(u => u.id === id);
};

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        permissions: string[];
      };

      // Get user data from database
      const user = getUserById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user,
        message: 'Token valid'
      });

    } catch {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
