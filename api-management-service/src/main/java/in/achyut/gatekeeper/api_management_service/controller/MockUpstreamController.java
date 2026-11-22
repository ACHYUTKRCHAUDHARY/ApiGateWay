package in.achyut.gatekeeper.api_management_service.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/mock")
public class MockUpstreamController {

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers() {
        List<Map<String, Object>> users = List.of(
                Map.of("id", 1, "name", "Alice Johnson", "email", "alice@example.com", "role", "Engineer", "status", "ACTIVE"),
                Map.of("id", 2, "name", "Bob Smith", "email", "bob@example.com", "role", "Product Manager", "status", "ACTIVE"),
                Map.of("id", 3, "name", "Charlie Davis", "email", "charlie@example.com", "role", "Designer", "status", "INACTIVE")
        );
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Mock User Upstream");
        response.put("timestamp", System.currentTimeMillis());
        response.put("count", users.size());
        response.put("users", users);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable int id) {
        Map<String, Object> user = Map.of(
                "id", id,
                "name", "User #" + id,
                "email", "user" + id + "@example.com",
                "department", "Engineering",
                "createdAt", "2026-01-15T08:30:00Z"
        );
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> created = new HashMap<>();
        if (body != null) {
            created.putAll(body);
        }
        created.put("id", new Random().nextInt(9000) + 1000);
        created.put("created", true);
        created.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @RequestMapping(value = {"/echo", "/echo/**"}, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<Map<String, Object>> echo(
            HttpServletRequest request,
            @RequestBody(required = false) Object body) {

        Map<String, String> headers = new HashMap<>();
        Collections.list(request.getHeaderNames()).forEach(headerName ->
                headers.put(headerName, request.getHeader(headerName))
        );

        Map<String, Object> echoResponse = new HashMap<>();
        echoResponse.put("method", request.getMethod());
        echoResponse.put("uri", request.getRequestURI());
        echoResponse.put("queryString", request.getQueryString());
        echoResponse.put("clientIp", request.getRemoteAddr());
        echoResponse.put("receivedHeaders", headers);
        echoResponse.put("receivedBody", body);
        echoResponse.put("echoTimestamp", System.currentTimeMillis());

        return ResponseEntity.ok(echoResponse);
    }

    @GetMapping("/delay/{ms}")
    public ResponseEntity<Map<String, Object>> delay(@PathVariable int ms) throws InterruptedException {
        long sleepTime = Math.min(ms, 10000); // Max 10 seconds
        Thread.sleep(sleepTime);
        return ResponseEntity.ok(Map.of(
                "delayedMs", sleepTime,
                "status", "completed after delay",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/status/{code}")
    public ResponseEntity<Map<String, Object>> status(@PathVariable int code) {
        HttpStatus status;
        try {
            status = HttpStatus.valueOf(code);
        } catch (Exception e) {
            status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status).body(Map.of(
                "statusCode", status.value(),
                "reasonPhrase", status.getReasonPhrase(),
                "timestamp", System.currentTimeMillis()
        ));
    }
}

