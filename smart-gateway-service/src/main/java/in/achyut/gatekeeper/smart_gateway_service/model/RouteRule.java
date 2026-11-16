package in.achyut.gatekeeper.smart_gateway_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteRule {
    private Long id;
    private Long organizationId;
    private String routeId;
    private String name;
    private String pathPattern;
    private String targetBaseUrl;
    private String targetPathPrefix;
    private Integer requestsPerMinute;
    private Integer responseTimeoutMs;
    private Boolean idempotencyEnabled;
    private Boolean active;
    private Long configurationVersion;

    @Builder.Default
    private Set<String> allowedMethods = new HashSet<>();

    @Builder.Default
    private List<HeaderRule> headerRules = new ArrayList<>();
}

