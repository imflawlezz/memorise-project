# Memorise

A flashcard learning app with SM-2 spaced repetition algorithm, built with Ionic React and Capacitor.

## Features

- **Deck Management** — Create, edit, and organize flashcard decks
- **Simple Flashcards** — Text-based front/back cards
- **Spaced Repetition (SM-2)** — Intelligent scheduling based on memory performance
- **Review Sessions** — Flip-card interface with difficulty rating (Again, Hard, Good, Easy)
- **Statistics** — Track daily progress and streak
- **Dark/Light Theme** — Auto-adapts to system preference

## Tech Stack

- **Frontend:** React 19 + Ionic 8
- **Build:** Vite + TypeScript
- **Platforms:** Web, Android, iOS (Capacitor)
- **Data:** localStorage

## Getting Started

```bash
cd memorise-app
npm install
npm run dev
```

## Build

```bash
# Web production build
npm run build

# Mobile platforms
npx cap sync
npx cap open android  # or ios
```
