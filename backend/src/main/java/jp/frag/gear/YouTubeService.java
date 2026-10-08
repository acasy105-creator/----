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
import java.util.ArrayList;
import java.util.List;

@Service
public class YouTubeService {
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Renderで設定した環境変数「YOUTUBE_API_KEY」を自動で読み込む
    public YouTubeService(
            @Value("${YOUTUBE_API_KEY:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public List<YouTubeVideo> searchReviewVideos(String deviceName) {
        // APIキーが設定されていない場合は安全に空リストを返す
        if (apiKey == null || apiKey.isBlank()) {
            return List.of();
        }

        try {
            // 検索キーワードをURL用に変換（例：「Logitech G PRO X SUPERLIGHT レビュー」）
            String query = URLEncoder.encode(deviceName + " レビュー", StandardCharsets.UTF_8);
            
            // YouTube Data APIのURL（動画を最大3件取得）
            String url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=" 
                       + query + "&type=video&key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                return List.of();
            }

            // 返ってきたJSONデータを分解してリストに詰める
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode items = root.path("items");
            
            List<YouTubeVideo> videos = new ArrayList<>();
            for (JsonNode item : items) {
                String videoId = item.path("id").path("videoId").asText();
                String title = item.path("snippet").path("title").asText();
                // 中画質のサムネイルを取得
                String thumbnailUrl = item.path("snippet").path("thumbnails").path("medium").path("url").asText();
                String channelTitle = item.path("snippet").path("channelTitle").asText();
                
                videos.add(new YouTubeVideo(title, videoId, thumbnailUrl, channelTitle));
            }
            return videos;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}