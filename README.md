# Stockholm Sports Bars 🍺⚽

En interaktiv webbapp för att hitta bästa sportbaren i Stockholm för att se fotbollsmatcher live.

## Funktioner

- 🗺️ Interaktiv karta över Stockholm med Mapbox
- 🏟️ Lista på sportbarer från Google Places API
- ⚽ Live-matcher från fotbolls-API
- 📊 Live-status på hur fullt det är
- 💰 Pris på stor stark
- 📢 "Rapportera Live"-funktion för användare på plats
- 🎨 Mörk och sportig design

## Installation

1. Installera dependencies:
```bash
npm install
```

2. Skapa en `.env.local` fil baserad på `.env.local.example`:
```bash
cp .env.local.example .env.local
```

3. Lägg till dina API-nycklar i `.env.local`:

### Mapbox Token
- Gå till [Mapbox](https://www.mapbox.com/)
- Skapa ett konto och hämta din access token
- Lägg till: `NEXT_PUBLIC_MAPBOX_TOKEN=din_token_här`

### Google Places API Key
- Gå till [Google Cloud Console](https://console.cloud.google.com/)
- Skapa ett projekt och aktivera Places API
- Skapa en API-nyckel
- Lägg till: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=din_nyckel_här`

### Football API Key
- Gå till [API-Football](https://www.api-football.com/)
- Registrera dig och hämta din API-nyckel
- Lägg till: `NEXT_PUBLIC_FOOTBALL_API_KEY=din_nyckel_här`

## Kör projektet

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Teknisk stack

- **Next.js 14** - React framework med App Router
- **TypeScript** - Typsäkerhet
- **Tailwind CSS** - Styling
- **Mapbox GL** - Interaktiv karta
- **Google Places API** - Hämta sportbarer
- **API-Football** - Live-matcher och resultat

## Projektstruktur

```
├── app/
│   ├── api/
│   │   ├── bars/          # API för att hämta barer
│   │   ├── matches/       # API för att hämta matcher
│   │   └── live-report/   # API för live-rapporter
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Map.tsx            # Mapbox-karta
│   ├── MatchSidebar.tsx   # Sidomeny med matcher
│   └── BarDetails.tsx     # Detaljer om vald bar
├── types/
│   └── index.ts           # TypeScript-typer
└── README.md
```

## Nästa steg

För att göra appen produktionsklar:

1. Ersätt mock-data i API-routes med riktiga API-anrop
2. Lägg till en databas för att spara live-rapporter
3. Implementera autentisering för användare
4. Lägg till caching för API-anrop
5. Optimera för mobil
6. Lägg till felhantering och loading states

## Licens

MIT
