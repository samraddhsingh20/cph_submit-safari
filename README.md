# CPH Submit for Safari (v1.0.0)

Universal low-latency competitive programming submission helper for Safari. Seamlessly bridges your local Competitive Programming Helper (CPH) environment with Codeforces and CSES.

## Features
* **Universal Routing:** Automatically maps problems and intercepts URLs for instant Codeforces and CSES submissions.
* **Low-Latency Polling:** 150ms heartbeat sync ensures zero-delay injections.
* **Live Connection Tracker:** Custom Safari toolbar popup to monitor port 27121 connectivity in real-time.
* **Virtual Participation Bypass:** Intelligently evades Codeforces registration walls during active practice sessions.

## Installation & macOS Security Override

Because this extension is open-source and not distributed through the official Mac App Store, macOS Gatekeeper and Safari's native security protocols will block it by default. Follow these exact steps to bypass the restrictions:

**Step 1: Download & Install**
1. Download the latest `CPH_Submit.zip` file from the **[Releases Page](https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest)**.
2. Double-click the `.zip` file to extract it.
3. **CRITICAL:** Drag the extracted `CPH_Submit.app` directly into your Mac's **Applications** folder. Safari will not detect the extension if it is left in Downloads.

**Step 2: Bypass macOS Gatekeeper**
If you try to open the app normally, macOS will likely throw an error stating the app is "damaged" or from an "unidentified developer."
1. Open your Mac's **Terminal** app.
2. Paste the following command exactly as written and press Enter to clear Apple's quarantine flag:
   `xattr -cr /Applications/CPH_Submit.app`
3. You can now safely double-click `CPH_Submit` in your Applications folder to launch it. Once the window opens, you can close it. 

**Step 3: Bypass Safari Extension Security**
1. Open Safari and go to **Safari > Settings > Advanced** in the top menu bar.
2. Check the box at the very bottom for **"Show features for web developers"** (or "Show Develop menu in menu bar").
3. Look at your Mac's top menu bar, click the new **Develop** menu, and select **Allow Unsigned Extensions**. *(Note: Safari requires you to re-check this specific setting every time you fully quit and reopen the browser).*
4. Go to **Safari > Settings > Extensions** and check the box next to **CPH Submit** to activate it.
