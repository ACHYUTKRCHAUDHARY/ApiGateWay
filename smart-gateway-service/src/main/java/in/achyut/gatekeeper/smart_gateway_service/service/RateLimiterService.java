package in.achyut.gatekeeper.smart_gateway_service.service;

import in.achyut.gatekeeper.smart_gateway_service.config.GatewayProperties;
import in.achyut.gatekeeper.smart_gateway_service.model.RateLimitResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class RateLimiterService {

    private final GatewayProperties properties;
    private final StringRedisTemplate redisTemplate;

    // In-memory fallback sliding window counter
    private final Map<String, WindowCounter> localCounters = new ConcurrentHashMap<>();

    @Autowired
    public RateLimiterService(GatewayProperties properties,
                              @Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.properties = properties;
        this.redisTemplate = redisTemplate;
    }

    public RateLimitResult checkRateLimit(String routeId, String clientIp, int requestsPerMinute) {
        if (requestsPerMinute <= 0) {
            return new RateLimitResult(true, Long.MAX_VALUE, 0, requestsPerMinute);
        }

        long currentMinute = Instant.now().getEpochSecond() / 60;
        String key = "ratelimit:" + routeId + ":" + clientIp + ":" + currentMinute;
        long resetSeconds = 60 - (Instant.now().getEpochSecond() % 60);

        if (properties.isRedisEnabled() && redisTemplate != null) {
            try {
                Long currentCount = redisTemplate.opsForValue().increment(key);
                if (currentCount != null && currentCount == 1) {
                    redisTemplate.expire(key, java.time.Duration.ofSeconds(70));
                }

                if (currentCount != null) {
                    boolean allowed = currentCount <= requestsPerMinute;
                    long remaining = Math.max(0, requestsPerMinute - currentCount);
                    return new RateLimitResult(allowed, remaining, resetSeconds, requestsPerMinute);
                }
            } catch (Exception e) {
                log.debug("Redis rate limiter unavailable, falling back to local in-memory: {}", e.getMessage());
            }
        }

        // Local In-Memory Fallback
        WindowCounter counter = localCounters.compute(key, (k, existing) -> {
            if (existing == null || existing.minute != currentMinute) {
                return new WindowCounter(currentMinute, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        // Periodic cleanup of stale local counters
        if (localCounters.size() > 5000) {
            localCounters.entrySet().removeIf(entry -> entry.getValue().minute < currentMinute - 2);
        }

        int current = counter.count.get();
        boolean allowed = current <= requestsPerMinute;
        long remaining = Math.max(0, requestsPerMinute - current);

        return new RateLimitResult(allowed, remaining, resetSeconds, requestsPerMinute);
    }

    private static class WindowCounter {
        final long minute;
        final AtomicInteger count;

        WindowCounter(long minute, AtomicInteger count) {
            this.minute = minute;
            this.count = count;
        }
    }
}

