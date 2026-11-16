package in.achyut.gatekeeper.smart_gateway_service.service;

import in.achyut.gatekeeper.smart_gateway_service.model.HeaderRule;
import in.achyut.gatekeeper.smart_gateway_service.model.RouteRule;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class HeaderTransformationService {

    public HttpHeaders transformRequestHeaders(HttpServletRequest request, RouteRule route, String requestId) {
        HttpHeaders headers = new HttpHeaders();

        // Copy incoming headers except host and content-length (which RestClient
        // manages)
        Collections.list(request.getHeaderNames()).forEach(headerName -> {
            if (!headerName.equalsIgnoreCase("host") && !headerName.equalsIgnoreCase("content-length")) {
                headers.addAll(headerName, Collections.list(request.getHeaders(headerName)));
            }
        });

        // Add standard gateway tracing headers
        headers.set("X-Gateway-Request-Id", requestId);
        headers.set("X-Forwarded-For", getClientIp(request));
        headers.set("X-Forwarded-Host", request.getServerName() + ":" + request.getServerPort());
        headers.set("X-Forwarded-Proto", request.getScheme());

        // Apply route-specific REQUEST header rules
        List<HeaderRule> rules = route.getHeaderRules();
        if (rules != null) {
            for (HeaderRule rule : rules) {
                if ("REQUEST".equalsIgnoreCase(rule.getDirection())) {
                    applyRule(headers, rule);
                }
            }
        }

        return headers;
    }

    public HttpHeaders transformResponseHeaders(HttpHeaders upstreamHeaders, RouteRule route,
            String requestId, long latencyMs) {
        HttpHeaders headers = new HttpHeaders();
        if (upstreamHeaders != null) {
            headers.putAll(upstreamHeaders);
        }

        // Add gateway tracking headers
        headers.set("X-Gateway-Request-Id", requestId);
        headers.set("X-Gateway-Latency-Ms", String.valueOf(latencyMs));
        headers.set("X-Gateway-Route-Id", route.getRouteId());
        headers.set("X-Gateway-Org-Id", route.getOrganizationId() != null ? route.getOrganizationId().toString() : "0");

        // Apply route-specific RESPONSE header rules
        List<HeaderRule> rules = route.getHeaderRules();
        if (rules != null) {
            for (HeaderRule rule : rules) {
                if ("RESPONSE".equalsIgnoreCase(rule.getDirection())) {
                    applyRule(headers, rule);
                }
            }
        }

        return headers;
    }

    private void applyRule(HttpHeaders headers, HeaderRule rule) {
        String name = rule.getHeaderName();
        String value = rule.getHeaderValue();
        String action = rule.getAction() != null ? rule.getAction().toUpperCase() : "ADD";

        switch (action) {
            case "ADD":
                if (headers.get(name) == null || headers.get(name).isEmpty()) {
                    headers.set(name, value);
                }
                break;
            case "SET":
                headers.set(name, value);
                break;
            case "REMOVE":
                headers.remove(name);
                break;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}