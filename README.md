# Nautilux

A React + TypeScript card game built with Vite. Play equations from your hand into ocean zones, clear your hand, and finish with the best score you can.

## Requirements

- Node.js
- npm
- Windows is required for building the local `.exe`

## Install

```powershell
npm install
```

## Run The Web App Locally

```powershell
npm run dev
```

Open the URL Vite prints, usually:

```text
http://localhost:5173/
```

Keep the terminal open while playing. Code changes update the browser app automatically.

## Build The Web App

```powershell
npm run build
```

This checks TypeScript and creates a production web build in `dist/`.

## Build The Desktop App

```powershell
npm run dist
```

This builds the React app, generates a Windows icon from `public/icon.png`, and packages the Electron desktop app into:

```text
desktop-release\NLUX The Card Game-win32-x64\NLUX The Card Game.exe
```

The generated desktop build folders are ignored by Git. Commit the source and package files, not the generated `.exe` output.

## Desktop Icon

The executable icon comes from:

```text
public\icon.png
```

During `npm run dist`, that image is converted into:

```text
.icons\icon.ico
```

If Windows Explorer shows an old icon after rebuilding, refresh Explorer or rebuild into a fresh output folder. Windows may cache icons by file path.

## Controls

- Click a card: select or unselect it.
- Drag a card: reorder the hand with the mouse.
- `ArrowLeft` / `ArrowRight`: move keyboard focus between cards.
- `Space`: select or unselect the focused card.
- `ArrowUp`: pick up the focused card for keyboard reordering.
- `ArrowLeft` / `ArrowRight` while picked up: move the picked-up card.
- `ArrowUp` or `ArrowDown` while picked up: place the card down.
- `Enter`: cast a valid equation.
- `Escape`: clear selected cards.
- `N`: start a new game.
- `G`: give up.
- `?`: show or hide the rules.
- `Shift`: draw a card when manual draw mode is enabled.

## Sound

Sound is optional and off by default. Use the sound button on the title screen or in the game toolbar to turn it on or off. The preference is saved locally in the browser or desktop app.

## Selection Feedback

- One or two selected cards are shown as a pending light-blue selection.
- Valid equations are shown in green.
- Invalid equations with three or more selected cards are shown in red.
- Keyboard focus uses a sunlight-yellow outline.
- Mouse or pointer input hides the keyboard focus outline until arrow-key navigation resumes.

## Game Rules

Equations require at least three cards.

- Number equations: one number card must equal the sum of the other selected number cards.
- Face result equations: one face card can be the result when the selected number cards all share the same value.
- Face-only equations: face cards can form an equation when the left side shares the same rank.

Played equations sink into ocean zones based on total point value. Clear the hand and deck to complete the voyage.

## Useful Scripts

```powershell
npm run dev
npm run build
npm run dist
npm run test
npm run lint
```

## Project Structure

```text
electron/              Electron main process
public/                Static assets, including icon.png
scripts/               Build helper scripts
src/components/        React UI components
src/hooks/             Game state hooks
src/logic/             Deck, rules, scoring, and types
src/pages/             App screens
```
