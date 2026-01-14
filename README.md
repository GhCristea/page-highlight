# Page Highlight

This extension changes the background color of text sections in the active tab page when the extension icon is clicked.

## Running this extension

1. Clone this repository.
2. Install dependencies `npm install`
3. Build the extension `npm run build`
4. Load the `dist` directory in Chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).
5. Navigate to any page (make sure that the URL doesn't start with `chrome://`).
6. Click the extension icon. The text sections will be highlighted.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant SW as Service Worker
    participant CS as Content Script
    participant OD as Offscreen Document

    User->>SW: Click extension icon

    SW->>SW: Check tab status & URL
    SW->>SW: Inject content.bundle.js
    SW->>SW: Create offscreen document (if needed)
    SW->>CS: REQ_DOC_HTML (via chrome.tabs.sendMessage)

    CS->>CS: Get document.documentElement.outerHTML
    CS->>OD: PROCESS_DOC (with HTML)

    OD->>OD: Parse HTML with DOMParser
    OD->>OD: Extract relevant text (getRelevantText)
    OD->>SW: REL_TEXT_RES (with relevant text)

    SW->>SW: Receive REL_TEXT_RES
    SW->>CS: REL_TEXT_RES (forward via chrome.tabs.sendMessage)

    CS->>CS: Find matching text nodes
    CS->>CS: Highlight text
    CS->>SW: HIGHLIGHT_COMPLETE

    SW->>SW: Close offscreen document
```
