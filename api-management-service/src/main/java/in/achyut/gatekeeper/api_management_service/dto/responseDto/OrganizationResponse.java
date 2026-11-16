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
public class OrganizationResponse {
    private Long id;
    private String name;
    private String slug;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long routesCount;
}

