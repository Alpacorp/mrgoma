//token only available throught out the req object
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { findUserByUsername } from '@/repositories/userRepository';
import { logger } from '@/utils/logger';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {
          label: 'username',
          type: 'text',
        },
        password: {
          label: 'password',
          type: 'password',
        },
      },
      authorize: async credentials => {
        try {
          const username = (credentials?.username as string) ?? '';
          const password = (credentials?.password as string) ?? '';

          if (!username || !password) {
            return null;
          }

          const user = await findUserByUsername(username);

          if (!user) {
            logger.warn(`Auth failed: User not found: ${username}`);
            return null;
          }

          // Password validation: Direct string comparison as passwords are plain text in DB.
          // Trim whitespace to handle CHAR columns or potential database padding.
          const dbPassword = user.Password?.trim() ?? '';
          const inputPassword = password.trim();

          if (dbPassword !== inputPassword) {
            logger.warn(`Auth failed for user: ${username} (password mismatch)`);
            return null;
          }

          logger.info(`Successful authentication for user: ${username}`);

          return {
            name: user.UserName,
          };
        } catch (error) {
          logger.error('Auth error in authorize callback:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  pages: {
    error: '/login',
    signIn: '/login',
    signOut: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
});
