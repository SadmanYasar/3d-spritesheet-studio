# 3D Spritesheet Studio

> Convert 3D models into customizable 2D spritesheets, texture atlases, PNG sequences, and animated GIFs with 360° multi-axis grid captures and live interactive cursor look-at simulation.

![3D Spritesheet Studio](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=for-the-badge&logo=three.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## 🌟 Key Features

### 🧊 3D Model Support & Interactive Viewport

- **Procedural Sample Models**: Includes ready-to-use 3D sample assets (_Cyber Robot Head_, _Sci-Fi Helmet_, _Cute Alien Creature_, _Crystal Gem_).
- **Custom 3D File Upload**: Supports importing 3D model formats including `.glb`, `.gltf`, `.obj`, `.stl`, and `.ply`.
- **Real-Time Orbit Control**: Smooth rotation, panning, and zoom controls powered by `@react-three/fiber` and `@react-three/drei`.

### 📐 Spritesheet & Atlas Baking Engine

- **Flexible Grid Arrangements**: Render as 2D Grid Atlases, Horizontal Rows, or Vertical Columns.
- **Custom Frame Resolutions**: Choose cell sizes from **64x64px**, **128x128px**, **256x256px**, up to **512x512px**.
- **Multi-Axis Capture Mode**: Simultaneously capture Pitch (X-axis look up/down) and Yaw (Y-axis look left/right) for dynamic 2D cursor look-at avatars.
- **Single-Axis 360° Spin Mode**: Clean rotational captures around X, Y, or Z axes over custom angle spans.

### 🎨 Scene, Camera & Material Customization

- **Shading Overrides**: Apply material styles on the fly, including **Claymation**, **Chrome Metal**, **Stylized Toon**, **Wireframe**, or **Default**.
- **Lighting Controls**: Independent sliders for directional light intensity, ambient light, and camera elevation/zoom.
- **Background Styles**: Support for full PNG transparency with checkerboard previews, or solid custom background colors.

### 🎯 Live Cursor Look-At Simulator & Code Exporter

- **Interactive Test Canvas**: Test mouse-cursor tracking live on generated 2D spritesheets before exporting.
- **Tuning Controls**: Adjustable tracking radius, sensitivity multiplier, and axis inversion toggles (Invert X/Y).
- **Developer Code Embed Generator**: Generates copy-paste code snippets for both **React (JSX)** and **Vanilla HTML/JavaScript**.

### 📦 Export & Package Options

- **PNG Texture Atlas**: Single consolidated high-resolution PNG spritesheet.
- **Animated GIF**: Export smooth loopable GIFs generated via `gifshot`.
- **ZIP Frame Pack**: Uncompressed archive of individual frame PNG files powered by `jszip`.
- **JSON Metadata**: Standard texture atlas JSON format containing frame coordinates and rotation angles.

### 💾 Presets & Theme Support

- **LocalStorage Presets**: Save and reload custom configuration presets across sessions.
- **Brutalist Theme**: High-contrast, responsive UI with seamless Light & Dark Mode switching.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** or **bun**

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/3d-spritesheet-studio.git
cd 3d-spritesheet-studio
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling & UI Components**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Radix UI Primitives](https://www.radix-ui.com/)
- **Export Processing**: [JSZip](https://stuk.github.io/jszip/), [Gifshot](https://github.com/yahoo/gifshot)
- **Build Tooling**: [Vite](https://vitejs.dev/)

---

## 📖 Usage Guide

1. **Select or Upload a 3D Model**: Choose a sample asset or upload a custom `.glb`/`.obj` file.
2. **Configure Spritesheet Layout**: Set your target frame resolution, row/column counts, and rotation angles (Multi-Axis or Single-Axis).
3. **Tune Scene & Shading**: Adjust lighting, material override (e.g. Clay or Toon), and camera distance.
4. **Bake Spritesheet**: Click **Bake Spritesheet** to render all angles to a texture atlas.
5. **Inspect & Export**: Preview the animation loop, download PNG/GIF/ZIP/JSON assets, or switch to the **Look-At Simulator** tab to test mouse tracking and copy implementation code.

---

## 📜 License

Distributed under the GPL-3.0-only License. See `LICENSE` for more information.
