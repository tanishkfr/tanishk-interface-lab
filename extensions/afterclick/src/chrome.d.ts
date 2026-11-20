/**
 * Minimal Chrome extension typings for the APIs AFTERCLICK actually uses.
 * The repository does not pull in @types/chrome; keeping this surface small
 * makes the permission boundary easy to audit.
 */

declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: { id?: number; url?: string; title?: string };
      url?: string;
    }
    const id: string;
    const lastError: { message?: string } | undefined;
    function getURL(path: string): string;
    function sendMessage(message: unknown): Promise<unknown>;
    const onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
    };
    const onInstalled: { addListener(callback: () => void): void };
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active?: boolean;
      windowId?: number;
    }
    function query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
      lastFocusedWindow?: boolean;
    }): Promise<Tab[]>;
    function get(tabId: number): Promise<Tab>;
    function sendMessage(tabId: number, message: unknown): Promise<unknown>;
    function create(properties: { url: string }): Promise<Tab>;
    const onUpdated: {
      addListener(
        callback: (
          tabId: number,
          changeInfo: { status?: string; url?: string },
          tab: Tab,
        ) => void,
      ): void;
    };
    const onRemoved: { addListener(callback: (tabId: number) => void): void };
  }

  namespace scripting {
    function executeScript(injection: {
      target: { tabId: number; allFrames?: boolean };
      files: string[];
    }): Promise<Array<{ result?: unknown }>>;
  }

  namespace storage {
    interface StorageArea {
      get(keys?: string | string[] | null): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }
    const session: StorageArea;
    const local: StorageArea;
  }

  namespace action {
    function setBadgeText(details: { text: string; tabId?: number }): Promise<void>;
    function setBadgeBackgroundColor(details: {
      color: string;
      tabId?: number;
    }): Promise<void>;
    function setTitle(details: { title: string; tabId?: number }): Promise<void>;
  }
}
