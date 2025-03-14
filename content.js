let pageText = document.body.innerText;

// Send text to background script
chrome.runtime.sendMessage({ action: "analyze_content", text: pageText });
