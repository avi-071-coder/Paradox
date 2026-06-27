// Lightweight in-memory rate limiter for stateless security
// In production, replace with Redis (Upstash)

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Cleanup old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.timestamp < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  const userRecord = rateLimitMap.get(ip);

  if (!userRecord) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return { success: true };
  }

  if (userRecord.count >= limit) {
    return { success: false };
  }

  userRecord.count += 1;
  return { success: true };
}
