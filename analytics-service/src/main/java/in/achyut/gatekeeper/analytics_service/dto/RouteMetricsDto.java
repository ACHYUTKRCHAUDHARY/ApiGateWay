package in.achyut.gatekeeper.analytics_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteMetricsDto {
    private String routeId;
    private long totalRequests;
    private long successCount;
    private long errorCount;
    private double errorRatePercentage;
    private double avgLatencyMs;
    private long minLatencyMs;
    private long maxLatencyMs;
}

