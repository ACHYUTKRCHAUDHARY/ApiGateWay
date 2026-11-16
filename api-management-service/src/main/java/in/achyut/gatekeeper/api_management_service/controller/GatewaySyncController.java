package in.achyut.gatekeeper.api_management_service.controller;

import in.achyut.gatekeeper.api_management_service.dto.responseDto.ApiResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.GatewaySyncRouteDto;
import in.achyut.gatekeeper.api_management_service.service.RouteManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/gateway")
@RequiredArgsConstructor
public class GatewaySyncController {

    private final RouteManagementService routeService;

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<List<GatewaySyncRouteDto>>> getActiveRoutes() {
        List<GatewaySyncRouteDto> routes = routeService.getActiveRoutesForGatewaySync();
        return ResponseEntity.ok(ApiResponse.ok(routes));
    }
}

