package in.achyut.gatekeeper.analytics_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusCodeCountDto {
    private int statusCode;
    private String statusCategory; // 2xx, 4xx, 5xx
    private long count;
    private double percentage;
}

