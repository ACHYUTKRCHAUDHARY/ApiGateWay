package in.achyut.gatekeeper.smart_gateway_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeaderRule {
    private String direction; // REQUEST, RESPONSE
    private String action; // ADD, REMOVE, SET
    private String headerName;
    private String headerValue;
}

