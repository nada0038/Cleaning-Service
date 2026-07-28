import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me_in_production';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}

/**
 * Extracts session from Next.js request.
 * Can check secure httpOnly cookies or Authorization header.
 */
export async function getAuthUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch (error) {
    console.error('Error fetching auth token:', error);
    return null;
  }
}
