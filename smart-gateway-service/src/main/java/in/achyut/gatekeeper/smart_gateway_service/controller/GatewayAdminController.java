package in.achyut.gatekeeper.smart_gateway_service.controller;

import in.achyut.gatekeeper.smart_gateway_service.model.RouteRule;
import in.achyut.gatekeeper.smart_gateway_service.service.RouteCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gateway/admin")
@RequiredArgsConstructor
public class GatewayAdminController {

    private final RouteCacheService routeCacheService;

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncRoutes() {
        boolean success = routeCacheService.refreshRoutes();
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("syncedAt", System.currentTimeMillis());
        res.put("activeRoutesCount", routeCacheService.getActiveRoutes().size());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteRule>> getActiveRoutes() {
        return ResponseEntity.ok(routeCacheService.getActiveRoutes());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "Smart Gateway Service");
        status.put("status", "UP");
        status.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());
        status.put("activeRoutesCount", routeCacheService.getActiveRoutes().size());
        status.put("lastSyncTimestamp", routeCacheService.getLastSyncTimestamp());
        return ResponseEntity.ok(status);
    }
}

