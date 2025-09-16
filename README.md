# painting-with-roughness — React + TypeScript

### Quick Start

1. `npm install`  
2. `npm run dev`

This project uses **Vite + React + TypeScript**. The primary app is `src/App.tsx` (default export component).  

The canvas is responsive; use the controls to start/stop, step, randomize, and clear the simulation.

### Warning:
This program may cause rapidly flashing light effects depending on how the settings are configured.

These effects become rapid at high speeds, so it might be worth testing on slower speeds first if you are concerned.

The effect can be easier to induce depending on the current count settings, such as when selecting the the Conway's Game of Life spread pattern with same birth and survive count values simultaneously

### Controls

Press **1-8** to swap to one of the 8 colors in the current palette.

**Shift** toggles menu visibility. Pressing **Shift** once will cause the toolbox to disappear. Pressing **Shift** again will cause it to reappear where your mouse is.

**T** toggles menu transparency.

Use **W**,**A**,**S**,**D** or **Up**, **Left**, **Down**, **Right** to toggle directions for certain spread patterns.

Use **B**,**F**,**E** to toggle **Brush**, **Fill**, **Erase** respectively.

Use **U**,**I**,**O**,**P** to toggle **Brush (Square)**, **Brush (Circle)**, **Brush (Diagonal)**, **Brush (Spray)** respectively.

Press **Space**, **J**, **K**, **L** to toggle auto **Spread**, **Dots**, **Shapes**, **All** respectively.

Press **9** and **0** to adjust **Brush Size**. Press **\[** and **\]** to adjust **Diagonal Thickness** and **Spray Density** when corresponding brush types are enabled.

Press **R** to toggle **Recording** when enabled.
