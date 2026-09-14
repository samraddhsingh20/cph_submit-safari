document.addEventListener('DOMContentLoaded', () => {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const portInput = document.getElementById('port-input');
    const saveBtn = document.getElementById('save-btn');

    function updateUI(status, port) {
        if (status === 'connected') {
            statusIndicator.className = 'indicator connected';
            statusText.textContent = 'Connected to VS Code';
        } else {
            statusIndicator.className = 'indicator disconnected';
            statusText.textContent = 'Disconnected';
        }
        if (port) portInput.value = port;
    }

    // Fetch initial status on open
    chrome.runtime.sendMessage({ type: 'get_status' }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Background script issue:", chrome.runtime.lastError.message);
            return;
        }
        if (response) updateUI(response.status, response.port);
    });

    // Listen for live status changes from background
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'status_update') updateUI(msg.status, msg.port);
    });

    // Save Port
    saveBtn.addEventListener('click', () => {
        const newPort = parseInt(portInput.value, 10);
        saveBtn.textContent = "Saving...";
        
        // Guarantee the button resets even if the background script drops the connection
        setTimeout(() => { saveBtn.textContent = "Save & Reconnect"; }, 800);
        
        chrome.runtime.sendMessage({ type: 'update_port', port: newPort }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Background script issue:", chrome.runtime.lastError.message);
            }
        });
    });
});
