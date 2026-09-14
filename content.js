if (typeof window.cphIsInjecting === 'undefined') {
    window.cphIsInjecting = false;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'do_cph_submit') {
        if (window.cphIsInjecting) {
            sendResponse({ success: false });
            return true;
        }
        
        window.cphIsInjecting = true;
        executeUniversalInjection(msg.payload);
        sendResponse({ success: true });
    }
    return true;
});

function executeUniversalInjection(data) {
    let attempts = 0;
    const code = data.sourceCode || data.solution || data.source || data.code || "";
    
    if (!code) {
        window.cphIsInjecting = false;
        return;
    }

    const huntInterval = setInterval(() => {
        attempts++;
        let editorFound = false;

        // 1. Detect if Codeforces blocked the user with a Virtual Participation wall
        if (window.location.hostname.includes("codeforces.com")) {
            const virtualBtn = document.querySelector('input[value="Register for virtual participation"]');
            if (virtualBtn) {
                clearInterval(huntInterval);
                chrome.runtime.sendMessage({ type: 'cf_virtual_fallback', payload: data });
                return;
            }
        }

        // 2. Generic Dropdown Auto-Select (For Codeforces Problemset index, etc.)
        const problemSelect = document.querySelector('select[name="submittedProblemIndex"]');
        const problemInput = document.querySelector('input[name="submittedProblemCode"]');
        if (problemSelect || problemInput) {
            if (data.problemCode) {
                if (problemSelect) {
                    for (let opt of problemSelect.options) {
                        if (opt.value === data.problemCode || opt.text.trim().startsWith(data.problemCode)) {
                            problemSelect.value = opt.value;
                            problemSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        }
                    }
                } else if (problemInput) {
                    problemInput.value = data.problemCode;
                    problemInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            const toggleCheckbox = document.getElementById('toggleEditorCheckbox');
            if (toggleCheckbox && !toggleCheckbox.checked) {
                toggleCheckbox.click();
            }
        }

        // 3. Dynamic Language Selector
        if (data.languageId) {
            const langSelect = document.querySelector('select[name="programTypeId"], select[name="lang"], select[name*="language"], select[id*="lang"]');
            if (langSelect) {
                langSelect.value = data.languageId;
                langSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // 4. FULLY DYNAMIC INJECTION (Textareas, Editors, OR File Uploads)
        const cmElement = document.querySelector('.CodeMirror');
        const monacoElement = document.querySelector('.monaco-editor');
        const aceElement = document.querySelector('.ace_editor');
        const textareaElement = document.querySelector('textarea[name="source"], textarea[name="code"], textarea.editor, textarea');
        const fileInput = document.querySelector('input[type="file"]');

        if (cmElement && cmElement.CodeMirror) {
            cmElement.CodeMirror.setValue(code);
            editorFound = true;
        } else if (window.monaco && monaco.editor && monaco.editor.getModels().length > 0) {
            monaco.editor.getModels()[0].setValue(code);
            editorFound = true;
        } else if (aceElement && aceElement.env && aceElement.env.editor) {
            aceElement.env.editor.setValue(code, -1);
            editorFound = true;
        } else if (textareaElement) {
            textareaElement.value = code;
            textareaElement.dispatchEvent(new Event('input', { bubbles: true }));
            textareaElement.dispatchEvent(new Event('change', { bubbles: true }));
            editorFound = true;
        } else if (fileInput) {
            // Universal Ghost File Uploader for sites like CSES
            const blob = new Blob([code], { type: 'text/plain' });
            const file = new File([blob], "solution.cpp", { type: "text/plain" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            editorFound = true;
        }

        // 5. Dynamic Submit Button Hunter
        const submitBtn = document.querySelector('input[type="submit"], button[type="submit"], .submit-button, #submit, button.btn-primary');

        if (editorFound && submitBtn) {
            clearInterval(huntInterval);
            
            // 150ms buffer for the DOM to register the file attachment or text insertion
            setTimeout(() => {
                submitBtn.click();
                setTimeout(() => { window.cphIsInjecting = false; }, 1500);
            }, 150);
        }

        // Safety timeout (4 seconds) - Triggers self-healing memory wipe
        if (attempts > 50) {
            clearInterval(huntInterval);
            window.cphIsInjecting = false;
            chrome.runtime.sendMessage({ type: 'cph_injection_failed' });
        }
    }, 80);
}
