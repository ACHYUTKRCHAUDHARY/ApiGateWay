package in.achyut.gatekeeper.api_management_service.dto.requestDto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {
    @NotBlank(message = "Organization name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String status; // ACTIVE, INACTIVE
}

