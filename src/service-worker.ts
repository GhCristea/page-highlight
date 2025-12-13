function reddenPage() {
  document.body.style.backgroundColor = 'red';
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  if (!tab.url?.includes('chrome://')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: reddenPage
    });
  }
});
