// document.getElementById("scan").addEventListener("click", () => {
//     chrome.runtime.sendMessage({ action: "scan_page" });
// });

document.getElementById("scan").addEventListener("click", function () {
    // Get the active tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTab = tabs[0];
        console.log("activeTab: ");
        console.log(activeTab);

        if (activeTab) {
            chrome.runtime.sendMessage({ action: "scan_page", url: activeTab.url }, function (response) {
                console.log("response.is_phishing: " );
                console.log( response.is_phishing );

                console.log("📢 Response from background.js:", response);

                if (chrome.runtime.lastError) {
                    console.error("❌ Error:", chrome.runtime.lastError.message);
                    alert("⚠️ Error: Could not check this page.");
                    return;
                }
                
                if (response && response.is_phishing !== undefined) {
                    if (response.is_phishing) {
                        alert("🚨 WARNING: This page is flagged as phishing!");
                    } else {
                        alert("✅ This page is safe.");
                    }
                } else {
                    alert("⚠️ Error: Could not check this page.");
                }
            });
        } else {
            alert("⚠️ No active tab detected.");
        }
    });
});
