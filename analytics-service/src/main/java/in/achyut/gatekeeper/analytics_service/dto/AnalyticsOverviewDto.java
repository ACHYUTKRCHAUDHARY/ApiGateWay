package in.achyut.gatekeeper.analytics_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDto {
    private long totalRequests;
    private long successCount;
    private long errorCount;
    private double errorRatePercentage;
    private double avgLatencyMs;
    private long p95LatencyMs;
    private long p99LatencyMs;
    private int activeRoutesCount;
}

