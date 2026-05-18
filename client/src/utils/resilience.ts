/**
 * Architectural Resilience Patterns for Client-Side Operations
 * Based on System Design Reliability & Fault Tolerance Principles
 */

/**
 * Executes a function with Exponential Backoff and Jitter.
 * 
 * Prevents "thundering herd" issues by spreading out retries after a service failure.
 * 
 * @param operation The async function to execute
 * @param maxRetries Maximum number of retry attempts
 * @param baseDelayMs Base delay in milliseconds
 * @param maxDelayMs Maximum allowed delay
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 200,
  maxDelayMs: number = 5000
): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error; // Fail after max retries
      }
      
      // Calculate delay with exponential backoff: base * 2^attempt
      const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      
      // Add jitter to prevent synchronized retries across multiple clients
      const jitter = Math.random() * 200; 
      const finalDelay = exponentialDelay + jitter;
      
      console.warn(`[Resilience] Operation failed. Retrying in ${Math.round(finalDelay)}ms (Attempt ${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  throw new Error("Retry logic failed");
}

/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by short-circuiting calls to a failing service.
 * Transitions: CLOSED (normal) -> OPEN (fails fast) -> HALF-OPEN (probe) -> CLOSED
 */
export class CircuitBreaker {
  private failureThreshold: number;
  private resetTimeoutMs: number;
  
  private failureCount: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt: number = Date.now();

  constructor(failureThreshold: number = 3, resetTimeoutMs: number = 15000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
        console.info('[Circuit Breaker] Transitioning to HALF_OPEN to probe service.');
      } else {
        throw new Error('Circuit Breaker is OPEN. Request short-circuited to prevent cascading failure.');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.info('[Circuit Breaker] Probe successful. Transitioning to CLOSED.');
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
      console.error(`[Circuit Breaker] Threshold reached (${this.failureThreshold}). Transitioning to OPEN for ${this.resetTimeoutMs}ms.`);
    }
  }
}

// Export a singleton instance for global API protection
export const apiCircuitBreaker = new CircuitBreaker();

/**
 * Bulkhead Pattern
 * 
 * Isolates operations into pools (bulkheads) to prevent a failure in one area 
 * of the application from consuming all available resources (like browser connection limits).
 */
export class Bulkhead {
  private maxConcurrent: number;
  private currentConcurrent: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.currentConcurrent >= this.maxConcurrent) {
      console.warn(`[Bulkhead] Max concurrency (${this.maxConcurrent}) reached. Queueing request...`);
      // Wait in line
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.currentConcurrent++;
    try {
      return await operation();
    } finally {
      this.currentConcurrent--;
      if (this.queue.length > 0) {
        // Dequeue next operation
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}

// Global bulkhead to prevent exhausting all network connections for heavy endpoints like search/filters
export const heavyApiBulkhead = new Bulkhead(3);
