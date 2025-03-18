// Run when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed & running");

  // Clear old network rules to avoid conflicts
  chrome.declarativeNetRequest.updateDynamicRules(
    { removeRuleIds: [1, 2] },
    () => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error removing rules:", chrome.runtime.lastError);
      } else {
        console.log(" Rules reset successfully");
      }
    }
  );
});

// Check if webNavigation is supported
if (chrome.webNavigation) {
  // Triggered on new page navigation
  chrome.webNavigation.onCommitted.addListener(async (details) => {
    console.log("🔍 URL detected:", details.url);
    if (details.frameId !== 0) return; // Only process main frame

    try {
      let response = await fetch("http://localhost:5000/check_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: details.url }),
      });
      let result = await response.json();
      console.log("🛑 Server response:", result);

      if (result.is_phishing) {
        alert(`🚨 WARNING: The website (${details.url}) is flagged as phishing!`);
        
        // Block the phishing site dynamically
        chrome.declarativeNetRequest.updateDynamicRules(
          {
            removeRuleIds: [2],
            addRules: [
              {
                id: 2,
                priority: 1,
                action: { type: "block" },
                condition: { urlFilter: details.url, resourceTypes: ["main_frame"] },
              },
            ],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error("❌ Error blocking site:", chrome.runtime.lastError);
            } else {
              console.log(`🚫 Successfully blocked: ${details.url}`);
            }
          }
        );
      }
    } catch (error) {
      console.error("❌ Error during fetch:", error);
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      console.log("🔍 URL detected:", tab.url);
      if (!tab.url || tab.url.startsWith("chrome-error://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("devtools://")) {
        console.warn("⚠️ Ignoring error page:", tab.url);
        return;
      }

      try {
        let response = await fetch("http://localhost:5000/check_url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: tab.url }),
        });
        let result = await response.json();
        console.log("🛑 Server response:", result);

        if (result.is_phishing) {
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => alert("🚨 WARNING: This website is flagged as phishing!"),
          });

          chrome.declarativeNetRequest.updateDynamicRules(
            {
              removeRuleIds: [2],
              addRules: [
                {
                  id: 2,
                  priority: 1,
                  action: { type: "block" },
                  condition: { urlFilter: tab.url, resourceTypes: ["main_frame"] },
                },
              ],
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error("❌ Error blocking site:", chrome.runtime.lastError);
              }
            }
          );
        }
      } catch (error) {
        console.error("❌ Error during fetch:", error);
      }
    }
  });

  // Listen for messages from popup.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("🔍 Scan request received for:", request.url);
    if (request.action === "scan_page") {
      fetch("http://localhost:5000/check_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: request.url }),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log("🛑 Server response:", result);
          sendResponse({ is_phishing: result.is_phishing });
        })
        .catch((error) => {
          console.error("❌ Error fetching:", error);
          sendResponse({ is_phishing: false, error: error.message });
        });

      return true; // Required for async sendResponse
    }
  });
} else {
  console.error("❌ chrome.webNavigation is not available.");
}
