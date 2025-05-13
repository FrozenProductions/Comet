# <div align="center">Comet</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/FrozenProductions/Comet/refs/heads/main/public/Icon.png" alt="Comet" width="120" />
</div>

<div align="center">
  <p>A modern, minimalist interface for Hydrogen executor developed with Tauri.</p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=Tauri&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" />
</div>

## <div align="center">✨ Preview</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/FrozenProductions/Comet/refs/heads/main/public/resources/comet_preview.png" alt="Comet Editor" width="800" />
  <br/><br/>
  <img src="https://raw.githubusercontent.com/FrozenProductions/Comet/refs/heads/main/public/resources/comet_settings_preview.png" alt="Comet Settings" width="800" />
</div>

## <div align="center">⚠️ Warning</div>

<div align="center">
  <strong>Using <a href="https://www.roblox.com">Roblox</a> executors may result in your account being banned. Use at your own risk. The developers are not responsible for any consequences.</strong>
</div>

## <div align="center">🛠️ Tech Stack</div>

-   **Framework**: [Tauri](https://tauri.app) - Lightweight, secure native apps
-   **Frontend**: [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com)
-   **Backend**: [Rust](https://www.rust-lang.org)
-   **Icons**: [Lucide](https://lucide.dev)

## <div align="center">🔌 Hydrogen Integration</div>

Comet integrates with Hydrogen's official API through a Rust-based wrapper. The implementation can be found in:

-   [`src-tauri/src/main.rs`](https://github.com/FrozenProductions/Comet/blob/main/src-tauri/src/main.rs) - API wrapper implementation
-   [`public/resources/api.js`](https://github.com/FrozenProductions/Comet/blob/main/public/resources/api.js) - Official Hydrogen API

## <div align="center">🚀 Getting Started</div>

```bash
# Clone the repository
git clone https://github.com/FrozenProductions/Comet.git

# Navigate to the directory
cd Comet

# Install dependencies
npm install

# Start development
npm run tauri:dev

# Build for production
npm run tauri:build:universal
```

## <div align="center">📄 License</div>

<div align="center">
  MIT License - See <a href="LICENSE">LICENSE</a> for details
</div>
