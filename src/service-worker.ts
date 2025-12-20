import type { WorkerMsg, ContentMsg } from "./types";

type Variant = "error" | "pending";

const updateBadge = async (tabId: number, variant: Variant, title: string) => {
  await chrome.action.disable(tabId);
  await chrome.action.setTitle({ tabId, title });

  if (variant === "error") {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: [255, 0, 0, 255] });
    await chrome.action.setBadgeText({ tabId, text: "X" });
  }
};

chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id;
  if (!tabId) {
    await chrome.action.disable();
    return;
  }

  if (tab.status !== "complete") {
    await updateBadge(tabId, "pending", "Tab is not ready");
    return;
  }

  if (tab.url?.includes("chrome://")) {
    await updateBadge(tabId, "error", "Not available on this page");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.bundle.js"],
  });

  const res = await chrome.tabs.sendMessage<WorkerMsg, ContentMsg>(tabId, {
    highlight: true,
  });

  if (res.error) {
    await updateBadge(tabId, "error", res.error);
  }

  console.log("Highlight end: ", res);
});
