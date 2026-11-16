package in.achyut.gatekeeper.analytics_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeseriesPointDto {
    private Instant timestamp;
    private String timeLabel;
    private long totalRequests;
    private long successCount;
    private long errorCount;
    private double avgLatencyMs;
}

