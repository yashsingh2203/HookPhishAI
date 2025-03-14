chrome.webRequest.onBeforeRequest.addListener(
  async function(details) {
    let response = await fetch("http://localhost:5000/check_url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: details.url })
    });

    let result = await response.json();
    if (result.is_phishing) {
      alert(`🚨 Warning: This website is flagged as phishing!`);
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
