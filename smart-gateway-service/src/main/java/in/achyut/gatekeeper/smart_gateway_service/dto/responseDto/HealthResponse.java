package in.achyut.gatekeeper.smart_gateway_service.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class HealthResponse {
    private String serviceNam;
    private String serviceDescription;
    private String appStatus;
}
