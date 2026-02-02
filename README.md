# Rate Limiting: A Comprehensive Guide

A complete guide to rate limiting algorithms, implementations, and best practices for building robust APIs and distributed systems.

## 📚 Table of Contents

- [Introduction](#introduction)
- [Why Rate Limiting?](#why-rate-limiting)
- [Core Concepts](#core-concepts)
- [Algorithms](#algorithms)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Distributed Rate Limiting](#distributed-rate-limiting)
- [Testing](#testing)
- [Resources](#resources)

## Introduction

Rate limiting is a critical technique for controlling the rate of requests sent or received by a system. It helps protect services from abuse, ensures fair resource allocation, and maintains system stability under high load.

This repository provides:
- Detailed explanations of rate limiting algorithms
- Production-ready code examples in multiple languages
- Best practices and patterns
- Distributed system considerations
- Testing strategies

## Why Rate Limiting?

Rate limiting serves several crucial purposes:

1. **DoS Protection**: Prevent abuse and denial-of-service attacks
2. **Cost Control**: Manage infrastructure costs by controlling usage
3. **Fair Usage**: Ensure equitable resource distribution among users
4. **Service Quality**: Maintain consistent performance for all users
5. **API Monetization**: Enable tiered pricing models
6. **Resource Management**: Protect downstream services and databases

## Core Concepts

### Key Terminology

- **Rate**: Maximum number of requests allowed in a time window
- **Window**: Time period for measuring the rate (e.g., per second, per minute)
- **Identifier**: Key used to track rate (e.g., user ID, IP address, API key)
- **Quota**: Total allowance over a longer period
- **Burst**: Temporary spike in traffic above the normal rate

### Common Response Patterns

When a rate limit is exceeded, systems typically:
- Return HTTP 429 (Too Many Requests)
- Include headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Optionally include `Retry-After` header

## Algorithms

This repository covers the following rate limiting algorithms:

### 1. Token Bucket
- [Algorithm Details](./docs/algorithms/token-bucket.md)
- [Implementation](./implementations/typescript/rate-limiter.ts)
- **Best for**: Smooth traffic with occasional bursts

### 2. Leaky Bucket
- [Algorithm Details](./docs/algorithms/leaky-bucket.md)
- [Implementation](./implementations/typescript/rate-limiter.ts)
- **Best for**: Enforcing strict output rates

### 3. Fixed Window Counter
- [Algorithm Details](./docs/algorithms/fixed-window.md)
- [Implementation](./implementations/typescript/rate-limiter.ts)
- **Best for**: Simple implementation, lower memory usage

### 4. Sliding Window Log
- [Algorithm Details](./docs/algorithms/sliding-window-log.md)
- [Implementation](./implementations/typescript/rate-limiter.ts)
- **Best for**: Precise rate limiting without boundary issues

### 5. Sliding Window Counter
- [Algorithm Details](./docs/algorithms/sliding-window-counter.md)
- [Implementation](./implementations/typescript/rate-limiter.ts)
- **Best for**: Balance between accuracy and efficiency

### 6. Concurrent Requests Limiter
- [Algorithm Details](./docs/algorithms/concurrent-requests.md)
- [Implementation](./implementations/typescript/rate-limiter.ts)
- **Best for**: Limiting simultaneous active requests

## Implementation Examples

Code examples are provided in multiple languages:

- [**Typescript**](./implementations/typescript): Express middleware, Redis-based
- [**Python**](./implementations/python): Using Redis, in-memory implementations


Each implementation includes:
- Complete working code
- Unit tests
- Performance benchmarks
- Configuration options


## Best Practices

### Design Principles

1. **Choose the right algorithm** for your use case
2. **Communicate limits clearly** through headers
3. **Implement graceful degradation**
4. **Monitor and alert** on rate limit hits
5. **Make limits configurable** without code changes
6. **Consider different dimensions**: per-user, per-IP, per-endpoint

### Production Considerations

- Use distributed rate limiting for multi-instance deployments
- Implement circuit breakers alongside rate limits
- Cache rate limit decisions when possible
- Log rate limit violations for analysis
- Provide webhooks or notifications for quota exhaustion

## Distributed Rate Limiting

When running multiple application instances, you need distributed rate limiting:

### Solutions

1. **Redis-based**: Centralized counter storage
2. **Memcached**: Simple distributed caching
3. **Dedicated Services**: Kong, Envoy, API Gateway
4. **Custom Solutions**: Consistent hashing, gossip protocols

See [Distributed Rate Limiting Guide](./docs/distributed.md) for details.

## Testing

### Testing Strategies

- Load testing to verify limits
- Unit tests for algorithm correctness
- Integration tests for distributed scenarios
- Chaos testing for failure scenarios

See [Testing Guide](./docs/testing.md) for examples.

## Directory Structure

```
.
├── README.md
├── docs/
│   ├── algorithms/
│   │   ├── token-bucket.md           ⭐ Complete token bucket guide
│   │   ├── leaky-bucket.md           ⭐ Complete leaky bucket guide
│   │   ├── fixed-window.md           ⭐ Complete fixed window guide
│   │   ├── sliding-window-log.md     ⭐ Complete sliding window log guide
│   │   ├── sliding-window-counter.md ⭐ Complete sliding window counter guide
│   │   └── concurrent-requests.md    ⭐ Concurrent requests limiter guide
│   ├── algorithm-comparison.md       ⭐ Detailed algorithm comparison
│   ├── getting-started.md            ⭐ Quick start guide
│   ├── distributed.md                ⭐ Distributed rate limiting guide
│   ├── best-practices.md             ⭐ Production best practices
│   └── testing.md                    ⭐ Comprehensive testing guide
├── implementations/
│   ├── typescript/
│   │   ├── rate-limiter.ts           ⭐ All 6 algorithms in TypeScript
│   │   ├── express-middleware.ts     ⭐ Express.js middleware
│   │   ├── redis-adapter.ts          ⭐ Redis distributed limiter
│   │   ├── examples.ts               ⭐ 12+ usage examples
│   │   ├── rate-limiter.test.ts      ⭐ Complete test suite
│   │   ├── package.json              ⭐ NPM configuration
│   │   └── tsconfig.json             ⭐ TypeScript config
│   └── python/
│       ├── rate_limiter.py           ⭐ All algorithms in Python
│       └── redis_rate_limiter.py     ⭐ Redis implementation
├── examples/
│   ├── api-gateway/
│   │   └── server.ts                 ⭐ Complete API gateway example
│   ├── microservices/
│   │   └── services.ts               ⭐ Microservices architecture example
│   └── web-application/
│       └── app.ts                    ⭐ Web application example
└── benchmarks/
    └── index.ts                      ⭐ Performance benchmarks
```

## Resources

### Articles & Papers
- [Generic Cell Rate Algorithm](https://en.wikipedia.org/wiki/Generic_cell_rate_algorithm)
- [Stripe's Rate Limiting Architecture](https://stripe.com/blog/rate-limiters)
- [Cloudflare's Rate Limiting](https://blog.cloudflare.com/counting-things-a-lot-of-different-things/)

### Tools & Libraries
- [redis-cell](https://github.com/brandur/redis-cell) - Redis module for rate limiting
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit) - Node.js middleware
- [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate) - Go rate limiter

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.


⭐ Star this repo if you find it helpful!
