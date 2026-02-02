// import { supplier } from "@/app/endpoints/suppliers/suppliers";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "email",
          type: "email",
        },
        password: {
          label: "password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        try {
          const payload = {
            user: {
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
            },
          };
          const res = await fetch("", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const user = await res.json();
          if (!user) {
            throw new Error("Invalid credentials.");
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
    strategy: "jwt",
  },
  pages: {
    error: "/suppliers/login",
    signIn: '/suppliers/login',
    signOut: '/suppliers/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // 'user' solo tiene datos la primera vez que te logueas
      if (user && token) {
        // IMPORTANTE: mapea 'user.token' a 'token.accessToken'
        // token.accessToken = user?.token;
        // token.code_role = user?.code_role;
        // token.name_role = user?.name_role;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Solo servidor
      if (typeof window === "undefined") {
        // session.user.code_role = token?.code_role;
        // session.user.name_role = token?.name_role;
        // session.user.accessToken = token?.accessToken;
        return session;
      }else{
        //solo usuario
        // session.user.code_role = token?.code_role;
        // session.user.name_role = token?.name_role;
        return session;
      }
    },
  },
});
