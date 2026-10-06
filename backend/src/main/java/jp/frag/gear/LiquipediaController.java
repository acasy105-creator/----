package jp.frag.gear;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LiquipediaController {
    private final LiquipediaService liquipediaService;

    public LiquipediaController(LiquipediaService liquipediaService) {
        this.liquipediaService = liquipediaService;
    }

    @GetMapping("/api/liquipedia/players")
    public List<PlayerProfile> getPlayers(@RequestParam String game) {
        return liquipediaService.getPlayers(Game.fromRequest(game));
    }
}
