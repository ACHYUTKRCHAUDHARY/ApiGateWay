package in.achyut.gatekeeper.api_management_service.dto.requestDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RollbackRouteRequest {
    @NotNull(message = "Target version is required")
    private Long targetVersion;
}

