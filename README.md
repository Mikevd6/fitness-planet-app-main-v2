# Fitness Planet

Een Nederlandstalige React-app voor het plannen van maaltijden, het volgen van workouts en het beheren van je voedingsdoelen. De applicatie combineert een overzichtelijke dashboardervaring met receptenzoekopdrachten via de Edamam API en biedt hulpmiddelen voor wekelijkse mealplanning en voortgangsrapportage.

## Functies
- **Authenticatie en sessiebeheer:** Inloggen, registreren en uitloggen via de `AuthContext`, inclusief sessieherstel op basis van opgeslagen tokens.
- **Dashboardoverzicht:** Snelle inzage in dagelijkse calorieën, workouts, waterinname en slaapgegevens, plus welkomstbericht op basis van de aangemelde gebruiker.
- **Workout- en voedingstrackers:** Pagina's voor het plannen van trainingen en het bijhouden van voedingsinname, volledig in het Nederlands.
- **Recepten en maaltijdplanning:** Zoek recepten via de Edamam API, beheer favorieten en plan gerechten per dag en maaltijdtype met calorie-totalen per dag en week.
- **Progressie en profiel:** Bekijk voortgangspagina's en beheer persoonlijke instellingen zoals wachtwoordwijzigingen en notificatievoorkeuren.

## Installatie
1. Zorg dat Node.js en npm zijn geïnstalleerd.
2. Installeer de dependencies:
   ```bash
   npm install
   ```
3. Kopieer de voorbeeldconfiguratie en vul de waarden aan:
   ```bash
   cp .env.example .env
   ```
   Vul de Edamam API-sleutels (`REACT_APP_EDAMAM_APP_ID`, `REACT_APP_EDAMAM_APP_KEY`) en eventuele andere waarden naar wens in.
4. Start de ontwikkelserver:
   ```bash
   npm start
   ```
   De app is bereikbaar op `http://localhost:3000`.

## Beschikbare scripts
- `npm start` — Start de ontwikkelserver met hot reloading.
- `npm test` — Voert de test-suite uit.
- `npm run build` — Maakt een geoptimaliseerde productie-build.
- `npm run eject` — Maakt alle configuratiebestanden zichtbaar (niet omkeerbaar).

## Projectstructuur
- `src/App.js` — Routering en beschermde routes voor ingelogde gebruikers.
- `src/contexts/` — Context-providers voor authenticatie, recepten en maaltijdplanning.
- `src/components/` — UI-componenten zoals dashboard, trackers, receptenzoeker en profielpagina's.
- `src/services/` — API-clients, waaronder de Edamam-service voor recepten en voeding.
- `public/` — Statische assets en HTML-template.

## Omgevingsvariabelen
Alle configuratie gebeurt via `.env`. De belangrijkste velden staan in `.env.example` en omvatten de Edamam-API-gegevens, app-naam, versie en feature-vlaggen. Voeg je eigen waarden toe voordat je de app draait of bouwt.
