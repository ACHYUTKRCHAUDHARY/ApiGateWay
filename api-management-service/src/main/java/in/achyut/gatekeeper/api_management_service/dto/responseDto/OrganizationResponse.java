package in.achyut.gatekeeper.api_management_service.dto.responseDto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @Builder.Default
    private String displayName = null;

    @Builder.Default
    private String contactEmail = null;

    @Builder.Default
    private String tier = "ENTERPRISE";

    @Builder.Default
    private int maxRoutesAllowed = 50;

    @Builder.Default
    private int maxRpmPerRoute = 5000;

    @JsonProperty("active")
    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }

    @JsonProperty("displayName")
    public String getDisplayName() {
        return displayName != null ? displayName : name;
    }

    @JsonProperty("contactEmail")
    public String getContactEmail() {
        return contactEmail != null ? contactEmail : "admin@" + (slug != null ? slug : "org") + ".local";
    }
}

