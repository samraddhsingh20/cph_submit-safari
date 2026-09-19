chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'do_cph_submit') {
        if (window.cphIsInjecting) {
            sendResponse({ success: false });
            return true;
        }
        
        if (window.cphHuntInterval) {
            clearInterval(window.cphHuntInterval);
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

    window.cphHuntInterval = setInterval(() => {
        attempts++;
        let editorFound = false;
        let targetNode = null;

        try {
            // 1. Virtual Participation Wall Bypass
            if (window.location.hostname.includes("codeforces.com")) {
                const virtualBtn = document.querySelector('input[value="Register for virtual participation"]');
                if (virtualBtn) {
                    clearInterval(window.cphHuntInterval);
                    window.cphIsInjecting = false;
                    chrome.runtime.sendMessage({ type: 'cf_virtual_fallback', payload: data });
                    return;
                }
            }

            // 2. Editor Toggle Wait Circuit
            const toggleCheckbox = document.getElementById('toggleEditorCheckbox');
            if (toggleCheckbox && !toggleCheckbox.checked) {
                toggleCheckbox.click();
                return;
            }

            // 3. Strict Dropdown Auto-Select
            const problemSelect = document.querySelector('select[name="submittedProblemIndex"]');
            const problemInput = document.querySelector('input[name="submittedProblemCode"]');
            
            if (problemSelect && data.problemCode) {
                let problemMatched = false;
                for (let opt of problemSelect.options) {
                    if (!opt.value) continue;
                    
                    const matchesValue = opt.value === data.problemCode;
                    const matchesText = opt.text.trim().startsWith(data.problemCode + " -") || opt.text.trim().startsWith(data.problemCode + " ");
                    
                    if (matchesValue || matchesText) {
                        problemSelect.value = opt.value;
                        problemSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        problemMatched = true;
                        break;
                    }
                }
                if (!problemMatched) return;
                
            } else if (problemInput && data.problemCode) {
                problemInput.value = data.problemCode;
                problemInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // 4. Dynamic Language Selector
            if (data.languageId) {
                const langSelect = document.querySelector('select[name="programTypeId"], select[name="lang"], select[name*="language"], select[id*="lang"]');
                if (langSelect) {
                    langSelect.value = data.languageId;
                    langSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            // 5. Robust Dynamic Injection
            const cmElement = document.querySelector('.CodeMirror');
            const monacoElement = document.querySelector('.monaco-editor');
            const aceElement = document.querySelector('.ace_editor');
            const textareaElement = document.querySelector('textarea[name="source"], textarea[name="code"], textarea.editor, textarea#sourceCodeTextarea, textarea');
            const fileInput = document.querySelector('input[type="file"]');

            if (cmElement && cmElement.CodeMirror) {
                cmElement.CodeMirror.setValue(code);
                editorFound = true;
                targetNode = cmElement;
            } else if (window.monaco && monaco.editor && monaco.editor.getModels().length > 0) {
                monaco.editor.getModels()[0].setValue(code);
                editorFound = true;
                targetNode = monacoElement;
            } else if (aceElement && aceElement.env && aceElement.env.editor) {
                aceElement.env.editor.setValue(code, -1);
                editorFound = true;
                targetNode = aceElement;
            } else if (textareaElement) {
                textareaElement.value = code;
                textareaElement.dispatchEvent(new Event('input', { bubbles: true }));
                textareaElement.dispatchEvent(new Event('change', { bubbles: true }));
                editorFound = true;
                targetNode = textareaElement;
            } else if (fileInput) {
                const blob = new Blob([code], { type: 'text/plain' });
                const file = new File([blob], "solution.cpp", { type: "text/plain" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                editorFound = true;
                targetNode = fileInput;
            }

            // 6. Strictly Scoped Button Hunter
            let submitBtn = null;
            let mainForm = null;

            const stableAnchor = document.querySelector('select[name="programTypeId"], select[name="submittedProblemIndex"], input[name="submittedProblemCode"]');

            if (stableAnchor) {
                mainForm = stableAnchor.closest('form');
            } else if (targetNode) {
                mainForm = targetNode.closest('form');
            }

            if (mainForm) {
                submitBtn = mainForm.querySelector('input[type="submit"], button[type="submit"], .submit-button, #submit, button.btn-primary');
            }

            if (!submitBtn) {
                const allSubmitBtns = document.querySelectorAll('input[type="submit"], button[type="submit"], .submit-button, #submit, button.btn-primary');
                if (allSubmitBtns.length === 1) {
                    submitBtn = allSubmitBtns[0];
                }
            }

            // 7. Execution and Cleanup
            if (editorFound && (submitBtn || mainForm)) {
                clearInterval(window.cphHuntInterval);
                
                setTimeout(() => {
                    try { if (submitBtn) submitBtn.click(); } catch(e) {}
                    try { if (mainForm) HTMLFormElement.prototype.submit.call(mainForm); } catch(e) {}
                    
                    // Ping the background script to instantly flush the memory lock
                    chrome.runtime.sendMessage({ type: 'cph_injection_success' });
                    setTimeout(() => { window.cphIsInjecting = false; }, 1500);
                }, 350);
            }

        } catch (err) {
            console.error("[CPH] Injection error: ", err);
        }

        // Absolute Safety Timeout (approx. 4 seconds)
        if (attempts > 50) {
            clearInterval(window.cphHuntInterval);
            window.cphIsInjecting = false;
            // Ping the background script to flush the memory lock on failure
            chrome.runtime.sendMessage({ type: 'cph_injection_failed' });
        }
    }, 80);
}
