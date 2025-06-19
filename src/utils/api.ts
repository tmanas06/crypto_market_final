// API Rate Limiter, Cache, and Request Queue Utility

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
const RATE_LIMIT_DELAY = 3000; // Increased to 3 seconds between requests to be safer
const MAX_RETRIES = 2; // Reduced max retries to prevent long waits
const INITIAL_RETRY_DELAY = 2000; // 2 seconds initial retry delay

// CORS proxy URL - you can use a public CORS proxy or set up your own
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const USE_CORS_PROXY = false; // Set to true if you want to use CORS proxy

// CoinGecko API status
let coingeckoStatus: {
  lastRequest: number;
  requestsInLastMinute: number;
} = {
  lastRequest: 0,
  requestsInLastMinute: 0
};

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface RequestQueueItem {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  url: string;
  options?: RequestInit;
  retries: number;
  delay: number;
}

const cache: Record<string, CacheEntry> = {};
const requestQueue: RequestQueueItem[] = [];
let isProcessingQueue = false;
let lastRequestTime = 0;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    while (requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      // Wait if needed to respect rate limit
      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
      }
      
      const item = requestQueue.shift();
      if (!item) continue;
      
      try {
        lastRequestTime = Date.now();
        const response = await fetchWithRetry(item.url, item.options, item.retries, item.delay);
        item.resolve(response);
      } catch (error) {
        item.reject(error);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
};

const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = MAX_RETRIES,
  retryDelay = INITIAL_RETRY_DELAY
): Promise<any> => {
  const now = Date.now();
  const isCoinGecko = url.includes('api.coingecko.com');
  
  // Reset counter if more than a minute has passed
  if (now - coingeckoStatus.lastRequest > 60000) {
    coingeckoStatus.requestsInLastMinute = 0;
  }
  
  // Check if we're hitting CoinGecko's rate limit (30-50 requests/minute)
  if (isCoinGecko && coingeckoStatus.requestsInLastMinute >= 25) {
    const timeToWait = 60000 - (now - coingeckoStatus.lastRequest);
    if (timeToWait > 0) {
      console.warn(`Approaching CoinGecko rate limit. Waiting ${Math.ceil(timeToWait / 1000)}s...`);
      await delay(timeToWait);
      coingeckoStatus.requestsInLastMinute = 0;
    }
  }

  try {
    const targetUrl = USE_CORS_PROXY && isCoinGecko ? `${CORS_PROXY}${url}` : url;
    
    const response = await fetch(targetUrl, {
      ...options,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(isCoinGecko ? {
          'Accept': 'application/json',
          'User-Agent': 'CryptoMarkets/1.0 (contact@your-email.com)'
        } : {}),
        ...(options?.headers || {})
      }
    });

    // Update CoinGecko request tracking
    if (isCoinGecko) {
      coingeckoStatus.lastRequest = now;
      coingeckoStatus.requestsInLastMinute++;
    }

    // Handle rate limiting with retry-after header if available
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 30000) : retryDelay;
      
      if (retries > 0) {
        console.warn(`Rate limited. Retrying in ${waitTime}ms... (${retries} retries left)`);
        await delay(waitTime);
        return fetchWithRetry(url, options, retries - 1, Math.min(waitTime * 2, 30000));
      }
      throw new Error(`Rate limit exceeded: ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    
    // Don't retry on CORS errors as they won't resolve with retries
    if (error instanceof Error && error.message.includes('Failed to fetch') && retries > 0) {
      console.warn('Possible CORS error. Consider enabling CORS proxy or using a different endpoint.');
      if (retries > 1) { // Only retry once for CORS errors
        await delay(retryDelay);
        return fetchWithRetry(url, options, 1, retryDelay * 2);
      }
    } else if (retries > 0) {
      await delay(retryDelay);
      return fetchWithRetry(url, options, retries - 1, Math.min(retryDelay * 2, 30000));
    }
    
    throw error;
  }
};

export const fetchWithRateLimit = async <T>(
  url: string,
  cacheKey: string,
  retries = MAX_RETRIES,
  initialDelay = INITIAL_RETRY_DELAY
): Promise<T> => {
  // Check cache first
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data as T;
  }

  try {
    // Queue the request
    const response = await new Promise((resolve, reject) => {
      requestQueue.push({
        resolve,
        reject,
        url,
        retries,
        delay: initialDelay
      });
      processQueue().catch(console.error);
    });
    
    // Update cache
    cache[cacheKey] = {
      data: response,
      timestamp: Date.now()
    };
    
    return response as T;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};
