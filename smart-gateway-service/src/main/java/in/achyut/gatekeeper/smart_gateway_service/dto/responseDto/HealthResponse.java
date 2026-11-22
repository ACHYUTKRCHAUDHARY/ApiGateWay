package in.achyut.gatekeeper.smart_gateway_service.dto.responseDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {
    @JsonProperty("serviceName")
    private String serviceName;

    @JsonProperty("serviceDescription")
    private String serviceDescription;

    @JsonProperty("status")
    private String status;

    // Backward compatibility aliases
    @JsonProperty("serviceNam")
    public String getServiceNam() {
        return serviceName;
    }

    @JsonProperty("name")
    public String getName() {
        return serviceName;
    }

    @JsonProperty("description")
    public String getDescription() {
        return serviceDescription;
    }

    @JsonProperty("appStatus")
    public String getAppStatus() {
        return status;
    }
}
