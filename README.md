[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yansen3w/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yansen3w/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI (PS5)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide in our own words with its sources cited beside it.
- **Roadmap to the platinum** (~200 hours, difficulty 4/10, one playthrough) built from the official descriptions and PowerPyx's roadmap.
- **One missable warning**: Positive Mental Attitude — the Chapter 1 Lucia balcony meditation, flagged by PowerPyx and GTABase.
- **Tracker**: tick trophies off, progress saved in the browser (localStorage), export to a file and import it back; filters by kind (story, missable, collectibles, activities, online) and grade; a spoiler setting that hides story trophies until they are earned; search.
- **Fully offline**: static files under `app/`, no build step, no network requests at run time. Serve `app/` with any static server and open `index.html`.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

Trophy list as published by PlayStation, via Exophase and PSNProfiles. Roadmap and missable details from [PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/), with the full list and 100% checklist cross-checked against [Output Lag](https://outputlag.com/guides/gta-6-trophy-list/) and [CryptoGames](https://cryptogames.gg/gta-6-trophies-achievements-full-list/). Every guide in this repo is written in our own words; sources are cited per trophy and never copied. Where the exact steps are still unconfirmed, the guide says so.

Unofficial fan guide. Not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork or game screenshots are used.

## License

MIT — see [LICENSE](LICENSE).
