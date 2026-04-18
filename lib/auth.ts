import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { Adapter } from '@auth/core/adapters'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        })
        if (!user || !user.active) return null
        if (!user.password) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        console.log('🔍 Google sign-in attempt:', { email: user.email, image: user.image });
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email!.toLowerCase() },
        })
        
        console.log('📝 Existing user found:', { id: existingUser?.id, currentImage: existingUser?.image });
        
        if (!existingUser) {
          return '/admin/login?error=unauthorized'
        }
        
        if (!existingUser.active) {
          return '/admin/login?error=inactive'
        }

        // Update user image from Google profile
        const googleImage = (profile as { picture?: string })?.picture ?? user.image
        if (googleImage && googleImage !== existingUser.image) {
          console.log('✅ Updating user image:', { from: existingUser.image, to: googleImage });
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { image: googleImage },
          })
        } else {
          console.log('⏭️ Skipping image update:', { googleImage, dbImage: existingUser.image });
        }

        // Check if Account link exists, if not create it
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        })

        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token as string | null,
              access_token: account.access_token as string | null,
              expires_at: account.expires_at as number | null,
              token_type: account.token_type as string | null,
              scope: account.scope as string | null,
              id_token: account.id_token as string | null,
              session_state: account.session_state as string | null,
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      const emailKey = (user?.email || token.email)?.toLowerCase()
      if (emailKey) {
        const dbUser = await prisma.user.findUnique({ where: { email: emailKey } })
        if (dbUser) {
          token.role = dbUser.role
          if (dbUser.image) token.picture = dbUser.image
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
  },
})
