package jp.frag.gear;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "https://frag-gear.vercel.app",
                        "https://*-frag-gear.vercel.app",
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("Content-Type", "Accept", "Origin")
                .allowCredentials(false)
                .maxAge(3600);
    }
}