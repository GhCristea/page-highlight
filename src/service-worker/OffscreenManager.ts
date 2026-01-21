const JUSTIFICATION = "Parse DOM and run NLP processing";
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

class OffscreenManager {
  private isCreating: Promise<void> | null = null;
  private readonly REASON = chrome.offscreen.Reason.DOM_PARSER;

  constructor(
    private readonly path: string = OFFSCREEN_DOCUMENT_PATH,
    private readonly justification: string = JUSTIFICATION
  ) {}

  async open(): Promise<void> {
    if (this.isCreating) {
      return this.isCreating;
    }

    if (await this.exists()) {
      return;
    }

    this.isCreating = this.createDocument();

    try {
      await this.isCreating;
    } finally {
      this.isCreating = null;
    }
  }

  private async createDocument(): Promise<void> {
    try {
      await chrome.offscreen.createDocument({
        url: this.path,
        reasons: [this.REASON],
        justification: this.justification,
      });
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        return;
      } else {
        throw error;
      }
    }
  }

  private async exists(): Promise<boolean> {
    const offscreenUrl = chrome.runtime.getURL(this.path);
    const matchedClients = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl],
    });

    return matchedClients.some((client) => client.documentUrl?.endsWith(this.path));
  }

  async close(): Promise<void> {
    try {
      await chrome.offscreen.closeDocument();
    } catch (error) {
      if (!(error instanceof Error) || !error.message?.includes("doesn't exist")) {
        throw error;
      }
    }
  }
}

export const offscreenManager = new OffscreenManager();

/**
 * Export class testing.
 */
export { OffscreenManager };
