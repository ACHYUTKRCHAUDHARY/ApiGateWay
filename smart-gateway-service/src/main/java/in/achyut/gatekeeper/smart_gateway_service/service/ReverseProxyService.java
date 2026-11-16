package in.achyut.gatekeeper.smart_gateway_service.service;

import in.achyut.gatekeeper.smart_gateway_service.model.RouteRule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.time.Duration;

@Service
@Slf4j
public class ReverseProxyService {

    public ResponseEntity<byte[]> forward(HttpMethod method, String targetUrl, HttpHeaders headers,
                                          byte[] body, RouteRule route) {
        int timeoutMs = route.getResponseTimeoutMs() != null ? route.getResponseTimeoutMs() : 5000;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(Math.min(timeoutMs, 3000)));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));

        RestClient client = RestClient.builder()
                .requestFactory(factory)
                .build();

        try {
            RestClient.RequestBodySpec spec = client.method(method)
                    .uri(URI.create(targetUrl))
                    .headers(h -> h.addAll(headers));

            if (body != null && body.length > 0) {
                spec.body(body);
            }

            return spec.exchange((req, res) -> {
                HttpHeaders resHeaders = new HttpHeaders();
                res.getHeaders().forEach(resHeaders::put);

                byte[] resBytes = readAllBytes(res.getBody());
                return new ResponseEntity<>(resBytes, resHeaders, res.getStatusCode());
            });

        } catch (ResourceAccessException rae) {
            Throwable cause = rae.getCause();
            if (cause instanceof SocketTimeoutException) {
                log.warn("Gateway timeout forwarding to {}: {}", targetUrl, rae.getMessage());
                String msg = "{\"error\":\"Gateway Timeout\",\"message\":\"Target upstream timed out after " + timeoutMs + "ms\"}";
                HttpHeaders errHeaders = new HttpHeaders();
                errHeaders.set("Content-Type", "application/json");
                return new ResponseEntity<>(msg.getBytes(), errHeaders, HttpStatus.GATEWAY_TIMEOUT);
            } else if (cause instanceof ConnectException) {
                log.warn("Bad gateway connecting to {}: {}", targetUrl, rae.getMessage());
                String msg = "{\"error\":\"Bad Gateway\",\"message\":\"Cannot connect to upstream server at " + route.getTargetBaseUrl() + "\"}";
                HttpHeaders errHeaders = new HttpHeaders();
                errHeaders.set("Content-Type", "application/json");
                return new ResponseEntity<>(msg.getBytes(), errHeaders, HttpStatus.BAD_GATEWAY);
            }
            log.error("Resource access error forwarding to {}: {}", targetUrl, rae.getMessage());
            String msg = "{\"error\":\"Bad Gateway\",\"message\":\"" + rae.getMessage() + "\"}";
            HttpHeaders errHeaders = new HttpHeaders();
            errHeaders.set("Content-Type", "application/json");
            return new ResponseEntity<>(msg.getBytes(), errHeaders, HttpStatus.BAD_GATEWAY);

        } catch (Exception e) {
            log.error("Unexpected error forwarding to {}: {}", targetUrl, e.getMessage(), e);
            String msg = "{\"error\":\"Internal Server Error\",\"message\":\"" + e.getMessage() + "\"}";
            HttpHeaders errHeaders = new HttpHeaders();
            errHeaders.set("Content-Type", "application/json");
            return new ResponseEntity<>(msg.getBytes(), errHeaders, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private byte[] readAllBytes(InputStream inputStream) {
        try {
            if (inputStream == null) return new byte[0];
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            int nRead;
            byte[] data = new byte[8192];
            while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
            return buffer.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }
}

