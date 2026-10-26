# Fitness Planet

Een Nederlandstalige React-app voor het plannen van maaltijden, het volgen van workouts en het beheren van voedingsdoelen. De applicatie gebruikt de Edamam Recipe Search API v2 voor externe receptdata.

## Functies
- Authenticatie en sessiebeheer via `AuthContext`.
- Dashboard, workouts, voeding, recepten, mealplanning, progressie en profiel.
- Recepten zoeken via Edamam met loading, error en empty states in de UI.
- Workouts, opgeslagen favoriete recepten en de handmatige weekplanning worden via NOVI opgeslagen. Andere oude schermen gebruiken nog browseropslag.

## Benodigdheden
- Installeer [Node.js](https://nodejs.org/en/download) **22.12 of nieuwer** (bij voorkeur de actuele LTS-versie). Dit project gebruikt Vite 7; oudere Node-versies kunnen de app niet starten. **npm 10 of nieuwer wordt met Node.js meegeïnstalleerd** en hoeft niet apart te worden gedownload. Controleer de installatie met `node --version` en `npm --version`.
- De Edamam-app-ID en API-key zijn opgenomen in het meegeleverde `.env`-bestand naast `package.json`. De docent hoeft geen eigen API-key aan te maken.
- De bestaande NOVI-project-ID is opgenomen in `.env`; de serverconfiguratie met de NOVI-beheerdersgegevens staat in `.env.server`. De docent hoeft geen eigen project of beheerder aan te maken.

## Installatie en starten
1. Pak de ingeleverde project-ZIP uit en open de map met `package.json` in een terminal. Gebruik voor beoordeling deze ZIP, omdat de lokale configuratie niet op GitHub staat.
2. Installeer de dependencies met `npm install`.
3. Behoud het meegeleverde `.env`-bestand; overschrijf dit niet met `.env.example`. Zowel `.env` als `.env.server` zijn meegeleverd.
4. Start beide onderdelen met `npm start`.
5. Open `http://localhost:5173/register` en maak met een nog niet gebruikt e-mailadres een account aan. Log daarna in via `http://localhost:5173/login`. Houd de terminal open tijdens het testen; stop met `Ctrl+C`.

De configuratiebestanden worden privé met de opdracht ingeleverd en blijven buiten GitHub.

De app start lokaal, maar **NOVI draait niet lokaal**. De frontend verstuurt login- en gegevensverzoeken via internet naar de NOVI-API, met de project-ID in een header en na inloggen een JWT. Alleen openbare registratie gaat eerst naar de eigen lokale Node-server op `/registration`; die maakt met het beheerdersaccount een gewone gebruiker aan bij NOVI. De receptenpagina haalt recepten rechtstreeks bij Edamam op. Start daarom beide onderdelen met `npm start`; `npm run web` alleen maakt registratie niet bereikbaar. Zonder internetverbinding of juiste projectgegevens werken deze externe functies niet.

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
De nieuwe backend gebruikt `https://novi-backend-api-wgsgz.ondigitalocean.app/api`. Bij elk verzoek stuurt de app de waarde van `VITE_NOVI_PROJECT_ID` mee als `novi-education-project-id` header. Inloggen gebruikt `POST /api/login` met `email` en `password`; het teruggegeven JWT-token wordt bij beveiligde verzoeken als Bearer-token gebruikt. De project-ID staat in het meegeleverde `.env`-bestand. De docent gebruikt de aangeleverde configuratie. Vite bouwt `VITE_`-variabelen in de browsercode in: behandel de project-ID als een clientidentificatie, niet als een geheim dat door de frontend kan worden beschermd.

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
