package com.quizapplication.config.swagger;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(title = "Quiz Swagger",
                description = "Quiz API 명세서",
                version = "v1.0.0")
)
@Configuration
public class SwaggerConfig {
}
