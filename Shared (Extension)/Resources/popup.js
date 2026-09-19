const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const portInput = document.getElementById('port-input');
const saveBtn = document.getElementById('save-btn');

function updateUI(status, port) {
    if (status === 'connected') {
        statusIndicator.className = 'connected';
        statusText.textContent = 'Connected';
    } else {
        statusIndicator.className = 'disconnected';
        statusText.textContent = 'Disconnected';
    }
    if (port) portInput.value = port;
}

// Fetch initial status when the popup opens
chrome.runtime.sendMessage({ type: 'get_status' }, (response) => {
    if (response) {
        updateUI(response.status, response.port);
    }
});

// Listen for live connection updates from the background worker
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'status_update') {
        updateUI(msg.status, msg.port);
    }
});

// Save port button logic
saveBtn.addEventListener('click', () => {
    const newPort = parseInt(portInput.value, 10);
    if (newPort) {
        chrome.runtime.sendMessage({ type: 'update_port', port: newPort }, () => {
            saveBtn.textContent = "Saved";
            setTimeout(() => { saveBtn.textContent = "Save"; }, 1000);
        });
    }
});
