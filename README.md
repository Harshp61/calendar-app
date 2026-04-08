# Wall Calendar App

A highly interactive, realistic wall calendar application built with Next.js, React, and Tailwind CSS. The interface mimics a physical calendar hanging on a virtual wall.

## Design Choices & Features

- **Realistic Physical Details**: 
  - Modeled a realistic, rounded "nail head" flush against the wall at the top of the calendar.
  - Implemented 3D-like stacking on the right edge border, simulating layers of thick paper.
  - Included a realistic metallic spiral binding effect across the top edge.
- **Component Architecture**: 
  - Constructed everything around a robust `<WallCalendar />` component located in `src/components/WallCalendar.tsx`.
  - Used Tailwind for rapid, inline styling, shadows, typography, and complex gradients that give the calendar its depth.
- **Asset Consolidation**: 
  - Ensured all image assets (hero images for each month) are neatly referenced, pulling them from public assets to keep imports clean.
- **Data Persistence**:
  - Implemented client-side `localStorage` to ensure your monthly notes and assigned task ranges persist across browser refreshes.

## Getting Started

To run this project locally, make sure you have Node.js installed, then follow these steps:

1. **Install Dependencies**
   Run the following command to install required packages:
   ```bash
   npm install
   ```
   *(or use `yarn install`, `pnpm install`, or `bun install`)*

2. **Run the Development Server**
   Start the local Next.js dev server:
   ```bash
   npm run dev
   ```

3. **View in Browser**
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript / TSX
- **Fonts**: Optimized local fonts using `next/font`
