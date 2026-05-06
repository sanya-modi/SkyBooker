package com.skybooker.airlineairport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
//@ComponentScan(basePackages = "com.skyBooker.airlineairport")
public class AirlineAirportApplication {

    public static void main(String[] args) {
        SpringApplication.run(AirlineAirportApplication.class, args);
    }
}
