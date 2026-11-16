package in.achyut.gatekeeper.analytics_service.service;

import in.achyut.gatekeeper.analytics_service.model.AccessLog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AnalyticsStorageService {

    private final Deque<AccessLog> inMemoryLogs = new ConcurrentLinkedDeque<>();
    private static final int MAX_LOGS = 50000;

    public void store(AccessLog logEvent) {
        if (logEvent.getId() == null) {
            logEvent.setId(UUID.randomUUID().toString());
        }
        if (logEvent.getTimestamp() == null) {
            logEvent.setTimestamp(Instant.now());
        }

        inMemoryLogs.addFirst(logEvent);

        while (inMemoryLogs.size() > MAX_LOGS) {
            inMemoryLogs.pollLast();
        }
    }

    public List<AccessLog> queryLogs(Instant since, String routeId, Integer statusCode, Integer limit) {
        int max = (limit != null && limit > 0) ? Math.min(limit, 1000) : 100;

        return inMemoryLogs.stream()
                .filter(log -> since == null || (log.getTimestamp() != null && log.getTimestamp().isAfter(since)))
                .filter(log -> routeId == null || routeId.isBlank() || (log.getRouteId() != null && log.getRouteId().equalsIgnoreCase(routeId.trim())))
                .filter(log -> statusCode == null || (log.getStatusCode() != null && log.getStatusCode().equals(statusCode)))
                .limit(max)
                .collect(Collectors.toList());
    }

    public List<AccessLog> getAllLogsSince(Instant since) {
        return inMemoryLogs.stream()
                .filter(log -> since == null || (log.getTimestamp() != null && log.getTimestamp().isAfter(since)))
                .collect(Collectors.toList());
    }

    public long getTotalCount() {
        return inMemoryLogs.size();
    }
}

