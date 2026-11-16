package in.achyut.gatekeeper.smart_gateway_service.controller;

import in.achyut.gatekeeper.smart_gateway_service.model.AccessLogEvent;
import in.achyut.gatekeeper.smart_gateway_service.model.CachedResponse;
import in.achyut.gatekeeper.smart_gateway_service.model.RateLimitResult;
import in.achyut.gatekeeper.smart_gateway_service.model.RouteRule;
import in.achyut.gatekeeper.smart_gateway_service.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class GatewayProxyController {

    private final RouteCacheService routeCacheService;
    private final RateLimiterService rateLimiterService;
    private final IdempotencyService idempotencyService;
    private final HeaderTransformationService headerTransformationService;
    private final ReverseProxyService reverseProxyService;
    private final TrafficLoggerService trafficLoggerService;

    @RequestMapping(value = {"/gateway/**", "/api/**", "/echo/**", "/delay/**"})
    public ResponseEntity<byte[]> proxy(HttpServletRequest request,
                                       @RequestBody(required = false) byte[] bodyBytes) {
        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        // 1. Match Route
        Optional<RouteCacheService.RouteMatch> matchOpt = routeCacheService.matchRoute(requestPath);
        if (matchOpt.isEmpty()) {
            String errorMsg = "{\"error\":\"Not Found\",\"message\":\"No active gateway route matched path: " + requestPath + "\"}";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-Gateway-Request-Id", requestId);

            trafficLoggerService.logTraffic(AccessLogEvent.builder()
                    .requestId(requestId)
                    .timestamp(Instant.now())
                    .routeId("unmatched")
                    .organizationId(null)
                    .clientIp(clientIp)
                    .httpMethod(method)
                    .requestPath(requestPath)
                    .targetUrl("none")
                    .statusCode(404)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .userAgent(userAgent)
                    .errorMessage("Route not found")
                    .build());

            return new ResponseEntity<>(errorMsg.getBytes(), headers, HttpStatus.NOT_FOUND);
        }

        RouteCacheService.RouteMatch match = matchOpt.get();
        RouteRule route = match.getRoute();

        // 2. Validate Allowed HTTP Methods
        if (route.getAllowedMethods() != null && !route.getAllowedMethods().isEmpty()
                && !route.getAllowedMethods().contains(method.toUpperCase())) {
            String errorMsg = "{\"error\":\"Method Not Allowed\",\"message\":\"Method " + method + " not allowed for route " + route.getRouteId() + "\"}";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-Gateway-Request-Id", requestId);

            trafficLoggerService.logTraffic(AccessLogEvent.builder()
                    .requestId(requestId)
                    .timestamp(Instant.now())
                    .routeId(route.getRouteId())
                    .organizationId(route.getOrganizationId())
                    .clientIp(clientIp)
                    .httpMethod(method)
                    .requestPath(requestPath)
                    .targetUrl(route.getTargetBaseUrl())
                    .statusCode(405)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .userAgent(userAgent)
                    .errorMessage("Method not allowed")
                    .build());

            return new ResponseEntity<>(errorMsg.getBytes(), headers, HttpStatus.METHOD_NOT_ALLOWED);
        }

        // 3. Rate Limiting Check
        int rpm = route.getRequestsPerMinute() != null ? route.getRequestsPerMinute() : 120;
        RateLimitResult rateLimit = rateLimiterService.checkRateLimit(route.getRouteId(), clientIp, rpm);
        if (!rateLimit.isAllowed()) {
            String errorMsg = "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded for route " + route.getRouteId() + ". Limit: " + rpm + " req/min.\"}";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-Gateway-Request-Id", requestId);
            headers.set("Retry-After", String.valueOf(rateLimit.getResetSeconds()));
            headers.set("X-RateLimit-Limit", String.valueOf(rateLimit.getLimit()));
            headers.set("X-RateLimit-Remaining", "0");
            headers.set("X-RateLimit-Reset", String.valueOf(rateLimit.getResetSeconds()));

            trafficLoggerService.logTraffic(AccessLogEvent.builder()
                    .requestId(requestId)
                    .timestamp(Instant.now())
                    .routeId(route.getRouteId())
                    .organizationId(route.getOrganizationId())
                    .clientIp(clientIp)
                    .httpMethod(method)
                    .requestPath(requestPath)
                    .targetUrl(route.getTargetBaseUrl())
                    .statusCode(429)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .userAgent(userAgent)
                    .errorMessage("Rate limit exceeded")
                    .build());

            return new ResponseEntity<>(errorMsg.getBytes(), headers, HttpStatus.TOO_MANY_REQUESTS);
        }

        // 4. Idempotency Check
        String idempotencyKey = getIdempotencyKey(request);
        boolean isIdempotencyActive = Boolean.TRUE.equals(route.getIdempotencyEnabled()) && idempotencyKey != null && !method.equalsIgnoreCase("GET");

        if (isIdempotencyActive) {
            CachedResponse cached = idempotencyService.getCachedResponse(route.getRouteId(), idempotencyKey);
            if (cached != null) {
                HttpHeaders cachedHeaders = new HttpHeaders();
                if (cached.getHeaders() != null) {
                    cachedHeaders.putAll(cached.getHeaders());
                }
                cachedHeaders.set("X-Gateway-Request-Id", requestId);
                cachedHeaders.set("X-Gateway-Idempotent-Replay", "true");

                trafficLoggerService.logTraffic(AccessLogEvent.builder()
                        .requestId(requestId)
                        .timestamp(Instant.now())
                        .routeId(route.getRouteId())
                        .organizationId(route.getOrganizationId())
                        .clientIp(clientIp)
                        .httpMethod(method)
                        .requestPath(requestPath)
                        .targetUrl(route.getTargetBaseUrl())
                        .statusCode(cached.getStatusCode())
                        .latencyMs(System.currentTimeMillis() - startTime)
                        .userAgent(userAgent)
                        .errorMessage("Idempotent replay")
                        .build());

                return new ResponseEntity<>(cached.getBody(), cachedHeaders, HttpStatus.valueOf(cached.getStatusCode()));
            }

            boolean marked = idempotencyService.markInFlight(route.getRouteId(), idempotencyKey);
            if (!marked) {
                String errorMsg = "{\"error\":\"Conflict\",\"message\":\"A request with idempotency key '" + idempotencyKey + "' is currently being processed.\"}";
                HttpHeaders headers = new HttpHeaders();
                headers.set("Content-Type", "application/json");
                return new ResponseEntity<>(errorMsg.getBytes(), headers, HttpStatus.CONFLICT);
            }
        }

        // 5. Construct Target URL
        String targetUrl = buildTargetUrl(route, match.getRemainingPath(), request.getQueryString());

        // 6. Transform Request Headers
        HttpHeaders upstreamHeaders = headerTransformationService.transformRequestHeaders(request, route, requestId);

        // 7. Execute Upstream Forwarding
        ResponseEntity<byte[]> upstreamResponse;
        try {
            upstreamResponse = reverseProxyService.forward(
                    HttpMethod.valueOf(method),
                    targetUrl,
                    upstreamHeaders,
                    bodyBytes,
                    route
            );
        } catch (Exception e) {
            if (isIdempotencyActive) {
                idempotencyService.releaseInFlight(route.getRouteId(), idempotencyKey);
            }
            throw e;
        }

        long latencyMs = System.currentTimeMillis() - startTime;

        // 8. Transform Response Headers
        HttpHeaders finalHeaders = headerTransformationService.transformResponseHeaders(
                upstreamResponse.getHeaders(), route, requestId, latencyMs
        );
        finalHeaders.set("X-RateLimit-Limit", String.valueOf(rateLimit.getLimit()));
        finalHeaders.set("X-RateLimit-Remaining", String.valueOf(rateLimit.getRemaining()));
        finalHeaders.set("X-RateLimit-Reset", String.valueOf(rateLimit.getResetSeconds()));

        // 9. Cache Idempotent Response if successful
        if (isIdempotencyActive) {
            if (upstreamResponse.getStatusCode().is2xxSuccessful() || upstreamResponse.getStatusCode().is3xxRedirection()) {
                idempotencyService.cacheResponse(route.getRouteId(), idempotencyKey, CachedResponse.builder()
                        .statusCode(upstreamResponse.getStatusCode().value())
                        .headers(finalHeaders)
                        .body(upstreamResponse.getBody())
                        .build());
            } else {
                idempotencyService.releaseInFlight(route.getRouteId(), idempotencyKey);
            }
        }

        // 10. Emit Access Log
        trafficLoggerService.logTraffic(AccessLogEvent.builder()
                .requestId(requestId)
                .timestamp(Instant.now())
                .routeId(route.getRouteId())
                .organizationId(route.getOrganizationId())
                .clientIp(clientIp)
                .httpMethod(method)
                .requestPath(requestPath)
                .targetUrl(targetUrl)
                .statusCode(upstreamResponse.getStatusCode().value())
                .latencyMs(latencyMs)
                .userAgent(userAgent)
                .errorMessage(upstreamResponse.getStatusCode().isError() ? upstreamResponse.getStatusCode().toString() : null)
                .build());

        return new ResponseEntity<>(upstreamResponse.getBody(), finalHeaders, upstreamResponse.getStatusCode());
    }

    private String buildTargetUrl(RouteRule route, String remainingPath, String queryString) {
        String base = route.getTargetBaseUrl();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }

        String prefix = route.getTargetPathPrefix() != null ? route.getTargetPathPrefix().trim() : "";
        if (prefix.startsWith("/")) {
            prefix = prefix.substring(1);
        }
        if (prefix.endsWith("/")) {
            prefix = prefix.substring(0, prefix.length() - 1);
        }

        String remaining = remainingPath != null ? remainingPath.trim() : "";
        if (remaining.startsWith("/")) {
            remaining = remaining.substring(1);
        }

        StringBuilder url = new StringBuilder(base);
        if (!prefix.isEmpty()) {
            url.append("/").append(prefix);
        }
        if (!remaining.isEmpty()) {
            url.append("/").append(remaining);
        }

        if (queryString != null && !queryString.isBlank()) {
            url.append("?").append(queryString);
        }

        return url.toString();
    }

    private String getIdempotencyKey(HttpServletRequest request) {
        String key = request.getHeader("Idempotency-Key");
        if (key == null || key.isBlank()) {
            key = request.getHeader("X-Idempotency-Key");
        }
        return (key != null && !key.isBlank()) ? key.trim() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

