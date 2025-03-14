document.getElementById("scan").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "scan_page" });
});
