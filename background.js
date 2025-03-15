// Run when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed & running");

  // Clear old network rules to avoid conflicts
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("❌ Error removing rules:", chrome.runtime.lastError);
    } else {
      console.log("🚀 Rules reset successfully");
    }
  });
});

// Check if webNavigation is supported
if (chrome.webNavigation) {
  // Triggered on new page navigation
  chrome.webNavigation.onCommitted.addListener(async function (details) {
    console.log("🔍 URL detected:", details.url);

    // Only process main frame (ignore sub-frames)
    if (details.frameId !== 0) return;

    try {
      // Send the URL to your phishing detection server
      let response = await fetch("http://localhost:5000/check_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: details.url })
      });

      // Parse the server's response
      let result = await response.json();
      console.log("🛑 Server response:", result);

      // If the site is flagged as phishing, warn and block
      if (result.is_phishing) {
        alert(`🚨 WARNING: The website (${details.url}) is flagged as phishing!`);

        // Dynamically block the phishing website
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [2],
          addRules: [
            {
              id: 2,
              priority: 1,
              action: { type: "block" },
              condition: {
                urlFilter: details.url,
                resourceTypes: ["main_frame"]
              }
            }
          ]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error blocking site:", chrome.runtime.lastError);
          } else {
            console.log(`🚫 Successfully blocked: ${details.url}`);
          }
        });
      }
    } catch (error) {
      console.error("❌ Error during fetch:", error);
    }
  });

  chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {  // Ensure page is fully loaded
        console.log("🔍 URL detected:", tab.url);

        try {
            let response = await fetch("http://localhost:5000/check_url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: tab.url })
            });

            let result = await response.json();
            console.log("🛑 Server response:", result);

            if (result.is_phishing) {
                // ✅ Inject an alert into the webpage
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => alert("🚨 WARNING: This website is flagged as phishing!")
                });

                // Block the phishing website dynamically
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [2], 
                    addRules: [
                        {
                            id: 2,
                            priority: 1,
                            action: { type: "block" },
                            condition: {
                                urlFilter: tab.url,
                                resourceTypes: ["main_frame"]
                            }
                        }
                    ]
                });

                // Open `popup.html`
                chrome.windows.create({
                    url: "popup.html",
                    type: "popup",
                    width: 400,
                    height: 500
                });
            }
        } catch (error) {
            console.error("❌ Error during fetch:", error);
        }
    }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("request : " );
  console.log("request.action : " + request.action);
  console.log("request.url : " + request.url);

  if (request.action === "scan_page") {
      console.log("🔍 Scan request received for:", request.url);

      // Send URL to phishing detection server
      fetch("http://localhost:5000/check_url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: request.url })
      })
      .then(response => response.json())
      .then(result => {
          console.log("🛑 Server response:", result);

          // Notify popup.js about the result
          sendResponse({ is_phishing: result.is_phishing });
      })
      .catch(error => {
          console.error("❌ Error fetching:", error);
          sendResponse({ is_phishing: false, error: error.message });
      });

      return true; // Required to keep the connection open for async sendResponse
  }
});


} else {
  console.error("❌ chrome.webNavigation is not available.");
}
