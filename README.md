# Fitness Planet

Een Nederlandstalige React-app voor het plannen van maaltijden, het volgen van workouts en het beheren van voedingsdoelen. De applicatie gebruikt de Edamam Recipe Search API v2 voor externe receptdata.

## Functies
- Authenticatie en sessiebeheer via `AuthContext`.
- Dashboard, workouts, voeding, recepten, mealplanning, progressie en profiel.
- Recepten zoeken via Edamam met loading, error en empty states in de UI.
- Favorieten en opgeslagen recepten blijven lokaal opgeslagen.

## Installatie
1. Installeer de dependencies:
   ```bash
   npm install
   ```
2. Kopieer de voorbeeldconfiguratie:
   ```bash
   cp .env.example .env
   ```
3. Vul minimaal deze Edamam-waarden in:
   ```bash
   VITE_EDAMAM_APP_ID=your_edamam_app_id_here
   VITE_EDAMAM_APP_KEY=your_edamam_app_key_here
   ```
4. Start de app:
   ```bash
   npm start
   ```

## Beschikbare scripts
- `npm start` - Start de Vite ontwikkelserver.
- `npm run dev` - Start de Vite ontwikkelserver.
- `npm run build` - Maakt een productiebuild.
- `npm run preview` - Previewt de productiebuild.

## Projectstructuur
- `src/main.jsx` - Rendert de React-app.
- `src/App.jsx` - Centrale app-structuur.
- `src/routes/` - Routing, dynamic routes en protected routes.
- `src/contexts/` - Context-providers voor authenticatie, recepten en mealplanning.
- `src/services/edamamService.js` - Centrale Edamam API-laag.
- `src/components/` en `src/pages/` - Herbruikbare componenten en pagina's.

## Edamam API
De app gebruikt geen hardcoded Edamam keys. De service leest credentials via Vite:

```bash
VITE_EDAMAM_APP_ID=...
VITE_EDAMAM_APP_KEY=...
VITE_EDAMAM_BASE_URL=https://api.edamam.com
```

In `src/services/edamamService.js` staan de externe async API-functies die meetellen voor criterium 3.4:
- `searchRecipes(query, filters)`
- `getRecipesByDiet(diet)`
- `getRecipesByMealType(mealType)`
- `getRecipesByHealthLabel(healthLabel)`
- `getHighProteinRecipes()`
- `getLowCalorieRecipes()`
- `getRecipeDetails(recipeUrlOrUri)`
- `getNextRecipesPage(nextUrl)`

De receptenpagina toont loading, error, retry en empty states wanneer externe data wordt opgehaald.

## Demo login
- Email: `demo@fitnessplanet.com`
- Wachtwoord: `demo123`
