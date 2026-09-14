# CPH Submit for Safari

A high-performance, low-latency Safari extension designed to seamlessly route competitive programming submissions from VS Code (CPH) directly to Codeforces, CSES, and other major judging platforms.

## ✨ Features
- **Zero-Latency Execution:** Built with an aggressive 80ms DOM-hunting routine to ensure near-instantaneous code injection and submission (end-to-end latency ~380ms).
- **Universal DOM Injector:** Dynamically adapts to any judging environment. Supports CodeMirror, Monaco, Ace, standard textareas, and injects "ghost files" directly into strict upload forms (like CSES).
- **Smart Virtual Participation Bypass:** Automatically detects Codeforces virtual contest walls on old problems and pivots the submission seamlessly to the global Problemset archive.
- **Auto-Reset Circuit:** Features a 4-second self-healing memory wipe to prevent the extension from locking up on 404 pages or network drops.
- **Native Safari Integration:** Runs natively on macOS with zero background bloat.

## 🚀 Installation Instructions

Because this extension is distributed independently as an open-source build, you will need to enable unsigned extensions in Safari to run it:

1. Download the latest `cph.macOS.zip` file from the [Releases](https://github.com/samraddhsingh20/cph_submit_safari/releases) page.
2. Unzip the file and move the resulting application into your **Applications** folder.
3. Open the app once to grant initial macOS permissions.
4. Open **Safari** and navigate to **Settings > Advanced**.
5. Check the box at the bottom for **Show features for web developers**.
6. In the top macOS menu bar, click **Develop** and select **Allow Unsigned Extensions**.
7. Go to **Safari Settings > Extensions** and enable **CPH Submit**.

*(Note: If you completely quit and restart Safari, you will need to re-check "Allow Unsigned Extensions" in the Develop menu due to Apple's security requirements).*

## 📁 Repository Structure
- `manifest.json`: Defines extension metadata, permissions, and universal host matching.
- `background.js`: Handles communication with the local VS Code CPH server, dynamic URL routing, and deduplication.
- `content.js`: The universal DOM injection engine that mounts your code to the target platform.
- `popup.html` / `popup.css` / `popup.js`: The extension's UI action popup interface.
- `images/`: Contains the extension toolbar and menu icons.
