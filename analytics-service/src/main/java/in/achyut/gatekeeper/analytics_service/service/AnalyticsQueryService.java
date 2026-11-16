package in.achyut.gatekeeper.analytics_service.service;

import in.achyut.gatekeeper.analytics_service.dto.AnalyticsOverviewDto;
import in.achyut.gatekeeper.analytics_service.dto.RouteMetricsDto;
import in.achyut.gatekeeper.analytics_service.dto.StatusCodeCountDto;
import in.achyut.gatekeeper.analytics_service.dto.TimeseriesPointDto;
import in.achyut.gatekeeper.analytics_service.model.AccessLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsQueryService {

    private final AnalyticsStorageService storageService;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.systemDefault());

    public AnalyticsOverviewDto getOverview(String timeRange) {
        Instant since = resolveSince(timeRange);
        List<AccessLog> logs = storageService.getAllLogsSince(since);

        if (logs.isEmpty()) {
            return AnalyticsOverviewDto.builder()
                    .totalRequests(0)
                    .successCount(0)
                    .errorCount(0)
                    .errorRatePercentage(0.0)
                    .avgLatencyMs(0.0)
                    .p95LatencyMs(0)
                    .p99LatencyMs(0)
                    .activeRoutesCount(0)
                    .build();
        }

        long total = logs.size();
        long success = logs.stream().filter(l -> l.getStatusCode() != null && l.getStatusCode() < 400).count();
        long error = total - success;
        double errorRate = total > 0 ? (double) error / total * 100.0 : 0.0;

        List<Long> latencies = logs.stream()
                .map(l -> l.getLatencyMs() != null ? l.getLatencyMs() : 0L)
                .sorted()
                .collect(Collectors.toList());

        double avgLatency = latencies.stream().mapToLong(Long::longValue).average().orElse(0.0);
        long p95 = latencies.get((int) Math.min(latencies.size() - 1, Math.floor(latencies.size() * 0.95)));
        long p99 = latencies.get((int) Math.min(latencies.size() - 1, Math.floor(latencies.size() * 0.99)));

        Set<String> uniqueRoutes = logs.stream()
                .map(AccessLog::getRouteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return AnalyticsOverviewDto.builder()
                .totalRequests(total)
                .successCount(success)
                .errorCount(error)
                .errorRatePercentage(Math.round(errorRate * 100.0) / 100.0)
                .avgLatencyMs(Math.round(avgLatency * 10.0) / 10.0)
                .p95LatencyMs(p95)
                .p99LatencyMs(p99)
                .activeRoutesCount(uniqueRoutes.size())
                .build();
    }

    public List<TimeseriesPointDto> getTimeseries(String timeRange) {
        Instant since = resolveSince(timeRange);
        List<AccessLog> logs = storageService.getAllLogsSince(since);

        long nowEpochSec = Instant.now().getEpochSecond();
        long sinceEpochSec = since.getEpochSecond();
        long bucketSizeSec = Math.max(60, (nowEpochSec - sinceEpochSec) / 20); // ~20 buckets

        Map<Long, List<AccessLog>> buckets = new TreeMap<>();
        long current = sinceEpochSec;
        while (current <= nowEpochSec) {
            buckets.put(current, new ArrayList<>());
            current += bucketSizeSec;
        }

        for (AccessLog log : logs) {
            if (log.getTimestamp() == null) continue;
            long epoch = log.getTimestamp().getEpochSecond();
            long bucketKey = sinceEpochSec + ((epoch - sinceEpochSec) / bucketSizeSec) * bucketSizeSec;
            buckets.computeIfAbsent(bucketKey, k -> new ArrayList<>()).add(log);
        }

        List<TimeseriesPointDto> points = new ArrayList<>();
        for (Map.Entry<Long, List<AccessLog>> entry : buckets.entrySet()) {
            Instant time = Instant.ofEpochSecond(entry.getKey());
            List<AccessLog> bucketLogs = entry.getValue();

            long total = bucketLogs.size();
            long error = bucketLogs.stream().filter(l -> l.getStatusCode() != null && l.getStatusCode() >= 400).count();
            long success = total - error;
            double avgLatency = bucketLogs.stream()
                    .mapToLong(l -> l.getLatencyMs() != null ? l.getLatencyMs() : 0L)
                    .average()
                    .orElse(0.0);

            points.add(TimeseriesPointDto.builder()
                    .timestamp(time)
                    .timeLabel(TIME_FORMATTER.format(time))
                    .totalRequests(total)
                    .successCount(success)
                    .errorCount(error)
                    .avgLatencyMs(Math.round(avgLatency * 10.0) / 10.0)
                    .build());
        }

        return points;
    }

    public List<RouteMetricsDto> getRouteMetrics(String timeRange) {
        Instant since = resolveSince(timeRange);
        List<AccessLog> logs = storageService.getAllLogsSince(since);

        Map<String, List<AccessLog>> grouped = logs.stream()
                .filter(l -> l.getRouteId() != null)
                .collect(Collectors.groupingBy(AccessLog::getRouteId));

        List<RouteMetricsDto> result = new ArrayList<>();
        for (Map.Entry<String, List<AccessLog>> entry : grouped.entrySet()) {
            String routeId = entry.getKey();
            List<AccessLog> routeLogs = entry.getValue();

            long total = routeLogs.size();
            long success = routeLogs.stream().filter(l -> l.getStatusCode() != null && l.getStatusCode() < 400).count();
            long error = total - success;
            double errorRate = total > 0 ? (double) error / total * 100.0 : 0.0;

            LongSummaryStatistics stats = routeLogs.stream()
                    .mapToLong(l -> l.getLatencyMs() != null ? l.getLatencyMs() : 0L)
                    .summaryStatistics();

            result.add(RouteMetricsDto.builder()
                    .routeId(routeId)
                    .totalRequests(total)
                    .successCount(success)
                    .errorCount(error)
                    .errorRatePercentage(Math.round(errorRate * 100.0) / 100.0)
                    .avgLatencyMs(Math.round(stats.getAverage() * 10.0) / 10.0)
                    .minLatencyMs(stats.getMin() == Long.MAX_VALUE ? 0 : stats.getMin())
                    .maxLatencyMs(stats.getMax() == Long.MIN_VALUE ? 0 : stats.getMax())
                    .build());
        }

        result.sort((a, b) -> Long.compare(b.getTotalRequests(), a.getTotalRequests()));
        return result;
    }

    public List<StatusCodeCountDto> getStatusCodeDistribution(String timeRange) {
        Instant since = resolveSince(timeRange);
        List<AccessLog> logs = storageService.getAllLogsSince(since);

        long total = logs.size();
        if (total == 0) {
            return Collections.emptyList();
        }

        Map<Integer, Long> counts = logs.stream()
                .map(l -> l.getStatusCode() != null ? l.getStatusCode() : 500)
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        List<StatusCodeCountDto> list = new ArrayList<>();
        for (Map.Entry<Integer, Long> entry : counts.entrySet()) {
            int code = entry.getKey();
            long count = entry.getValue();
            double pct = Math.round(((double) count / total * 100.0) * 10.0) / 10.0;

            String category = (code >= 200 && code < 300) ? "2xx Success"
                    : (code >= 300 && code < 400) ? "3xx Redirection"
                    : (code >= 400 && code < 500) ? "4xx Client Error"
                    : "5xx Server Error";

            list.add(StatusCodeCountDto.builder()
                    .statusCode(code)
                    .statusCategory(category)
                    .count(count)
                    .percentage(pct)
                    .build());
        }

        list.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        return list;
    }

    private Instant resolveSince(String timeRange) {
        if (timeRange == null) timeRange = "1h";
        return switch (timeRange.toLowerCase()) {
            case "15m" -> Instant.now().minus(Duration.ofMinutes(15));
            case "1h" -> Instant.now().minus(Duration.ofHours(1));
            case "6h" -> Instant.now().minus(Duration.ofHours(6));
            case "24h" -> Instant.now().minus(Duration.ofHours(24));
            case "7d" -> Instant.now().minus(Duration.ofDays(7));
            default -> Instant.now().minus(Duration.ofHours(1));
        };
    }
}

