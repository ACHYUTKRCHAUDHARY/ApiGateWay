package in.achyut.gatekeeper.api_management_service.dto.requestDto;

import jakarta.validation.constraints.NotBlank;
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
public class CreateRouteRequest {

    private Long organizationId;

    private String routeId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Path pattern is required")
    private String pathPattern;

    @NotBlank(message = "Target base URL is required")
    private String targetBaseUrl;

    private String targetPathPrefix;

    private Integer requestsPerMinute;

    private Integer responseTimeoutMs;

    private Boolean idempotencyEnabled;

    private Boolean active;

    private Set<String> allowedMethods;

    private List<RouteHeaderRuleDto> headerRules;
}

