# API Setup Guide

## Google Places API

### Steg 1: Skapa Google Cloud-konto
1. Gå till: https://console.cloud.google.com/
2. Logga in med ditt Google-konto
3. Acceptera villkoren

### Steg 2: Skapa projekt
1. Klicka på projektväljaren längst upp (bredvid "Google Cloud")
2. Klicka "NEW PROJECT"
3. Namnge projektet: "Stockholm Sports Bars"
4. Klicka "CREATE"

### Steg 3: Aktivera Places API
1. I menyn till vänster, klicka "APIs & Services" → "Library"
2. Sök efter "Places API"
3. Klicka på "Places API"
4. Klicka "ENABLE"

### Steg 4: Skapa API-nyckel
1. Gå till "APIs & Services" → "Credentials"
2. Klicka "CREATE CREDENTIALS" → "API key"
3. En popup visar din nyckel - KOPIERA DEN
4. Klicka "CLOSE"

### Steg 5: Säkra nyckeln (viktigt!)
1. Klicka på din nyckel i listan
2. Under "API restrictions":
   - Välj "Restrict key"
   - Bocka i "Places API"
3. Klicka "SAVE"

**Din nyckel ser ut typ:** `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## API-Football

### Steg 1: Registrera konto
1. Gå till: https://www.api-football.com/
2. Klicka "Sign Up" (uppe till höger)
3. Fyll i:
   - Email
   - Password
   - Välj "Free Plan"
4. Bekräfta din email

### Steg 2: Hämta API-nyckel
1. Logga in på: https://dashboard.api-football.com/
2. Du ser direkt din "API Key" på dashboard
3. KOPIERA nyckeln

**Din nyckel ser ut typ:** `1234567890abcdef1234567890abcdef`

### Steg 3: Testa att den fungerar
1. Gå till: https://dashboard.api-football.com/soccer
2. Klicka på "Fixtures" → "By Date"
3. Om du ser matcher fungerar det!

**Gratis plan:** 100 requests per dag (räcker gott)

---

## Lägg till i .env.local

Skapa filen `.env.local` i projektets rot:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.din_mapbox_token_här
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FOOTBALL_API_KEY=1234567890abcdef1234567890abcdef
```

Spara och starta om servern: `npm run dev`

---

## Felsökning

**Google Places säger "This API project is not authorized":**
- Vänta 5 minuter, det kan ta tid att aktivera
- Kolla att du aktiverat "Places API" i Library

**API-Football returnerar 401:**
- Kolla att du kopierat hela nyckeln
- Logga in på dashboard och verifiera att kontot är aktivt

**Kartan visar inte:**
- Kolla att Mapbox-token börjar med "pk."
- Testa token på: https://account.mapbox.com/access-tokens/
