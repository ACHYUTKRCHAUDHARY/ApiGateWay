package in.achyut.gatekeeper.smart_gateway_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpHeaders;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CachedResponse implements Serializable {
    private int statusCode;
    private HttpHeaders headers;
    private byte[] body;
    private long cachedAt;
}

