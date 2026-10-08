package jp.frag.gear;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class YouTubeController {
    
    private final YouTubeService youtubeService;

    public YouTubeController(YouTubeService youtubeService) {
        this.youtubeService = youtubeService;
    }

    @GetMapping("/api/youtube/reviews")
    public List<YouTubeVideo> getReviews(@RequestParam String device) {
        return youtubeService.searchReviewVideos(device);
    }
}