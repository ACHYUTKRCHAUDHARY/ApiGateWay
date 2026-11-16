package in.achyut.gatekeeper.api_management_service.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteVersionResponse {
    private Long id;
    private Long organizationId;
    private String routeId;
    private Long versionNumber;
    private String changeType;
    private String configurationSnapshot;
    private LocalDateTime createdAt;
}

