package in.achyut.gatekeeper.analytics_service.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.achyut.gatekeeper.analytics_service.model.AccessLog;
import in.achyut.gatekeeper.analytics_service.service.AnalyticsStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "gatekeeper.analytics.kafka-enabled", havingValue = "true")
public class KafkaAccessLogConsumer {

    private final AnalyticsStorageService storageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "${gatekeeper.analytics.kafka-topic:gateway-access-logs}", groupId = "${spring.kafka.consumer.group-id:gatekeeper-analytics-group}")
    public void consume(String message) {
        try {
            AccessLog logEvent = objectMapper.readValue(message, AccessLog.class);
            storageService.store(logEvent);
            log.debug("Consumed access log from Kafka: requestId={}", logEvent.getRequestId());
        } catch (Exception e) {
            log.error("Failed to deserialize access log from Kafka: {}", e.getMessage(), e);
        }
    }
}

