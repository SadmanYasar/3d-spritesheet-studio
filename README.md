# 3D Spritesheet Studio

> Convert 3D models and real-time webcam face captures into customizable 2D spritesheets, texture atlases, PNG sequences, and animated GIFs with MediaPipe 3D face mesh tracking, background removal, and live interactive cursor look-at simulation.

![3D Spritesheet Studio](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=for-the-badge&logo=three.js)
![MediaPipe](https://img.shields.io/badge/MediaPipe-FaceMesh-0052CC?style=for-the-badge&logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

<img width="1905" height="1555" alt="Screenshot 2026-08-07 at 03-34-28 3D Spritesheet Studio" src="https://github.com/user-attachments/assets/e0c97ad3-6aa6-4baf-b4f7-969be6a60ed7" />


## 🌟 Key Features

### 🧊 3D Model Studio & Interactive Viewport

- **Procedural Sample Models**: Includes ready-to-use 3D sample assets (_G-Man Head_, _Cyber Robot Head_, _Sci-Fi Helmet_, _Cute Alien Creature_, _Crystal Gem_).
- **Custom 3D File Upload**: Supports importing 3D model formats including `.glb`, `.gltf`, `.obj`, `.stl`, and `.ply`.
- **Real-Time Orbit Control**: Smooth rotation, panning, and zoom controls powered by `@react-three/fiber` and `@react-three/drei`.
- **PBR & Environment Reflection**: Real-time HDR environment reflections (`city`, `apartment`, `dawn`, `night`, `studio`, `park`) with material overrides (**Claymation**, **Chrome Metal**, **Stylized Toon**, **Wireframe**, or **Default**).

### 📷 Webcam Face Studio & MediaPipe Tracking

- **468 3D Landmark FaceMesh Tracking**: Real-time facial pitch, yaw, and roll orientation estimation powered by MediaPipe FaceMesh.
- **Pose-Guided Capture HUD**: Visual grid overlay with Amber Ghost Silhouette guide indicating exact head tilt angles (UP/DOWN/LEFT/RIGHT).
- **In-Browser Background Removal**: Real-time background removal powered by MediaPipe SelfieSegmentation and smart alpha feathering.
- **Manual & Automatic Snap**: `[SPACEBAR]` tap-to-snap capture workflow with shutter sound effects and automated target pose progression.

### 📐 Spritesheet & Atlas Baking Engine

- **Flexible Grid Arrangements**: Render as 2D Matrix Atlases, Horizontal Rows, or Vertical Columns.
- **Custom Frame Resolutions**: Choose cell sizes from **64x64px**, **128x128px**, **256x256px**, up to **512x512px**.
- **Multi-Axis Capture Mode**: Simultaneously capture Pitch (X-axis look up/down) and Yaw (Y-axis look left/right) for dynamic 2D cursor look-at avatars.
- **Single-Axis 360° Spin Mode**: Clean rotational captures around X, Y, or Z axes over custom angle spans.

### 🎯 Live Cursor Look-At Simulator & Code Exporter

- **Interactive Test Canvas**: Test mouse-cursor tracking live on generated 2D spritesheets before exporting.
- **Tuning Controls**: Adjustable tracking radius, sensitivity multiplier, and axis inversion toggles (Invert X/Y).
- **Developer Code Embed Generator**: Generates copy-paste code snippets for both **React (JSX)** and **Vanilla HTML/JavaScript**.

### 📦 Export & Package Options

- **PNG Texture Atlas**: Single consolidated high-resolution PNG spritesheet.
- **Animated GIF**: Export smooth loopable GIFs generated via `gifshot`.
- **ZIP Frame Pack**: Uncompressed archive of individual frame PNG files powered by `jszip`.
- **JSON Metadata**: Standard texture atlas JSON format containing frame coordinates and rotation angles.

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
- **Computer Vision & AI Tracking**: [@mediapipe/face_mesh](https://developers.google.com/mediapipe/solutions/vision/face_landmarker), [@mediapipe/selfie_segmentation](https://developers.google.com/mediapipe/solutions/vision/image_segmenter), [@mediapipe/camera_utils](https://developers.google.com/mediapipe)
- **Styling & UI Components**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Radix UI Primitives](https://www.radix-ui.com/)
- **Export Processing**: [JSZip](https://stuk.github.io/jszip/), [Gifshot](https://github.com/yahoo/gifshot)
- **Build Tooling**: [Vite](https://vitejs.dev/)

---

## 📜 License

Distributed under the GPL-3.0-only License. See `LICENSE` for more information.
