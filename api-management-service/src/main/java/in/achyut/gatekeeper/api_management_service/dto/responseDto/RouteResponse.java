package in.achyut.gatekeeper.api_management_service.dto.responseDto;

import in.achyut.gatekeeper.api_management_service.dto.requestDto.RouteHeaderRuleDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {
    private Long id;
    private String routeId;
    private Long organizationId;
    private String organizationName;
    private String name;
    private String pathPattern;
    private String targetBaseUrl;
    private String targetPathPrefix;
    private Integer requestsPerMinute;
    private Integer responseTimeoutMs;
    private Boolean idempotencyEnabled;
    private Boolean active;
    private Long configurationVersion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> allowedMethods;
    private List<RouteHeaderRuleDto> headerRules;
}

