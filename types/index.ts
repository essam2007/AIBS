import type { User, Listing, Deal, Message, Document, Company, BrokerRating } from '@prisma/client'

export type { User, Listing, Deal, Message, Document, Company, BrokerRating }

export type UserWithCompany = User & { company: Company | null }

export type ListingWithUser = Listing & {
  user: UserWithCompany
  company: Company | null
  _count?: { deals: number }
}

export type DealWithRelations = Deal & {
  listing: Listing
  buyer: User
  seller: User | null
  broker: User | null
  messages: Message[]
  documents: Document[]
}

export type BrokerWithStats = User & {
  company: Company | null
  _count: { sellerDeals: number; brokerDeals: number; listings: number }
  avgRating?: number
  ratingsRcvd: BrokerRating[]
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      isVerified: boolean
      companyId?: string | null
    }
  }
}
