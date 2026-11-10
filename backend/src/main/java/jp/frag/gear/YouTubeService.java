package jp.frag.gear;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class YouTubeService {
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public YouTubeService(
            @Value("${YOUTUBE_API_KEY:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public List<YouTubeVideo> searchReviewVideos(String deviceName) {
        if (apiKey == null || apiKey.isBlank() || deviceName == null || deviceName.isBlank()) {
            return List.of();
        }

        try {
            String cleanName = deviceName.split("[（(]")[0].trim();
            String query = URLEncoder.encode(cleanName + " レビュー", StandardCharsets.UTF_8);

            String url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q="
                    + query + "&type=video&key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode items = root.path("items");

            List<YouTubeVideo> videos = new ArrayList<>();
            for (JsonNode item : items) {
                String videoId = item.path("id").path("videoId").asText();
                if (videoId == null || videoId.isBlank()) continue;

                String title = item.path("snippet").path("title").asText();
                String thumbnailUrl = item.path("snippet").path("thumbnails").path("medium").path("url").asText();
                String channelTitle = item.path("snippet").path("channelTitle").asText();

                videos.add(new YouTubeVideo(title, videoId, thumbnailUrl, channelTitle));
            }
            return videos;

        } catch (Exception e) {
            System.err.println("YouTube API fetch error: " + e.getMessage());
            return List.of();
        }
    }
}