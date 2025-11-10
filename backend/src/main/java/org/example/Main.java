package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // Quan trọng: bật Spring Boot auto-config
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args); // Khởi động Spring Boot
    }
}
