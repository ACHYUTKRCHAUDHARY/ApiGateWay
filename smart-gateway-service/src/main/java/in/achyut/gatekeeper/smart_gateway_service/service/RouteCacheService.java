package in.achyut.gatekeeper.smart_gateway_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.achyut.gatekeeper.smart_gateway_service.config.GatewayProperties;
import in.achyut.gatekeeper.smart_gateway_service.model.HeaderRule;
import in.achyut.gatekeeper.smart_gateway_service.model.RouteRule;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteCacheService {

    private final GatewayProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final List<RouteRule> activeRoutes = new CopyOnWriteArrayList<>();
    private long lastSyncTimestamp = 0;

    @PostConstruct
    public void init() {
        refreshRoutes();
    }

    @Scheduled(fixedDelayString = "${gatekeeper.sync-interval-seconds:10}000")
    public void scheduledSync() {
        refreshRoutes();
    }

    public synchronized boolean refreshRoutes() {
        try {
            String baseUrl = properties.getManagementServiceUrl();
            if (baseUrl != null && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
                baseUrl = "http://" + baseUrl;
            }
            String url = baseUrl + "/api/v1/internal/gateway/routes";
            log.debug("Syncing routes from control plane: {}", url);

            String jsonResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (jsonResponse != null) {
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode dataNode = root.get("data");

                if (dataNode != null && dataNode.isArray()) {
                    List<RouteRule> loadedRoutes = new ArrayList<>();
                    for (JsonNode item : dataNode) {
                        Set<String> allowedMethods = new HashSet<>();
                        if (item.has("allowedMethods") && item.get("allowedMethods").isArray()) {
                            for (JsonNode m : item.get("allowedMethods")) {
                                allowedMethods.add(m.asText().toUpperCase());
                            }
                        }

                        List<HeaderRule> headerRules = new ArrayList<>();
                        if (item.has("headerRules") && item.get("headerRules").isArray()) {
                            for (JsonNode hr : item.get("headerRules")) {
                                headerRules.add(HeaderRule.builder()
                                        .direction(hr.has("direction") ? hr.get("direction").asText() : "REQUEST")
                                        .action(hr.has("action") ? hr.get("action").asText() : "ADD")
                                        .headerName(hr.has("headerName") ? hr.get("headerName").asText() : "")
                                        .headerValue(hr.has("headerValue") ? hr.get("headerValue").asText() : null)
                                        .build());
                            }
                        }

                        RouteRule rule = RouteRule.builder()
                                .id(item.has("id") ? item.get("id").asLong() : null)
                                .organizationId(item.has("organizationId") ? item.get("organizationId").asLong() : null)
                                .routeId(item.has("routeId") ? item.get("routeId").asText() : "")
                                .name(item.has("name") ? item.get("name").asText() : "")
                                .pathPattern(item.has("pathPattern") ? item.get("pathPattern").asText() : "")
                                .targetBaseUrl(item.has("targetBaseUrl") ? item.get("targetBaseUrl").asText() : "")
                                .targetPathPrefix(item.has("targetPathPrefix") ? item.get("targetPathPrefix").asText() : "")
                                .requestsPerMinute(item.has("requestsPerMinute") && !item.get("requestsPerMinute").isNull() ? item.get("requestsPerMinute").asInt() : 120)
                                .responseTimeoutMs(item.has("responseTimeoutMs") ? item.get("responseTimeoutMs").asInt() : 5000)
                                .idempotencyEnabled(item.has("idempotencyEnabled") && item.get("idempotencyEnabled").asBoolean())
                                .active(item.has("active") && item.get("active").asBoolean())
                                .configurationVersion(item.has("configurationVersion") ? item.get("configurationVersion").asLong() : 1L)
                                .allowedMethods(allowedMethods)
                                .headerRules(headerRules)
                                .build();

                        if (Boolean.TRUE.equals(rule.getActive())) {
                            loadedRoutes.add(rule);
                        }
                    }

                    activeRoutes.clear();
                    activeRoutes.addAll(loadedRoutes);
                    lastSyncTimestamp = System.currentTimeMillis();
                    log.info("Synced {} active routes into Smart Gateway cache", activeRoutes.size());
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("Could not sync routes from API Management service ({}): {}", properties.getManagementServiceUrl(), e.getMessage());
        }
        return false;
    }

    public Optional<RouteMatch> matchRoute(String requestPath) {
        // Strip leading /gateway if present for matching
        String cleanPath = requestPath;
        if (cleanPath.startsWith("/gateway")) {
            cleanPath = cleanPath.substring("/gateway".length());
            if (!cleanPath.startsWith("/")) {
                cleanPath = "/" + cleanPath;
            }
        }

        for (RouteRule route : activeRoutes) {
            String pattern = route.getPathPattern();
            if (pathMatcher.match(pattern, cleanPath)) {
                String remainingPath = pathMatcher.extractPathWithinPattern(pattern, cleanPath);
                return Optional.of(new RouteMatch(route, cleanPath, remainingPath));
            }
        }
        return Optional.empty();
    }

    public List<RouteRule> getActiveRoutes() {
        return Collections.unmodifiableList(activeRoutes);
    }

    public long getLastSyncTimestamp() {
        return lastSyncTimestamp;
    }

    @lombok.Value
    public static class RouteMatch {
        RouteRule route;
        String matchedPath;
        String remainingPath;
    }
}

