// lib/rate-limit.ts

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

/**
 * Rate limit function to prevent abuse
 * @param identifier A unique identifier for the request (usually a combination of route and user ID)
 * @returns An object with success property indicating if the request should proceed
 */
export async function rateLimit(identifier: string): Promise<{ success: boolean }> {
  try {
    const { success } = await ratelimit.limit(identifier);
    return { success };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Default to allowing the request in case of error
    // You might want to change this behavior in production
    return { success: true };
  }
}