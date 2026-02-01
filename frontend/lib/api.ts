/**
 * API Client for GovConnect Backend
 * 
 * Centralized fetch helper to communicate with FastAPI backend.
 */

import { API_BASE_URL } from './api-config';

const API_BASE = API_BASE_URL;

interface FetchOptions extends RequestInit {
    timeout?: number;
}

/**
 * Fetch data from the backend API with automatic retries.
 * 
 * @param endpoint - API endpoint (e.g., '/api/schemes')
 * @param options - Fetch options
 * @param retries - Number of retries (default 2)
 * @returns JSON response from the API
 */
export async function fetchFromBackend<T>(
    endpoint: string,
    options: FetchOptions = {},
    retries = 2
): Promise<T> {
    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // If it's a 5xx error or 429, try retrying if we have retries left
            if ((response.status >= 500 || response.status === 429) && retries > 0) {
                console.warn(`API Error ${response.status}. Retrying... (${retries} left)`);
                return fetchFromBackend<T>(endpoint, options, retries - 1);
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        // Retry on network errors or timeouts
        if (retries > 0) {
            console.warn(`Network error or timeout. Retrying... (${retries} left)`, error);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchFromBackend<T>(endpoint, options, retries - 1);
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - the backend may be waking up, please try again in a moment');
        }

        console.error(`Final API failure for ${endpoint}:`, error);
        throw error;
    }
}

/**
 * POST request to backend API.
 */
export async function postToBackend<T>(
    endpoint: string,
    body: unknown,
    options: FetchOptions = {}
): Promise<T> {
    return fetchFromBackend<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * Get backend API base URL (for external use if needed).
 */
export function getApiBaseUrl(): string {
    return API_BASE;
}
