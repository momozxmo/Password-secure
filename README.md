# 🛡️ AEGIS Vault — Secure Password Manager

*Read this in other languages: [ภาษาไทย (Thai)](README_th.md)*

**AEGIS Vault** is a secure password management application focused on a premium aesthetic with a **Glassmorphism** design, a Dark/Cyber theme, and an interactive 3D particle background powered by **Three.js**.

All of your data is obfuscated and **stored exclusively in your browser's LocalStorage** (no data is transmitted to external servers).

![AEGIS Vault Preview](https://github.com/momozxmo/Password-secure/assets/preview.png) *(You can replace this image with an actual screenshot of the project)*

---

## ✨ Features

- **Premium UI/UX**: Glassmorphism design, smooth animations, and glow effects built into a modernized **Dashboard Layout**.
- **Dashboard & Quick Access**: Summary page featuring quick access cards for passwords and recent URLs, equipped with real-time search and filtering.
- **Sidebar Navigation**: Simple, intuitive, and highly responsive sidebar menu.
- **URL Bookmarks Manager**: In addition to passwords, you can save and categorize web links (LiveZone, TestZone, Team, etc.) effortlessly.
- **3D Background**: Futuristic space/cyber background with floating interactive particles rendered via **Three.js**.
- **Password Generator**: One-click generation of strong, international-standard 16-character passwords (including A-Z, a-z, 0-9, and special symbols).
- **Strength Indicator**: Real-time visual feedback representing password strength levels.
- **Categorization**: Systematically separate your passwords into custom categories such as PlayID, Team, and others.
- **Security (Local First)**: Data is safely stored strictly on your device via `localStorage`, integrated with Base64 encoding (Obfuscation).

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla CSS3**: Pure CSS structure and styling completely without the reliance on large frameworks (fully responsive on all devices).
- **Vanilla JavaScript (ES6)**: Lightweight and fast core application logic.
- **Three.js (ES Module)**: Powers the rich 3D graphics on the background canvas element.
- **Google Fonts**: `Space Grotesk` (for headings) and `JetBrains Mono` (for content and code blocks).

---

## 🚀 How to Run

Because this project utilizes **Three.js via ES Modules**, opening `index.html` directly from the file system will result in restrictive browser security errors (CORS / ORB). Therefore, running it via a Local Server is necessary:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the project:**
   ```bash
   git clone https://github.com/momozxmo/Password-secure.git
   cd Password-secure
   ```

2. **Run the local server via npx:**
   ```bash
   npx serve . -l 3456
   ```

3. **Open your browser and navigate to:**
   ```text
   http://localhost:3456
   ```

---

