# Text Anchor
Text Anchor is a Chromium browser extension that lets you save important text selections from any webpage and quickly return to the exact same place later.

## Features
- Save any selected text on a webpage
- Stores the exact position of the selection using DOM anchors (XPath + offsets)
- Jump back to the saved highlight using a button in the popup
- Automatically scrolls to the correct location and selects the text
- Copy saved highlights to clipboard directly from the popup
- Separated highlights for each webpage (organized by URL)
- Works after page refresh and browser restart
- Popup UI to manage all saved highlights
- Deleting individual highlights using buttons in the popup


## Installation
Select the latest release of this repository and follow the download instructions.

## Keyboard Shortcuts
You can view or change the extension keyboard shortcuts in `chrome://extensions/shortcuts` (or your browser’s equivalent page)

## Usage
1. Select any text on a webpage
2. Save it using the saving shortcut (Alt + S by default)
3. Open the popup anytime later to see your saved highlights for that page
4. Click Show to jump back to the exact location of the saved text or Copy to copy it to clipboard

Note: This extension cannot run on certain restricted pages (such as browser settings, new tabs, or internal browser pages) because these do not allow extensions to inject scripts.

## Screenshot
<img width="654" height="600" alt="image" src="https://github.com/user-attachments/assets/35926efb-13df-438f-bab2-10f9ce3c15e8" />
