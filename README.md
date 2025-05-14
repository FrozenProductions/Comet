> [!CAUTION]
> Using [Roblox](https://www.roblox.com) executors may result in your account being banned. Use at your own risk. The developers are not responsible for any consequences.

# <div align="center">Comet</div>

<div align="center">
  <img src=".github/assets/Icon.png" alt="Comet" width="120" />
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
  <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
    <img src=".github/assets/preview_1.png" alt="Comet Editor" width="390" />
    <img src=".github/assets/preview_2.png" alt="Comet Settings" width="390" />
    <img src=".github/assets/preview_3.png" alt="Comet Scripts Library" width="390" />
    <img src=".github/assets/preview_4.png" alt="Comet Auto Execute" width="390" />
    <img src=".github/assets/preview_5.png" alt="Comet Fast Flags" width="390" />
  </div>
</div>

## <div align="center">🛠️ Tech Stack</div>

-   **Framework**: [Tauri](https://tauri.app) - Lightweight, secure native apps
-   **Frontend**: [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com)
-   **Backend**: [Rust](https://www.rust-lang.org)
-   **Icons**: [Lucide](https://lucide.dev)

## <div align="center">🔌 Hydrogen Integration</div>

<div align="center">
    Comet integrates with Hydrogen's official API through a Rust-based wrapper. The implementation can be found in:
</div>
<br>

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

## <div align="center">👥 Credits</div>

<div align="center">

|                                                                    Avatar                                                                    | Name                   | Role                                 |
| :------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------- | :----------------------------------- |
| <a href="https://github.com/FrozenProductions"><img src="https://github.com/FrozenProductions.png" width="50" alt="Frozen Productions"/></a> | **Frozen Productions** | Comet Developer                      |
|               <a href="https://github.com/xGladius"><img src="https://github.com/xGladius.png" width="50" alt="xGladius"/></a>               | **xGladius**           | Hydrogen Developer                   |
|          <a href="https://github.com/MaximumADHD"><img src="https://github.com/MaximumADHD.png" width="50" alt="MaximumADHD"/></a>           | **MaximumADHD**        | Roblox FFlag Tracking System Creator |

</div>

## <div align="center">📄 License</div>

<div align="center">
  MIT License - See <a href="LICENSE">LICENSE</a> for details
</div>
