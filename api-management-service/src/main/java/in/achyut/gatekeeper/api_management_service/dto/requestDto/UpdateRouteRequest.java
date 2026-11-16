package in.achyut.gatekeeper.api_management_service.dto.requestDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRouteRequest {

    private String name;

    private String pathPattern;

    private String targetBaseUrl;

    private String targetPathPrefix;

    private Integer requestsPerMinute;

    private Integer responseTimeoutMs;

    private Boolean idempotencyEnabled;

    private Boolean active;

    private Set<String> allowedMethods;

    private List<RouteHeaderRuleDto> headerRules;
}

