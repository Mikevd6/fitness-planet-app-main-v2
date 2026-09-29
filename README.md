# Fitness Planet

Een Nederlandstalige React-app voor het plannen van maaltijden, het volgen van workouts en het beheren van voedingsdoelen. De applicatie gebruikt de Edamam Recipe Search API v2 voor externe receptdata.

## Functies
- Authenticatie en sessiebeheer via `AuthContext`.
- Dashboard, workouts, voeding, recepten, mealplanning, progressie en profiel.
- Recepten zoeken via Edamam met loading, error en empty states in de UI.
- Workouts, opgeslagen favoriete recepten en de handmatige weekplanning worden via NOVI opgeslagen. Andere oude schermen gebruiken nog browseropslag.

## Installatie
1. Installeer de dependencies:
   ```bash
   npm install
   ```
2. Kopieer de voorbeeldconfiguraties:
   ```bash
   cp .env.example .env
   cp .env.server.example .env.server
   ```
3. Vul de NOVI-project-ID en de Edamam-waarden in `.env` in:
   ```bash
   VITE_NOVI_PROJECT_ID=your_novi_project_id_here
   VITE_EDAMAM_APP_ID=your_edamam_app_id_here
   VITE_EDAMAM_APP_KEY=your_edamam_app_key_here
   ```
4. Vul in `.env.server` dezelfde project-ID en een **bestaand beheerdersaccount** in (`NOVI_PROJECT_ID`, `NOVI_ADMIN_EMAIL`, `NOVI_ADMIN_PASSWORD`). Dit bestand blijft lokaal en mag niet in GitHub of de browser terechtkomen.
5. Start de app en registratieserver samen:
   ```bash
   npm start
   ```
   Open `http://localhost:5173/register` om zonder inloggen een account aan te maken. Start niet alleen Vite via `npm run web`, want dan is registratie niet bereikbaar.

## Beschikbare scripts
- `npm start` / `npm run dev` - Start Vite op poort 5173 en de registratieserver op poort 3000.
- `npm run web` - Start alleen Vite; bedoeld voor frontendwerk zonder registratie.
- `npm run build` - Maakt een productiebuild.
- `npm run serve` - Serveert de build en registratie vanaf één Node-server op poort 3000.
- `npm run test:registration` - Test invoercontrole en de serveraanroepen voor registratie.

## Projectstructuur
De actieve schermcomponenten en context-providers met JSX hebben een `.jsx`-extensie. Componentgebonden CSS staat naast de bijbehorende component; algemene tokens en opmaak staan in `src/index.css` en `src/App.css`.

- `src/main.jsx` - Rendert de React-app.
- `src/App.jsx` - Centrale app-structuur.
- `src/routes/` - Routing, dynamic routes en protected routes.
- `src/contexts/` - Context-providers voor authenticatie, recepten en mealplanning.
- `src/services/edamamService.js` - Centrale Edamam API-laag.
- `src/services/noviDataService.js` - CRUD voor de NOVI-collecties.
- `server/` - Serverroute voor openbare registratie; de NOVI-beheerdersgegevens blijven hier buiten de browser.
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


De receptenpagina toont loading, error, retry en empty states wanneer externe data wordt opgehaald. Voor het maaltijdtype gebruikt Edamam v2 `lunch/dinner` als gezamenlijke filterwaarde voor lunch en diner.

Kom je van de oude Create React App-versie? Zet je bestaande Edamam-waarden uit `REACT_APP_EDAMAM_APP_ID` en `REACT_APP_EDAMAM_APP_KEY` in je lokale `.env` onder respectievelijk `VITE_EDAMAM_APP_ID` en `VITE_EDAMAM_APP_KEY`. De sleutels horen niet in GitHub. Een geslaagde build alleen bevestigt nog niet dat jouw account of API-limiet een live verzoek toestaat.

## NOVI-API
De nieuwe backend gebruikt `https://novi-backend-api-wgsgz.ondigitalocean.app/api`. Bij elk verzoek stuurt de app de waarde van `VITE_NOVI_PROJECT_ID` mee als `novi-education-project-id` header. Inloggen gebruikt `POST /api/login` met `email` en `password`; het teruggegeven JWT-token wordt bij beveiligde verzoeken als Bearer-token gebruikt. De project-ID staat bewust niet in de repository. Kopieer `.env.example` naar `.env` en vul je eigen ID in. Vite bouwt `VITE_`-variabelen in de browsercode in: behandel de project-ID als een clientidentificatie, niet als een geheim dat door de frontend kan worden beschermd.

De projectomgeving is ingericht met `workouts`, `favorite_recipes` en `meal_plans`. Een voorbeeld van het schema zonder accountgegevens staat in `novi/fitness-planet.example.json`. Zet nooit een JSON-bestand met echte gebruikers en wachtwoorden in GitHub. NOVI staat `POST /api/users` alleen voor beheerders toe. Daarom verstuurt de openbare registratiepagina haar gegevens naar de eigen Node-server: die controleert e-mail en wachtwoord, kijkt of het adres al bestaat en maakt via NOVI uitsluitend een account met de rol `user` aan. De browser ontvangt nooit het beheerderswachtwoord of het beheerders-JWT.

Bij een productiepublicatie moet de Node-server samen met de gebouwde frontend worden gehost en moeten `NOVI_PROJECT_ID`, `NOVI_ADMIN_EMAIL` en `NOVI_ADMIN_PASSWORD` als geheime servervariabelen worden ingesteld. Een uitsluitend statische host kan dit registratieproces niet uitvoeren. De server heeft een eenvoudige limiet van vijf registratiepogingen per IP per kwartier; voor een commerciële dienst zijn aanvullende maatregelen zoals e-mailverificatie en centraal rate limiting nodig.

## Kernfuncties en huidige grenzen
- Een nieuwe bezoeker kan via `/register` zelf een account maken en daarna via NOVI inloggen. De server voert de vereiste beheerdersaanroep uit zonder beheerdersgegevens in de frontend te plaatsen. De beheerder kan daarnaast via `Gebruiker aanmaken` accounts toevoegen.
- De gewone inlog gebruikt `POST /api/login`. De demo-account werkt alleen in expliciete demomodus.
- Een gebruiker kan recepten via Edamam opzoeken, als favoriet via NOVI bewaren, in het profiel terugzien en per dag en eetmoment in de huidige week bij NOVI plannen.
- Workouts kunnen met type, intensiteit, datum en duur via NOVI worden toegevoegd, bekeken en verwijderd. De app haalt daarvoor de aan het ingelogde account gekoppelde lijst op.
- De NOVI-rollen staan CRUD toe voor `user` en `admin`; dit schema dwingt niet per item af dat een gebruiker alleen zijn eigen item mag wijzigen. Gebruik deze project-API niet als productieopslag voor vertrouwelijke persoonsgegevens.
- Oude browsergegevens worden niet automatisch naar NOVI overgezet. De automatische maaltijdgenerator en andere bestaande schermen gebruiken nog browseropslag.

## Demo login (alleen met `VITE_USE_DEMO_BACKEND=true`)
- Email: `demo@fitnessplanet.com`
- Wachtwoord: `demo123`

In de gewone app gaat inloggen via de NOVI-backend. De demo-inlog is alleen beschikbaar wanneer de ontwikkelaar de demomodus expliciet inschakelt.
