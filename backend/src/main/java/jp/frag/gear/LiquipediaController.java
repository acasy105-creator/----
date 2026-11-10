package jp.frag.gear;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LiquipediaController {

    private final LiquipediaService liquipediaService;
    private final InMemoryTtlCache cache;

    public LiquipediaController(LiquipediaService liquipediaService, InMemoryTtlCache cache) {
        this.liquipediaService = liquipediaService;
        this.cache = cache;
    }

    @GetMapping("/api/liquipedia/players")
    public List<PlayerProfile> getPlayers(@RequestParam(defaultValue = "VALORANT") String game) {
        String cleanGameStr = game == null ? "VALORANT" : game.replaceAll("[<>\"'`\\p{Cntrl}]", "").trim();
        Game targetGame = Game.fromRequest(cleanGameStr);

        return cache.getOrCompute("players:" + targetGame.name(), () ->
                liquipediaService.getPlayers(targetGame)
        );
    }
}