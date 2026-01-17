# Page Highlight

A Chrome extension that highlights the most important text sections on a webpage using NLP analysis. When you click the extension icon, it extracts the main content, identifies the top 20% most important sentences using natural language processing, and highlights them using the CSS Custom Highlight API.

## Running this extension

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load the `dist` directory in Chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
5. Navigate to any page (URLs starting with `chrome://` are not supported)
6. Click the extension icon to highlight important text sections

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant SW as Service Worker
    participant Page as Page Context
    participant OD as Offscreen Document

    User->>SW: Click extension icon
    SW->>SW: Check tab status & URL
    SW->>SW: Create offscreen document (if needed)

    SW->>Page: Inject getPageContent() via chrome.scripting.executeScript
    Page->>Page: Clone body, remove non-text elements
    Page->>SW: Return HTML content

    SW->>OD: PROCESS_DOC (with HTML) via chrome.runtime.sendMessage
    OD->>OD: Parse HTML with DOMParser
    OD->>OD: Extract article with Readability
    OD->>OD: Analyze sentences with winkNLP
    OD->>OD: Select top 20% most important sentences
    OD->>SW: REL_TEXT_RES (with relevant text)

    SW->>Page: Inject highlightElements() with relevant text via chrome.scripting.executeScript
    Page->>Page: Find matching text nodes
    Page->>Page: Create ranges and apply CSS Custom Highlight API
    Page->>SW: Return highlight result

    SW->>SW: Close offscreen document
```
