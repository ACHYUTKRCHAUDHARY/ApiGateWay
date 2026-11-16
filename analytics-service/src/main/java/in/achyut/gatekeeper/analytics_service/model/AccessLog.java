package in.achyut.gatekeeper.analytics_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "access_logs")
public class AccessLog {
    @Id
    private String id;
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

