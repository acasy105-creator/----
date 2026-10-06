package jp.frag.gear;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class LiquipediaWikitextParserTest {
    @Test
    void parsesGearAndSensitivityFromLiquipediaTemplates() {
        String wikitext = """
                {{Infobox player
                |name=Test Player
                }}
                {{Mouse settings table
                |brand=Pulsar
                |model=Example
                |dpi=1600
                |sensitivity=.08 (source value)
                }}
                {{hardware table
                |mouse-brand=Pulsar|mouse-model=Example
                |pad-brand=[[Lethal Gaming Gear]]|pad-model=Saturn Pro
                }}
                """;

        PlayerProfile profile = LiquipediaWikitextParser.parse("Test", Game.VALORANT, wikitext);

        assertNotNull(profile);
        assertEquals(1600, profile.dpi());
        assertEquals(0.08, profile.sens(), 1e-9);
        assertEquals("Pulsar Example", profile.devices().get("マウス"));
        assertEquals("Lethal Gaming Gear Saturn Pro", profile.devices().get("マウスパッド"));
        assertNotNull(profile.cmPer360());
    }

    @Test
    void skipsPagesWithoutDeviceData() {
        assertNull(LiquipediaWikitextParser.parse("No Gear", Game.APEX_LEGENDS, "{{Infobox player|name=No Gear}}"));
    }
}
