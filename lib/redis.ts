import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const KEYS = {
  ALL_PHONES: "phones:all",
  ACTIVE_PHONES: "phones:active",
  VERIFIED_PHONES: "phones:verified",
  SETTINGS: "app:settings",
  phone: (phone: string) => `phone:${phone}`,
} as const

export { KEYS }
