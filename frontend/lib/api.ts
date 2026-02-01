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
 * Fetch data from the backend API.
 * 
 * @param endpoint - API endpoint (e.g., '/api/schemes')
 * @param options - Fetch options
 * @returns JSON response from the API
 */
export async function fetchFromBackend<T>(
    endpoint: string,
    options: FetchOptions = {}
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
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
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
