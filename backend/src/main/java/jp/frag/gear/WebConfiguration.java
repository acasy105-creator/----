package jp.frag.gear;

import java.util.Arrays;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final String[] allowedOriginPatterns;

    public WebConfiguration(@Value("${frag.cors.allowed-origins}") String allowedOrigins) {
        this.allowedOriginPatterns = Stream.concat(
                        Arrays.stream(allowedOrigins.split(","))
                                .map(String::trim)
                                .filter(origin -> !origin.isBlank()),
                        Stream.of("https://*.vercel.app"))
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(allowedOriginPatterns)
                .allowedMethods("GET")
                .allowedHeaders("Accept")
                .maxAge(3600);
    }
}
