package com.example.monitorserver; // ← 改这里

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MonitorServerApplication { // ← 改这里
  public static void main(String[] args) {
    SpringApplication.run(MonitorServerApplication.class, args); // ← 改这里
  }
}