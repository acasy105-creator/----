package jp.frag.gear;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class YouTubeController {

    private final YouTubeService youtubeService;
    private final InMemoryTtlCache cache;

    public YouTubeController(YouTubeService youtubeService, InMemoryTtlCache cache) {
        this.youtubeService = youtubeService;
        this.cache = cache;
    }

    @GetMapping("/api/youtube/reviews")
    public List<YouTubeVideo> getReviews(@RequestParam String device) {
        if (device == null || device.isBlank() || device.length() > 80) {
            return List.of();
        }
        // カッコ内の補足文字や制御文字を除去して正規化
        String cleanDevice = device.replaceAll("[<>\"'`\\p{Cntrl}]", "")
                .split("[（(]")[0]
                .trim();
        if (cleanDevice.isEmpty() || "データなし".equals(cleanDevice)) {
            return List.of();
        }

        // 24時間キャッシュ経由で返却（同じデバイスならYouTube APIのQuotaを消費しない）
        return cache.getOrCompute("yt:" + cleanDevice, () ->
                youtubeService.searchReviewVideos(cleanDevice)
        );
    }
}