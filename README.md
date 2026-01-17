# Receptų Blogas: LT x Korea Fusion

Tai yra statinis receptų blogas, sukurtas su **Astro**.
Puslapis automatiškai generuoja naujus receptus kas 4 valandas naudodamas **Google Gemini API** ir **GitHub Actions**.

## Funkcijos

- **Statinis generavimas**: Greitas veikimas, saugus hostingas GitHub Pages.
- **Turinio kolekcijos**: Receptai saugomi kaip Markdown failai (`src/content/recipes/`).
- **Kategorijos**: Automatinis filtravimas pagal kategoriją (Vegetariški, Korean, Lithuanian, Fusion ir kt.).
- **Automatizacija**: `generate_recipe.js` skriptas sukuria naują receptą ir deda jį į git repo.
- **Vaizdai**: Naudojami estetiški SVG placeholderiai (vaizdų generavimo atsisakyta siekiant supaprastinimo).

## Kaip paleisti lokaliai

1. **Klonuoti repozitoriją:**

   ```bash
   git clone <repo-url>
   cd receptu-puslapis
   ```

2. **Instaliuoti bibliotekas:**

   ```bash
   npm install
   ```

3. **Paleisti serverį:**

   ```bash
   npm run dev
   ```

   Puslapis veiks adresu: `http://localhost:4321/receptu-puslapis` (dėl `base` konfigūracijos).

## Receptų Generavimas

Norint sugeneruoti naują receptą rankiniu būdu:

1. Sukurkite `.env` failą šakniniame kataloge:

   ```
   GEMINI_API_KEY=AIzaSy...
   ```

   (Raktą galite gauti [Google AI Studio](https://aistudio.google.com/app/apikey))

2. Paleiskite skriptą:

   ```bash
   node scripts/generate_recipe.js
   ```

   Naujas failas atsiras `src/content/recipes/` kataloge.

## GitHub Actions Setup

Norint, kad automatinis generavimas veiktų GitHub'e:

1. Nueikite į repo **Settings** > **Secrets and variables** > **Actions**.
2. Sukurkite **New repository secret**:
   - Name: `GEMINI_API_KEY`
   - Value: Jūsų Google Gemini API raktas.

3. Įsitikinkite, kad "Workflow permissions" (pagal **Settings** > **Actions** > **General**) yra nustatytos:
   - **Read and write permissions** (kad workflow galėtų daryti git push).

4. **GitHub Pages** nustatymai:
   - Nueikite į **Settings** > **Pages**.
   - Source: **GitHub Actions**.

## Troubleshooting

- **Image generation fails**: Patikrinkite, ar turite kreditų OpenAI sąskaitoje. Jei nepavyksta, bus naudojamas `default.svg`.
- **Git Push fails in Action**: Patikrinkite "Workflow permissions" (Read and write).
- **Styles missing**: Patikrinkite `astro.config.mjs` `base` nustatymą. Jis turi atitikti jūsų repo pavadinimą.

## Struktūra

- `src/content/recipes/`: Markdown failai su receptais.
- `src/pages/`: Puslapių kodas (Astro).
- `scripts/`: Generavimo skriptai.
- `.github/workflows/`: Cron ir Deploy konfiguracija.
