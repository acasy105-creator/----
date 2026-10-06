# FRAG / Gear Intelligence

## Liquipedia API integration (development)

The page requests player gear data from the Spring Boot backend when it opens. The backend uses Liquipedia's public MediaWiki API only; it does not fetch generated HTML pages or expose an API key in the browser.

Requirements: Java 17+ and Maven.

1. Set `LIQUIPEDIA_CONTACT_EMAIL` to an address that Liquipedia can use to contact the project owner. A custom User-Agent with contact information is required by Liquipedia's API terms.
2. Start the backend from `backend`:

   ```powershell
   $env:LIQUIPEDIA_CONTACT_EMAIL = "you@example.com"
   mvn spring-boot:run
   ```

3. Serve the workspace root over HTTP on `http://localhost:5500` or `http://127.0.0.1:5500` (for example, with the VS Code Live Server extension), then open `index.html` through that server. The default CORS allowlist is limited to those development origins.

The frontend's `frag-api-base-url` meta value in `index.html` defaults to `http://localhost:8080`. Change it for another backend address. Set `FRAG_CORS_ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins when deploying.

`GET /api/liquipedia/players?game=VALORANT` supports VALORANT, Apex Legends, and Overwatch 2. On a cache miss, the backend reads the first 50 entries in that wiki's `Category:Players`, retrieves their page contents in one batch, and returns pages with supported gear templates. This category is not limited to active professional players, so the fetched sample must not be presented as a representative pro-player usage ranking. It uses a reusable HTTP client, gzip, a custom User-Agent, at least two seconds between outbound requests, and an in-memory 24-hour cache. Consequently, a cold load of all three games takes several seconds. Data with no DPI or sensitivity remains usable for device listings but is excluded from cm/360 matching.

The API currently does not provide normalized game-role assignments for all profiles; role filtering is based on the app's configured role IDs and will not infer roles from player names. The small built-in roster remains visible if the backend is unavailable, with the source status indicating the API error.

Liquipedia requires attribution under CC BY-SA 3.0 and reuse/caching of API results. Imported profile cards link to their source page. Review [Liquipedia API Terms of Use](https://liquipedia.net/api-terms-of-use) before deployment. The first-50-page cap, in-memory cache, and supported template fields are prototype limits, not a complete production data pipeline.
