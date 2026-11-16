package in.achyut.gatekeeper.smart_gateway_service.service;

import in.achyut.gatekeeper.smart_gateway_service.config.GatewayProperties;
import in.achyut.gatekeeper.smart_gateway_service.model.CachedResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class IdempotencyService {

    private final GatewayProperties properties;
    private final RedisTemplate<String, Object> redisTemplate;

    // In-memory fallback
    private final Map<String, CachedResponse> localCache = new ConcurrentHashMap<>();
    private final Map<String, Long> localInFlight = new ConcurrentHashMap<>();

    @Autowired
    public IdempotencyService(GatewayProperties properties,
                             @Autowired(required = false) RedisTemplate<String, Object> redisTemplate) {
        this.properties = properties;
        this.redisTemplate = redisTemplate;
    }

    public CachedResponse getCachedResponse(String routeId, String idempotencyKey) {
        String key = "idemp:" + routeId + ":" + idempotencyKey;

        if (properties.isRedisEnabled() && redisTemplate != null) {
            try {
                Object val = redisTemplate.opsForValue().get(key);
                if (val instanceof CachedResponse) {
                    return (CachedResponse) val;
                }
            } catch (Exception e) {
                log.debug("Redis idempotency read failed, falling back to local: {}", e.getMessage());
            }
        }

        CachedResponse cached = localCache.get(key);
        if (cached != null) {
            // Check 10-minute expiry
            if (System.currentTimeMillis() - cached.getCachedAt() < 600000) {
                return cached;
            } else {
                localCache.remove(key);
            }
        }
        return null;
    }

    public boolean markInFlight(String routeId, String idempotencyKey) {
        String key = "idemp:inflight:" + routeId + ":" + idempotencyKey;

        if (properties.isRedisEnabled() && redisTemplate != null) {
            try {
                Boolean set = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSING", 60, TimeUnit.SECONDS);
                if (set != null && !set) {
                    return false;
                }
            } catch (Exception e) {
                log.debug("Redis in-flight check failed: {}", e.getMessage());
            }
        }

        Long existing = localInFlight.putIfAbsent(key, System.currentTimeMillis());
        if (existing != null && (System.currentTimeMillis() - existing < 60000)) {
            return false;
        }
        return true;
    }

    public void cacheResponse(String routeId, String idempotencyKey, CachedResponse response) {
        String key = "idemp:" + routeId + ":" + idempotencyKey;
        String inflightKey = "idemp:inflight:" + routeId + ":" + idempotencyKey;

        response.setCachedAt(System.currentTimeMillis());

        if (properties.isRedisEnabled() && redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, response, 10, TimeUnit.MINUTES);
                redisTemplate.delete(inflightKey);
                return;
            } catch (Exception e) {
                log.debug("Redis idempotency write failed: {}", e.getMessage());
            }
        }

        localCache.put(key, response);
        localInFlight.remove(inflightKey);
    }

    public void releaseInFlight(String routeId, String idempotencyKey) {
        String inflightKey = "idemp:inflight:" + routeId + ":" + idempotencyKey;
        if (properties.isRedisEnabled() && redisTemplate != null) {
            try {
                redisTemplate.delete(inflightKey);
            } catch (Exception ignored) {}
        }
        localInFlight.remove(inflightKey);
    }
}

