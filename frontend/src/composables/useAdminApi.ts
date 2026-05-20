import { ADMIN_TOKEN_KEY } from '@/lib/constants'

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(`/api/admin${path}`, { ...options, headers })
}
