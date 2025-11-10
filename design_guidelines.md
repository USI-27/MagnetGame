# Magnet Game - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from successful minimalist multiplayer browser games (Agar.io, Slither.io, Diep.io) that prioritize gameplay clarity and real-time visual feedback. The design emphasizes clean, distraction-free interfaces where game mechanics are immediately understandable through visual cues.

**Core Principle**: Maximum gameplay clarity with minimal UI interference. Every visual element serves a functional purpose in communicating game state, player status, or physics feedback.

---

## Typography System

**Primary Font**: Inter or Roboto (via Google Fonts CDN)
**Secondary Font**: JetBrains Mono for technical displays (coordinates, FPS counter)

**Hierarchy**:
- Game Title/Headers: 32px, bold (font-bold)
- Player Labels: 14px, medium (font-medium)
- HUD Stats: 12px, regular
- Tooltips/Instructions: 11px, regular

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 8, and 16
- Padding for HUD elements: p-4
- Margins between UI components: m-2 or m-4
- Game canvas padding from viewport edges: p-8

**Game Canvas**:
- Full viewport coverage with fixed aspect ratio (16:10 or 16:9)
- Centered canvas with max-width: 1400px
- Mobile: Full-width with responsive height adjustment

---

## Core UI Components

### 1. Game Canvas Area
**Layout**: Center-stage, occupying 90% of viewport
**Border**: Subtle stroke to define play boundary
**Grid Overlay**: Optional faint grid (50px squares) for spatial reference
**Background**: Minimal gradient or solid treatment

### 2. Player Magnets (Canvas Elements)
**Shape**: Circles with radius 20-40px (based on strength)
**Polarity Indicators**:
- North/Positive: "N" or "+" symbol in center
- South/Negative: "S" or "−" symbol in center
**Visual States**:
- Active (being controlled): Thicker stroke, subtle glow effect
- Idle: Standard stroke
- Attracting: Pulsing animation toward target
- Repelling: Subtle outward force lines

**Player Identification**: Small label above magnet showing username (12px)

### 3. HUD Overlay (Fixed Position)
**Top-Left Corner** (p-4):
- Player count: "Players: 4/8"
- Your polarity status: "Polarity: North" with toggle indicator
- FPS counter (dev mode)

**Top-Right Corner** (p-4):
- Mini-map showing all players (100x100px)
- Connection status indicator

**Bottom-Center**:
- Instructional tooltips that fade after 5 seconds
- "Arrow keys to move • Spacebar to toggle polarity"

### 4. Pre-Game Lobby/Menu
**Layout**: Centered card (max-w-md)
- Game title: 48px, bold, centered
- "Enter your name" input field (h-12, rounded-lg)
- "Join Game" button (h-12, w-full, rounded-lg)
- Active players list below (scrollable, max-h-64)
- Each player item: flex justify-between, py-2, border-b

### 5. Control Instructions Panel
**Position**: Slide-in from right (initially visible, dismissible)
**Width**: 280px
**Content**:
- Controls heading (text-lg, font-semibold)
- Keyboard shortcuts list (space-y-2)
- Physics explanation with visual diagram
- "Got it" dismiss button

---

## Physics Visualization

**Force Lines**: When magnets interact strongly (distance < 200px):
- Attraction: Curved lines connecting magnets (particle trail effect)
- Repulsion: Short radiating lines from magnet edge

**Velocity Indicators**: Small trailing particles showing movement direction and speed

**Collision Effects**: Brief flash and slight bounce animation on boundary collision

---

## Component Specifications

### Buttons
- Primary action: h-12, px-8, rounded-lg, font-medium
- Secondary action: h-10, px-6, rounded-md, font-regular
- Icon buttons (toggle polarity): w-12, h-12, rounded-full

### Input Fields
- Text input: h-12, px-4, rounded-lg, border-2
- Focus state: Ring effect with offset

### Cards/Panels
- Lobby card: rounded-xl, shadow-lg, p-8
- HUD panels: rounded-lg, backdrop-blur-md, p-4

---

## Icons

**Library**: Heroicons (via CDN)
- User icon for player labels
- Signal icon for connection status
- Magnet icon for polarity toggle
- Settings icon for game options

---

## Animations

**Minimal and Purpose-Driven**:
- Magnet polarity toggle: 200ms rotate transition
- Menu transitions: 300ms slide-in/fade
- Force field effects: Continuous subtle pulse (2s duration)
- Player join/leave: Brief scale animation (150ms)

**Physics-Based**: All magnet movements are physics-driven (no easing functions), maintaining authentic force simulation

---

## Responsive Considerations

**Desktop (lg+)**: Full multi-column HUD layout, larger canvas
**Tablet (md)**: Condensed HUD, touch-friendly control buttons overlay
**Mobile (base)**: Virtual joystick overlay (bottom-left), minimal HUD, portrait orientation support

---

## Accessibility

- High contrast magnet colors for polarity distinction
- Keyboard-only controls fully supported
- Screen reader announcements for player join/leave
- Visual and textual polarity indicators (not just visual alone)
- Clear focus states on all interactive elements

---

**Design Philosophy**: The game prioritizes immediate readability and smooth real-time feedback. Visual elements are purposeful, never decorative. The interface stays out of the player's way while providing all necessary information at a glance.