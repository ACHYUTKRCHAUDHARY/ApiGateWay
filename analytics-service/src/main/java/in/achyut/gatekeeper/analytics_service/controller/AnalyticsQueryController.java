package in.achyut.gatekeeper.analytics_service.controller;

import in.achyut.gatekeeper.analytics_service.dto.AnalyticsOverviewDto;
import in.achyut.gatekeeper.analytics_service.dto.RouteMetricsDto;
import in.achyut.gatekeeper.analytics_service.dto.StatusCodeCountDto;
import in.achyut.gatekeeper.analytics_service.dto.TimeseriesPointDto;
import in.achyut.gatekeeper.analytics_service.model.AccessLog;
import in.achyut.gatekeeper.analytics_service.service.AnalyticsQueryService;
import in.achyut.gatekeeper.analytics_service.service.AnalyticsStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsQueryController {

    private final AnalyticsQueryService queryService;
    private final AnalyticsStorageService storageService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDto> getOverview(
            @RequestParam(defaultValue = "1h") String timeRange) {
        return ResponseEntity.ok(queryService.getOverview(timeRange));
    }

    @GetMapping("/timeseries")
    public ResponseEntity<List<TimeseriesPointDto>> getTimeseries(
            @RequestParam(defaultValue = "1h") String timeRange) {
        return ResponseEntity.ok(queryService.getTimeseries(timeRange));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteMetricsDto>> getRouteMetrics(
            @RequestParam(defaultValue = "1h") String timeRange) {
        return ResponseEntity.ok(queryService.getRouteMetrics(timeRange));
    }

    @GetMapping("/status-codes")
    public ResponseEntity<List<StatusCodeCountDto>> getStatusCodeDistribution(
            @RequestParam(defaultValue = "1h") String timeRange) {
        return ResponseEntity.ok(queryService.getStatusCodeDistribution(timeRange));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AccessLog>> getRecentLogs(
            @RequestParam(required = false) String routeId,
            @RequestParam(required = false) Integer statusCode,
            @RequestParam(defaultValue = "100") Integer limit) {
        return ResponseEntity.ok(storageService.queryLogs(null, routeId, statusCode, limit));
    }

    @PostMapping("/seed-sample-data")
    public ResponseEntity<Map<String, Object>> seedSampleData() {
        Random random = new Random();
        String[] routes = {"users-service-route", "echo-service-route", "delay-test-route", "orders-api-route"};
        int[] statuses = {200, 200, 200, 200, 201, 204, 400, 404, 429, 500, 502};
        String[] methods = {"GET", "GET", "GET", "POST", "PUT", "DELETE"};

        for (int i = 0; i < 50; i++) {
            String route = routes[random.nextInt(routes.length)];
            int status = statuses[random.nextInt(statuses.length)];
            String method = methods[random.nextInt(methods.length)];
            long latency = (status == 429) ? 2 : (status == 502) ? 1200 : random.nextInt(120) + 15;
            long offsetMinutes = random.nextInt(45);

            storageService.store(AccessLog.builder()
                    .requestId(UUID.randomUUID().toString())
                    .timestamp(Instant.now().minusSeconds(offsetMinutes * 60 + random.nextInt(60)))
                    .routeId(route)
                    .organizationId(1L)
                    .clientIp("192.168.1." + (random.nextInt(20) + 10))
                    .httpMethod(method)
                    .requestPath("/gateway/api/v1/" + route.replace("-route", ""))
                    .targetUrl("http://localhost:8081/api/v1/mock")
                    .statusCode(status)
                    .latencyMs(latency)
                    .userAgent("Gatekeeper-Client/1.0")
                    .errorMessage(status >= 400 ? "HTTP " + status : null)
                    .build());
        }

        return ResponseEntity.ok(Map.of("message", "Seeded 50 sample logs successfully", "totalCount", storageService.getTotalCount()));
    }
}

