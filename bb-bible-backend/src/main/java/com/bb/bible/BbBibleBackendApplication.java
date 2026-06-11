package com.bb.bible;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BbBibleBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BbBibleBackendApplication.class, args);
    }

}
