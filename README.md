# MileageTracker — Vehicle Lease & Mileage Tracking PWA

**MileageTracker** is a sleek, modern, and mindful Progressive Web App (PWA) designed to track vehicle lease usage, monitor odometer history, and simulate upcoming travel miles against a contractual budget. 

Built with **React**, **Vite**, **Tailwind CSS**, and **motion/react** for smooth interfaces.

---

## Features

- 🏎️ **Dynamic Odometer Logging**: Easily update your current mileage and record custom trip details with categories.
- 📊 **Analytical Trends & Visualizations**: Interactive monthly, yearly, and total lease visual tracking bars.
- 🗺️ **"What-If" Road Trip Simulator**: Drag interactive sliders to instantly simulate how future trips affect your lease-end cushion.
- 📱 **Progressive Web App (PWA)**:
  - Add to Home Screen (A2HS) support with full responsive layout.
  - Custom brand logo (sleek car silhouette inside dashboard dial).
  - Service worker and offline shell caching for reliability on the road.
  - Seamless background-compatible migration from legacy configurations (e.g., *ZenLog*).

---

## Installation & Local Development

### GitHub Repository & Live App
* **GitHub Repository**: [https://github.com/christineecker/MileageTracker](https://github.com/christineecker/MileageTracker)
* **Live Hosted PWA / App URL**: [https://christineecker.github.io/MileageTracker/](https://christineecker.github.io/MileageTracker/)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (packaged with Node.js)

### Step-by-Step Guide

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/christineecker/MileageTracker.git
   cd MileageTracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   Start Vite's ultra-fast local development environment:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or the port specified in the terminal).

4. **Lint & Build**
   To check for TypeScript errors and compile the production build:
   ```bash
   npm run lint
   npm run build
   ```
   The optimized production assets will be generated in the `dist/` directory.

---

## Installing as a PWA (Mobile & Desktop)

Since MileageTracker is fully configured with an offline-capable Service Worker and standard web app manifest:

### On Mobile (iOS & Android)
1. Open the application URL in **Safari** (iOS) or **Chrome** (Android).
2. Tap the **Share** button (iOS) or the **Menu** button (Android, three dots).
3. Select **Add to Home Screen**.
4. The **MileageTracker** app icon will appear alongside your other native apps!

### On Desktop (Chrome & Edge)
1. Navigate to the application URL in your browser.
2. Click the **Install Icon** (overlapping screens or down arrow) at the far right of the address bar.
3. Click **Install**.
