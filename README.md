<div align="center">
  <img src="media/hero.png" width="800" alt="LiveMark Hero">
  <h1>LiveMark</h1>
  <p><strong>Markdown Inline Live Preview for VS Code</strong></p>

  <!-- <p>
    <img src="https://img.shields.io/visual-studio-marketplace/v/ilhum.livemark?style=for-the-badge" alt="Version">
    <img src="https://img.shields.io/visual-studio-marketplace/i/ilhum.livemark?style=for-the-badge" alt="Installs">
    <img src="https://img.shields.io/visual-studio-marketplace/r/ilhum.livemark?style=for-the-badge" alt="Rating">
  </p> -->
</div>

---

**LiveMark** brings the seamless "Live Preview" experience from Obsidian to your Visual Studio Code environment. No more switching between editor and preview side-by-side. Edit your Markdown documents as they appear, with syntax markers magically hiding as you move your cursor away.

Obsidian-like Inline Live Preview for VS Code.

## ✨ Key Features

- **Support Syntax**
  - Header (H1 ~ H6)
  - Bold (\*\*text\*\* or \_\_text\_\_)
  - Italic (\*text\* or \_text\_)
  - Strikethrough (\~\~text\~\~)
  - Link (\[text\]\(url\))
  - Image (\!\[alt\]\(url\))
  - Blockquote (\> text)
  - Code Block (\`\`\`text\`\`\`)
  - Inline Code (\`text\`)
  - Task List (\- \[ \] text or \- \[] text)
- ⚡ **Lightning Fast**: Built on top of VS Code's decoration API for smooth performance.
- 🎨 **Theme Aware**: Seamlessly blends with your current VS Code theme (Light or Dark).

## 🚀 Quick Start

1. Open any `.md` file.
2. The extension activates automatically!
3. Toggle between **Rendered View** and **Raw Markdown** using the editor title menu icons or the command palette.

## ⚙️ Configuration

You can customize your experience in the settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `obsidianMdInline.hideSyntaxMarkers` | `boolean` | `true` | Hide markdown syntax markers when not actively editing the line. |
| `obsidianMdInline.defaultViewMode` | `enum` | `"rendered"` | Default view mode when opening a file (`rendered` or `raw`). |

---

<p align="center">Developed with ❤️ for the Markdown community.</p>