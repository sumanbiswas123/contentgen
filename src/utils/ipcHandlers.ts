/**
 * IPC Message Hub & Popup Window Manager
 * Handles communication between native webview windows, broadcast channels, and React state.
 */

export function setupNativeIpcBridge(onMessageCallback: (data: any) => void): () => void {
  const handleMessage = (event: MessageEvent) => {
    let data = event.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {}
    }
    if (data) {
      onMessageCallback(data);
    }
  };

  window.addEventListener("message", handleMessage);
  if (typeof (window as any).chrome?.webview?.addEventListener === "function") {
    (window as any).chrome.webview.addEventListener("message", handleMessage);
  }

  const broadcastChannel = new BroadcastChannel("webview_ipc");
  broadcastChannel.onmessage = (event) => {
    if (event.data) {
      onMessageCallback(event.data);
    }
  };

  return () => {
    window.removeEventListener("message", handleMessage);
    if (typeof (window as any).chrome?.webview?.removeEventListener === "function") {
      (window as any).chrome.webview.removeEventListener("message", handleMessage);
    }
    broadcastChannel.close();
  };
}

export function syncNativePopupWindowBounds(): () => void {
  const syncPopupBounds = () => {
    requestAnimationFrame(() => {
      const hasBinding = typeof (window as any).sync_popup_bounds === "function";
      if (!hasBinding) return;

      const x = Math.round(window.innerWidth * 0.025);
      const y = Math.round(window.innerHeight * 0.025);
      const w = Math.round(window.innerWidth * 0.95);
      const h = Math.round(window.innerHeight * 0.95);

      (window as any).sync_popup_bounds(`${x},${y},${w},${h},true`);
    });
  };

  window.addEventListener("resize", syncPopupBounds);
  const observer = new MutationObserver(syncPopupBounds);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  syncPopupBounds();

  return () => {
    window.removeEventListener("resize", syncPopupBounds);
    observer.disconnect();
    if (typeof (window as any).close_popup_webview === "function") {
      (window as any).close_popup_webview();
    }
  };
}
