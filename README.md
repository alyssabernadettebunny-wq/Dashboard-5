# Cherry Brain

A private, mobile-first cognitive-care app. Cherry Brain lets you drop in
thoughts, journal entries, events, complaints, ideas, body observations, and
medication notes without organizing anything up front, then quietly looks for
evidence-backed patterns across what you've written — and shows you the
receipts for every observation.

This is not a task manager, habit tracker, or chatbot. There are no streaks,
scores, or overdue counts.

## Stack

- Expo + Expo Router
- React Native + TypeScript
- Local-first storage (`@react-native-async-storage/async-storage`)
- A transparent, rule-based pattern engine, built behind a `PatternEngine`
  interface so a real AI model can replace or augment it later without any
  screen or storage code changing

## Project layout

```
app/                 Expo Router routes (5 tabs + entry/pattern detail screens)
src/models/          Typed data models
src/storage/         Repository layer over AsyncStorage (DataStore interface)
src/patternEngine/   Rule-based pattern engine (tagging, rules, confidence)
src/state/           AppDataProvider — ties storage + engine to the UI
src/theme/           Colors, spacing, typography
src/components/      Shared UI (cards, buttons, chips, badges)
src/seed/            Optional, removable development seed data
```

## Running it

```bash
npm install
npm start
```

Then scan the QR code with Expo Go on your phone, or press `w` for web.

## Desktop

Cherry Brain runs as one shared codebase across iOS, Android, and web — the
web build (React Native Web) is the desktop experience, with a responsive
layout that switches from a bottom tab bar to a left sidebar and a two-column
Home digest above ~900px wide. It's not a separate Electron app; it's the
same app in a browser window.

**Windows:** double-click `scripts/windows/CherryBrain.bat`, or run
`scripts/windows/Create-Desktop-Shortcut.ps1` once to add a "Cherry Brain"
desktop shortcut. See `scripts/windows/README.md` for details.

## Development seed data

Settings → Development Seed Data lets you add a set of sample journal
entries (medication changes, family friction, warmth toward kids/pets,
creative excitement) to see the pattern engine produce its flagship
observation — that irritation may be selective rather than generalized —
with full supporting evidence. Remove it at any time from the same screen.
