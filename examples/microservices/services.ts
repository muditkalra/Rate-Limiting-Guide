/**
 * Microservices Rate Limiting Example
 * 
 * Demonstrates rate limiting between microservices
 */

import express from 'express';
import { TokenBucketLimiter, SlidingWindowCounterLimiter } from '../../implementations/typescript/rate-limiter';

// ============================================================================
// Service A - User Service
// ============================================================================

const userServiceApp = express();
userServiceApp.use(express.json());

// Rate limit for inter-service communication
const serviceRateLimiter = new Map<string, TokenBucketLimiter>();

function getServiceLimiter(serviceId: string): TokenBucketLimiter {
  if (!serviceRateLimiter.has(serviceId)) {
    // 100 requests/second per service
    serviceRateLimiter.set(serviceId, new TokenBucketLimiter(100, 100));
  }
  return serviceRateLimiter.get(serviceId)!;
}

userServiceApp.use((req, res, next) => {
  const serviceId = req.headers['x-service-id'] as string || 'unknown';
  const limiter = getServiceLimiter(serviceId);

  const result = limiter.allowRequest();

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Service rate limit exceeded',
      service: serviceId,
      retryAfter: result.retryAfter
    });
  }

  next();
});

// Mock user data
const users = new Map([
  ['1', { id: '1', name: 'Alice', email: 'alice@example.com' }],
  ['2', { id: '2', name: 'Bob', email: 'bob@example.com' }],
  ['3', { id: '3', name: 'Charlie', email: 'charlie@example.com' }]
]);

userServiceApp.get('/users/:id', (req, res) => {
  const user = users.get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// ============================================================================
// Service B - Order Service
// ============================================================================

const orderServiceApp = express();
orderServiceApp.use(express.json());

// Circuit breaker for calling User Service
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private isOpen = false;
  private threshold = 5;
  private timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.isOpen = false;
        this.failures = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.isOpen = true;
      }
      throw error;
    }
  }
}

const userServiceCircuitBreaker = new CircuitBreaker();

// Rate limiter for external API calls
const externalApiLimiter = new SlidingWindowCounterLimiter(60, 50);

async function fetchUserData(userId: string) {
  // Check rate limit before making call
  const rateLimitResult = externalApiLimiter.allowRequest();
  if (!rateLimitResult.allowed) {
    throw new Error('User service rate limit exceeded');
  }

  // Use circuit breaker
  return await userServiceCircuitBreaker.execute(async () => {
    const response = await fetch(`http://localhost:3001/users/${userId}`, {
      headers: {
        'X-Service-Id': 'order-service'
      },
    });
    return (await response.json()).data;
  });
}

// Mock order data
const orders = new Map([
  ['1', { id: '1', userId: '1', total: 99.99, items: 3 }],
  ['2', { id: '2', userId: '2', total: 149.99, items: 5 }]
]);

orderServiceApp.get('/orders/:id', async (req, res) => {
  const order = orders.get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  try {
    // Fetch user data from User Service
    const user = await fetchUserData(order.userId);

    res.json({
      ...order,
      user
    });
  } catch (error: any) {
    console.error('Error fetching user:', error.message);

    // Return order without user data
    res.json({
      ...order,
      user: null,
      warning: 'User service unavailable'
    });
  }
});

// ============================================================================
// Service C - API Gateway
// ============================================================================

const gatewayApp = express();
gatewayApp.use(express.json());

// Rate limit for end users
const userRateLimiter = new Map<string, SlidingWindowCounterLimiter>();

function getUserLimiter(userId: string): SlidingWindowCounterLimiter {
  if (!userRateLimiter.has(userId)) {
    // 100 requests/minute per user
    userRateLimiter.set(userId, new SlidingWindowCounterLimiter(60, 100));
  }
  return userRateLimiter.get(userId)!;
}

gatewayApp.use((req, res, next) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous';
  const limiter = getUserLimiter(userId);

  const result = limiter.allowRequest();

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: result.retryAfter
    });
  }

  next();
});

// Proxy to services
gatewayApp.get('/api/users/:id', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3001/users/${req.params.id}`, {
      headers: { 'X-Service-Id': 'api-gateway' }
    });
    const data = await response.json()
    res.json(data);
  } catch (error: any) {
    if (error.response?.status === 429) {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

gatewayApp.get('/api/orders/:id', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3002/orders/${req.params.id}`, {
      headers: { 'X-Service-Id': 'api-gateway' }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    if (error.response?.status === 429) {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Start All Services
// ============================================================================

async function startServices() {
  // Start User Service
  userServiceApp.listen(3001, () => {
    console.log('✓ User Service running on port 3001');
  });

  // Start Order Service
  orderServiceApp.listen(3002, () => {
    console.log('✓ Order Service running on port 3002');
  });

  // Start API Gateway
  gatewayApp.listen(3000, () => {
    console.log('✓ API Gateway running on port 3000');
    console.log('\nMicroservices Architecture:');
    console.log('  Gateway (3000) → User Service (3001)');
    console.log('                → Order Service (3002) → User Service (3001)');
    console.log('\nRate Limits:');
    console.log('  End Users: 100 req/minute');
    console.log('  Inter-service: 100 req/second');
    console.log('  External API calls: 50 req/minute');
    console.log('\nTest with:');
    console.log('  curl -H "X-User-Id: user123" http://localhost:3000/api/users/1');
    console.log('  curl -H "X-User-Id: user123" http://localhost:3000/api/orders/1');
  });
}

if (require.main === module) {
  startServices();
}

export { userServiceApp, orderServiceApp, gatewayApp };
