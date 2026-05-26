// DTA Cookies Sync - Popup UI script
// Sản phẩm của DTA STUDIO - Phát triển bởi Đức Trường AI

document.addEventListener("DOMContentLoaded", async () => {
  const syncStatus = document.getElementById("sync-status");
  const syncTime = document.getElementById("sync-time");
  const syncPort = document.getElementById("sync-port");
  const btnSync = document.getElementById("btn-sync");

  // Load cấu hình port cũ
  chrome.storage.local.get(["syncPort", "lastStatus", "lastTime"], (result) => {
    if (result.syncPort) {
      syncPort.value = result.syncPort;
    }
    if (result.lastStatus) {
      updateStatusUI(result.lastStatus, result.lastTime || "-");
    }
  });

  // Lắng nghe thay đổi port
  syncPort.addEventListener("change", () => {
    let port = parseInt(syncPort.value) || 8732;
    if (port < 1024 || port > 65535) port = 8732;
    syncPort.value = port;
    chrome.storage.local.set({ syncPort: port });
  });

  // Sự kiện nút Đồng Bộ
  btnSync.addEventListener("click", () => {
    btnSync.disabled = true;
    btnSync.innerText = "⏳ ĐANG ĐỒNG BỘ...";
    
    chrome.runtime.sendMessage({ action: "sync-now" }, (response) => {
      // Đợi phản hồi trong background
    });
  });

  // Lắng nghe status update từ background.js
  chrome.runtime.onMessage.addListener((message) => {
    if (message.status === "success") {
      updateStatusUI("success", message.time);
      chrome.storage.local.set({ lastStatus: "success", lastTime: message.time });
    } else if (message.status === "failed") {
      updateStatusUI("failed", message.error);
      chrome.storage.local.set({ lastStatus: "failed", lastTime: message.error });
    }
    btnSync.disabled = false;
    btnSync.innerText = "🔄 ĐỒNG BỘ NGAY";
  });

  function updateStatusUI(status, info) {
    if (status === "success") {
      syncStatus.innerText = "LIVE (Kết nối tốt)";
      syncStatus.className = "val status-active";
      syncTime.innerText = info;
    } else {
      syncStatus.innerText = "LỖI KẾT NỐI";
      syncStatus.className = "val status-inactive";
      syncTime.innerText = info;
    }
  }
});
