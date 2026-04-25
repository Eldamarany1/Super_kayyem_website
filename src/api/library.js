// ============================================================
//  src/api/library.js
//  API helpers for the user's personal library of owned stories.
//  Calls the dedicated /api/user-library/* endpoints.
// ============================================================
import apiClient from './client';

/**
 * GET /api/user-library/me
 * Returns the authenticated user's purchased stories with full
 * story details, purchase metadata, and HasReviewed flag.
 *
 * @returns {Promise<{ success: boolean, data: UserOwnedStoryResponseDto[] }>}
 */
export const getMyOwnedStories = () => apiClient.get('/user-library/me');

/**
 * POST /api/user-library/purchase
 * Records an immediate online payment purchase for one or more stories.
 *
 * @param {string[]} storyIds
 * @param {string}   paymentMethod  e.g. "CreditCard", "Instapay", "VodafoneCash"
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const recordPurchase = (storyIds, paymentMethod = 'Online') =>
  apiClient.post('/user-library/purchase', { storyIds, paymentMethod });
