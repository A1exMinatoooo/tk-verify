import { redis, KEYS } from "./redis"
import type { PhoneRecord, VerifyResult, StatsData, AppSettings } from "./types"

export async function addPhone(phone: string): Promise<{ success: boolean; message: string }> {
  const existing = await redis.get<PhoneRecord>(KEYS.phone(phone))
  if (existing) {
    return { success: false, message: `手机号 ${phone} 已存在` }
  }

  const record: PhoneRecord = {
    phone,
    last4: phone.slice(-4),
    status: "active",
    createdAt: Date.now(),
    verifiedAt: null,
  }

  const pipeline = redis.pipeline()
  pipeline.set(KEYS.phone(phone), JSON.stringify(record))
  pipeline.sadd(KEYS.ALL_PHONES, phone)
  pipeline.sadd(KEYS.ACTIVE_PHONES, phone)
  await pipeline.exec()

  return { success: true, message: `手机号 ${phone} 录入成功` }
}

export async function addPhones(phones: string[]): Promise<{ success: number; failed: number; messages: string[] }> {
  let success = 0
  let failed = 0
  const messages: string[] = []

  for (const phone of phones) {
    const trimmed = phone.trim()
    if (!trimmed) continue

    if (!/^1[3-9]\d{9}$/.test(trimmed)) {
      failed++
      messages.push(`${trimmed}: 格式不正确`)
      continue
    }

    const result = await addPhone(trimmed)
    if (result.success) {
      success++
    } else {
      failed++
      messages.push(result.message)
    }
  }

  return { success, failed, messages }
}

export async function getPhonesByLast4(last4: string): Promise<VerifyResult[]> {
  const allPhones = await redis.smembers(KEYS.ALL_PHONES)
  const results: VerifyResult[] = []

  for (const phone of allPhones) {
    const phoneStr = String(phone)
    if (phoneStr.slice(-4) === last4) {
      const record = await redis.get<PhoneRecord>(KEYS.phone(phoneStr))
      if (record) {
        results.push({
          phone: record.phone,
          last4: record.last4,
          status: record.status,
          createdAt: new Date(record.createdAt).toISOString(),
        })
      }
    }
  }

  return results
}

export async function verifyPhone(phone: string): Promise<{ success: boolean; message: string }> {
  const record = await redis.get<PhoneRecord>(KEYS.phone(phone))

  if (!record) {
    return { success: false, message: "手机号不存在" }
  }

  if (record.status === "verified") {
    return { success: false, message: "该手机号已核销" }
  }

  const updatedRecord: PhoneRecord = {
    ...record,
    status: "verified",
    verifiedAt: Date.now(),
  }

  const pipeline = redis.pipeline()
  pipeline.set(KEYS.phone(phone), JSON.stringify(updatedRecord))
  pipeline.srem(KEYS.ACTIVE_PHONES, phone)
  pipeline.sadd(KEYS.VERIFIED_PHONES, phone)
  await pipeline.exec()

  return { success: true, message: "核销成功" }
}

export async function deletePhone(phone: string): Promise<{ success: boolean; message: string }> {
  const record = await redis.get<PhoneRecord>(KEYS.phone(phone))

  if (!record) {
    return { success: false, message: "手机号不存在" }
  }

  const pipeline = redis.pipeline()
  pipeline.del(KEYS.phone(phone))
  pipeline.srem(KEYS.ALL_PHONES, phone)
  pipeline.srem(KEYS.ACTIVE_PHONES, phone)
  pipeline.srem(KEYS.VERIFIED_PHONES, phone)
  await pipeline.exec()

  return { success: true, message: "删除成功" }
}

export async function getAllPhones(search?: string, status?: "active" | "verified"): Promise<PhoneRecord[]> {
  let phones: unknown[]

  if (status === "active") {
    phones = await redis.smembers(KEYS.ACTIVE_PHONES)
  } else if (status === "verified") {
    phones = await redis.smembers(KEYS.VERIFIED_PHONES)
  } else {
    phones = await redis.smembers(KEYS.ALL_PHONES)
  }

  const records: PhoneRecord[] = []

  for (const phone of phones) {
    const phoneStr = String(phone)
    const record = await redis.get<PhoneRecord>(KEYS.phone(phoneStr))
    if (record) {
      if (!search || phoneStr.includes(search)) {
        records.push(record)
      }
    }
  }

  return records.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getStats(): Promise<StatsData> {
  const pipeline = redis.pipeline()
  pipeline.scard(KEYS.ALL_PHONES)
  pipeline.scard(KEYS.ACTIVE_PHONES)
  pipeline.scard(KEYS.VERIFIED_PHONES)
  const results = await pipeline.exec<number[]>()

  return {
    total: results[0] || 0,
    active: results[1] || 0,
    verified: results[2] || 0,
  }
}

export async function formatPhone(phone: string): Promise<string> {
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`
  }
  return phone
}

const DEFAULT_SETTINGS: AppSettings = {
  title: "手机号核销系统",
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await redis.get<AppSettings>(KEYS.SETTINGS)
  return settings || DEFAULT_SETTINGS
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...settings }
  await redis.set(KEYS.SETTINGS, JSON.stringify(updated))
  return updated
}
