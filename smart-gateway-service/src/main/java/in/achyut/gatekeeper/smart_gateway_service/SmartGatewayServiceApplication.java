package in.achyut.gatekeeper.smart_gateway_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartGatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartGatewayServiceApplication.class, args);
	}

}
