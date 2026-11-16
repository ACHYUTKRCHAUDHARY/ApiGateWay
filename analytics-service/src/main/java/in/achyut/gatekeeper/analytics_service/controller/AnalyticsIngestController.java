package in.achyut.gatekeeper.analytics_service.controller;

import in.achyut.gatekeeper.analytics_service.model.AccessLog;
import in.achyut.gatekeeper.analytics_service.service.AnalyticsStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsIngestController {

    private final AnalyticsStorageService storageService;

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingest(@RequestBody AccessLog logEvent) {
        storageService.store(logEvent);
        return ResponseEntity.ok(Map.of("status", "INGESTED", "requestId", logEvent.getRequestId() != null ? logEvent.getRequestId() : ""));
    }
}

