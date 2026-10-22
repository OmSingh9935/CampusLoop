/**
 * Shared Supabase configuration and timeout utilities.
 * Safe for Edge runtime, Node server components, and browser client components.
 */

/**
 * Check if a real Supabase instance is configured via environment variables.
 * Returns false if missing, undefined, or still using placeholder values.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (
    url.includes('placeholder') ||
    url.includes('your-project') ||
    url.includes('dummy') ||
    url.includes('example.com')
  ) {
    return false
  }
  if (key === 'placeholder-anon-key' || key === 'dummy' || key.length < 20) {
    return false
  }
  return true
}

/**
 * Race a promise with a timeout so slow/unresponsive remote calls never stall the UI.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T> | Promise<T>,
  timeoutMs = 2000,
  fallback: T
): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs)
  })
  try {
    const result = await Promise.race([Promise.resolve(promise), timeoutPromise])
    clearTimeout(timer!)
    return result
  } catch {
    clearTimeout(timer!)
    return fallback
  }
}
