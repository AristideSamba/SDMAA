package com.taekwondo.sdmaa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class SdmaaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SdmaaApplication.class, args);
	}

}
