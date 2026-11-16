package in.achyut.gatekeeper.api_management_service.dto.requestDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrganizationRequest {
    private String name;
    private String status; // ACTIVE, INACTIVE, SUSPENDED
}

