// ============================================================
//  src/api/account.js
//  Axios helpers for the Account (حسابي) self-service endpoints.
//  All calls require a valid JWT — the interceptor in client.js
//  attaches the Authorization header automatically.
// ============================================================
import apiClient from './client';

// ── GET /api/account/me ──────────────────────────────────────
// Returns: ApiResponse<UserProfileResponse>
// { id, fullName, email, whatsAppNumber, children: [{name, age}] }
export const fetchProfile = () => apiClient.get('/account/me');

// ── PUT /api/account/update ──────────────────────────────────
// Body: { fullName, whatsAppNumber }
// Returns: ApiResponse<UserProfileResponse>
export const updateProfile = (payload) =>
  apiClient.put('/account/update', payload);

// ── POST /api/account/children ───────────────────────────────
// Body: { name, age }
// Returns: ApiResponse<UserProfileResponse>  (whole user refreshed)
export const addChild = (payload) =>
  apiClient.post('/account/children', payload);

// ── DELETE /api/account/children ─────────────────────────────
// Body: { name, age }  (identifies the child to remove)
// Returns: ApiResponse<UserProfileResponse>
export const removeChild = (payload) =>
  apiClient.delete('/account/children', { data: payload });
