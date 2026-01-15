import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

const handler = NextAuth({
    providers: [
          TwitterProvider({
                  clientId: process.env.TWITTER_API_KEY!,
                  clientSecret: process.env.TWITTER_API_SECRET!,
                  version: '1.0a',
          }),
        ],
    callbacks: {
          async jwt({ token, profile }) {
                  if (profile) {
                            token.username = (profile as any).screen_name
                            token.id = (profile as any).id_str
                            token.picture = (profile as any).profile_image_url_https?.replace('_normal', '_400x400')
                  }
                  return token
          },
          async session({ session, token }) {
                  return {
                            ...session,
                            user: {
                                        ...session.user,
                                        id: token.id,
                                        username: token.username,
                                        image: token.picture || session.user?.image,
                            },
                  }
          },
    },
    pages: {
          signIn: '/',
    },
})

export { handler as GET, handler as POST }
