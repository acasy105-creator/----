package jp.frag.gear;

import java.util.List;
import java.util.Map;

public record PlayerProfile(
        String name,
        String game,
        List<String> roles,
        Integer dpi,
        Double sens,
        Double cmPer360,
        Map<String, String> devices,
        String source,
        String sourceUrl
) {
}
