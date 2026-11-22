package in.achyut.gatekeeper.smart_gateway_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.achyut.gatekeeper.smart_gateway_service.config.GatewayProperties;
import in.achyut.gatekeeper.smart_gateway_service.model.AccessLogEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class TrafficLoggerService {

    private final GatewayProperties properties;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(4);

    @Autowired
    public TrafficLoggerService(GatewayProperties properties,
                                @Autowired(required = false) KafkaTemplate<String, String> kafkaTemplate,
                                RestClient restClient) {
        this.properties = properties;
        this.kafkaTemplate = kafkaTemplate;
        this.restClient = restClient;
    }

    public void logTraffic(AccessLogEvent event) {
        log.info("[GATEWAY ACCESS] [{}] {} {} -> {} ({} ms, route={})",
                event.getStatusCode(), event.getHttpMethod(), event.getRequestPath(),
                event.getTargetUrl(), event.getLatencyMs(), event.getRouteId());

        asyncExecutor.submit(() -> {
            boolean sentToKafka = false;

            if (properties.isKafkaEnabled() && kafkaTemplate != null) {
                try {
                    String payload = objectMapper.writeValueAsString(event);
                    kafkaTemplate.send(properties.getKafkaTopic(), event.getRouteId(), payload);
                    sentToKafka = true;
                } catch (Exception e) {
                    log.debug("Kafka publish failed (broker might be offline), falling back to direct ingestion: {}", e.getMessage());
                }
            }

            // Fallback or direct delivery to analytics-service REST ingestion endpoint
            if (!sentToKafka) {
                try {
                    String baseUrl = properties.getAnalyticsServiceUrl();
                    if (baseUrl != null && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
                        baseUrl = "http://" + baseUrl;
                    }
                    String ingestUrl = baseUrl + "/api/v1/analytics/ingest";
                    restClient.post()
                            .uri(ingestUrl)
                            .header("Content-Type", "application/json")
                            .body(event)
                            .retrieve()
                            .toBodilessEntity();
                } catch (Exception e) {
                    log.debug("Analytics direct ingestion failed: {}", e.getMessage());
                }
            }
        });
    }
}

