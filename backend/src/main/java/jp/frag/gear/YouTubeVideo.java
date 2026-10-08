package jp.frag.gear;

public record YouTubeVideo(
    String title,
    String videoId,
    String thumbnailUrl,
    String channelTitle
) {}