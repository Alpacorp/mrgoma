import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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
      authorize: async (credentials, req) => {
        try {
          const username = (credentials?.username as string) ?? '';
          const password = (credentials?.password as string) ?? '';

          if (!username || !password) {
            return null;
          }

          // In production, we should use an absolute URL.
          // For local development, Next.js allows relative paths in some contexts,
          // but NextAuth 'authorize' usually needs a full URL or a relative path from the app origin.
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const loginUrl = `${baseUrl}/api/login`;

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            logger.warn(`Auth API failed: ${errorData.message || response.statusText}`);
            return null;
          }

          const data = await response.json();

          if (data.success && data.user) {
            logger.info(`Successful authentication via API for user: ${username}`);
            return {
              ...data.user,
              token: data.token || 'api-auth-token',
            };
          }

          return null;
        } catch (error) {
          logger.error('Auth error in authorize callback calling API:', error);
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
    async jwt({ token, user }: any) {
      if (user && token) {
        // IMPORTANT: map 'user.token' to the 'token.accessToken'
        // session visible to the server
        token.accessToken = user?.token;
        token.code_role = user?.code_role;
        token.name_role = user?.name_role;
      }
      return token;
    },
    async session({ session, token }) {
      // session visible to the user
      return session;
    },
  },
});
