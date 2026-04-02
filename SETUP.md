# Setup Guide

## 1. Installera dependencies

```bash
npm install
```

## 2. Sätt upp databasen

```bash
npx prisma generate
npx prisma db push
```

Detta skapar en SQLite-databas lokalt (ingen extern databas behövs).

## 3. Konfigurera environment variables

Öppna `.env.local` och uppdatera:

```
NEXTAUTH_SECRET=generera-en-random-string-här
```

Generera en random string för NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 4. Starta appen

```bash
npm run dev
```

## 5. Testa

1. Gå till http://localhost:3000
2. Klicka "Logga in" → "Registrera dig"
3. Skapa ett konto
4. Logga in
5. Klicka på en bar på kartan
6. Testa "Rapportera in" och kommentarer

## Vad som händer när du rapporterar:

- Rapporten sparas i databasen med ditt användarnamn
- Andra användare ser din rapport under "Senaste rapporter"
- Du kan uppdatera match, hur fullt det är, ölpris, och om det är ljud

## Kommentarer:

- Skriv vad du vill om baren
- Alla ser dina kommentarer
- Timestamps visar hur länge sedan

## Utan inlogg:

- Du kan se kartan och matcher
- Du kan se andras rapporter och kommentarer
- Men du kan inte rapportera eller kommentera själv
