import { NextRequest, NextResponse } from 'next/server';

import { findUserByUsername } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';

/**
 * Endpoint to validate user credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      // For security reasons, we use a generic message
      logger.warn(`Login failed: User not found: ${username}`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Password validation.
    // NOTE: Direct string comparison as confirmed by the database schema (passwords are stored in plain text).
    // We use trim() to handle potential trailing spaces if the column is CHAR instead of VARCHAR.
    const dbPassword = user.Password?.trim() ?? '';
    const inputPassword = password.trim();

    if (dbPassword !== inputPassword) {
      logger.warn(`Login failed for user: ${username} (password mismatch)`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // If they match, return basic information (without a password)
    // This can be expanded later with JWT tokens if needed.
    return NextResponse.json({
      success: true,
      user: {
        id: user.UserName,
        email: user.UserName,
        name: user.UserName,
        // Default roles for the seller portal
        code_role: 'user',
        name_role: 'User',
      },
    });
  } catch (err: unknown) {
    logger.error('Login validation error', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
