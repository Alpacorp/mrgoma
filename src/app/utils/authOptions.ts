// import { supplier } from "@/app/endpoints/suppliers/suppliers";
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: 'email',
          type: 'email',
        },
        password: {
          label: 'password',
          type: 'password',
        },
      },
      authorize: async credentials => {
        try {
          const payload = {
            user: {
              email: credentials?.email ?? '',
              password: credentials?.password ?? '',
            },
          };
          const res = await fetch('https://nbback-production.up.railway.app/api/login', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const user = await res.json();
          if (!user) {
            throw new Error('Invalid credentials.');
          }
          if (user) {
            return {
              id: user.data.email,
              email: user.data.email,
              name: user.data.fullname,
              code_role: user.data.code_role,
              name_role: user.data.name_role,
              token: user.data.token,
            };
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge:	24 * 60 * 60,
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
        // IMPORTANTE: mapea 'user.token' a 'token.accessToken'
        //sesion visible al servidor
        token.accessToken = user?.token;
        token.code_role = user?.code_role;
        token.name_role = user?.name_role;
      }
      return token;
    },
    async session({ session, token }) {
      //session visible al usuario
      return session;
    },
  },
});
