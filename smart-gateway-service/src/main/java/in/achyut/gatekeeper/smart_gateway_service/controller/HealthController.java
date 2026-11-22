package in.achyut.gatekeeper.smart_gateway_service.controller;

import in.achyut.gatekeeper.smart_gateway_service.dto.responseDto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/health", "/api/v1/health"})
public class HealthController {
    private final String serviceName;
    private final String serviceDescription;

    public HealthController(@Value("${info.app.name:Smart Gateway Service}") String serviceName,
                            @Value("${info.app.description:Custom API gateway for routing, security, rate limiting, and traffic management}") String serviceDescription) {
        this.serviceName = serviceName;
        this.serviceDescription = serviceDescription;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(HealthResponse.builder()
                .serviceName(serviceName)
                .serviceDescription(serviceDescription)
                .status("UP")
                .build());
    }
}
