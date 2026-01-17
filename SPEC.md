# Receptų blogas: LT x Korea Fusion

## Tikslas
Sukurti statinį receptų blogą, kuris automatiškai publikuoja po 1 naują receptą kas 4 valandas.

## Tech
- Node + Astro (static site)
- GitHub repo
- GitHub Actions (cron) generavimui ir deploy
- Deploy: GitHub Pages (be mokamo hostingo)

## Turinys
Receptai laikomi Markdown failuose su frontmatter:
- title
- date
- category
- tags
- time_minutes
- difficulty
- image (kelias į public)

Kategorijos:
- vegetariski
- mesa
- paukstiena
- zuvis
- sriubos
- desertai
- korejietiski
- lietuviski
- fusion

## UI
- Home: naujausi receptai + kategorijos
- Category listing
- Single recipe page
- Kontaktai (paprastas blokas)

## Automatizacija kas 4 val.
Kiekvieną kartą:
- sugeneruoti 1 receptą (tekstą) ir įrašyti į src/content/recipes/
- sugeneruoti 1 paveikslėlį ir įrašyti į public/images/recipes/
- commit + push
- deploy į GitHub Pages

## Svarbu
- Viskas turi veikti be rankinio redagavimo po pirmo setup.
- Venk sudėtingo CMS ar DB.
