package in.achyut.gatekeeper.smart_gateway_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "gatekeeper")
@Data
public class GatewayProperties {
    private String managementServiceUrl = "http://localhost:8081";
    private String analyticsServiceUrl = "http://localhost:8082";
    private int syncIntervalSeconds = 10;
    private String kafkaTopic = "gateway-access-logs";
    private boolean redisEnabled = true;
    private boolean kafkaEnabled = true;
}

