package in.achyut.gatekeeper.api_management_service.dto.requestDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteHeaderRuleDto {
    private Long id;
    private String direction; // REQUEST, RESPONSE
    private String action; // ADD, REMOVE, SET
    private String headerName;
    private String headerValue;
}

