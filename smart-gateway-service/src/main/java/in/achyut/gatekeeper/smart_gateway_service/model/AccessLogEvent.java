package in.achyut.gatekeeper.smart_gateway_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessLogEvent {
    private String requestId;
    private Instant timestamp;
    private String routeId;
    private Long organizationId;
    private String clientIp;
    private String httpMethod;
    private String requestPath;
    private String targetUrl;
    private Integer statusCode;
    private Long latencyMs;
    private String userAgent;
    private String errorMessage;
}

