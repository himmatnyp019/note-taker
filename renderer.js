window.addEventListener('DOMContentLoaded', async () => {
    // =================================================================
    // 1. DOM ELEMENTS
    // =================================================================
    const textarea = document.getElementById('note');
    const editor = document.getElementById('note'); // Points to same element, which is fine
    const saveBtn = document.getElementById('save');
    const toggleBtn = document.getElementById('toggle-mode');
    const statusEl = document.getElementById('save-status');
    const openNewWindowBtn = document.getElementById('new-note');
    const openFile = document.getElementById('open-file');
    const saveAsBtn = document.getElementById('save-as');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const noteList = document.getElementById('note-list');

    const fontIncBtn = document.getElementById('font-inc');
    const fontDecBtn = document.getElementById('font-dec');

    // =================================================================
    // 2. STATE VARIABLES
    // =================================================================
    let undoStack = [];
    let redoStack = [];
    let currentState = textarea.innerHTML;
    let currentFilePath = '';
    let lastSavedText = '';
    let debounceTimer;
    let countdownInterval;

    // =================================================================
    // 3. UI RENDERING & STATE FUNCTIONS
    // =================================================================

    // LOAD TOOLBAR COMPONENT & INIT FORMATTING
    try {
        const response = await fetch('components/toolbar.html');
        const toolbarHtml = await response.text();

        document.getElementById('toolbar-container').innerHTML = toolbarHtml;

        if (typeof initializeRichText === 'function') {
            initializeRichText();
        }
    } catch (err) {
        console.error("Failed to load toolbar component:", err);
    }

    async function renderNotes() {
        const notesArray = await window.electronAPI.getNotes();
        noteList.innerHTML = '';

        if (!notesArray || notesArray.length === 0) {
            noteList.innerHTML = `<p style="font-size:12px;color:gray;padding:10px;">No saved notes.</p>`;
            return;
        }

        notesArray.forEach(note => {
            const div = document.createElement('div');
            div.className = 'note-item';

            if (note.id === currentFilePath) {
                div.className += ' active';
            }

            div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>${note.title || 'Untitled'}</strong>
                <button class="delete-btn" data-id="${note.id}" style="background: #e74c3c; padding: 2px 6px; font-size: 10px; border-radius: 4px;">X</button>
            </div>
            <small>${new Date(note.updatedAt).toLocaleString()}</small>
            `;

            // CLICK TO OPEN NOTE
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) return;

                currentFilePath = note.id;
                textarea.innerHTML = note.content;
                lastSavedText = note.content;

                currentState = note.content;
                undoStack = [];
                redoStack = [];

                updateWordCount();
                renderNotes();
            });

            // CLICK TO DELETE NOTE
            const delBtn = div.querySelector('.delete-btn');
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();

                const result = await window.electronAPI.openNewNote(); // Using your confirmation dialog

                if (result.confirmed) {
                    await window.electronAPI.deleteNote(note.id);

                    if (currentFilePath === note.id) {
                        currentFilePath = '';
                        textarea.innerHTML = '';
                        lastSavedText = '';
                        currentState = '';
                        undoStack = [];
                        redoStack = [];
                        updateWordCount();
                    }
                    renderNotes();
                }
            });

            noteList.appendChild(div);
        });
    }

    const saveState = (newStack) => {
        undoStack.push(currentState);
        currentState = newStack;
        redoStack = [];
    };

    const applyState = () => {
        textarea.innerHTML = currentState;
        updateWordCount();
    };

    // TEXT AND WORD COUNT
    function updateWordCount() {
        const text = textarea.innerText || "";
        const characters = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

        // It looks for this exact ID!
        const wordCountEl = document.getElementById('word-count');
        if (wordCountEl) {
            wordCountEl.textContent = `Words: ${words} | Characters: ${characters}`;
        }
    }

    async function autoSave() {
        if (!currentFilePath) return;
        await window.electronAPI.saveNote(textarea.innerHTML, currentFilePath);

        // Also update the JSON data silently for the sidebar
        const noteObject = {
            id: currentFilePath,
            title: textarea.innerText.substring(0, 20) || 'Untitled Note',
            content: textarea.innerHTML,
            updatedAt: new Date().toISOString()
        };
        await window.electronAPI.saveJSONNote(noteObject);
        renderNotes();

        statusEl.textContent = 'Auto-saved successfully';
        lastSavedText = textarea.innerHTML;
    }

    // TOGGLE DARK MODE
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    try {
        let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
        textarea.style.fontSize = `${currentFontSize}px`;

        fontIncBtn.addEventListener('click', () => {
            if (currentFontSize < 48) {
                currentFontSize += 2;
                textarea.style.fontSize = `${currentFontSize}px`;
                localStorage.setItem('fontSize', currentFontSize);
            }
        });

        fontDecBtn.addEventListener('click', () => {
            if (currentFontSize > 10) {
                currentFontSize -= 2;
                textarea.style.fontSize = `${currentFontSize}px`;
                localStorage.setItem('fontSize', currentFontSize);
            }
        });
    } catch (error) {
        console.log(error);
    }

    // =================================================================
    // 4. INITIALIZATION
    // =================================================================
    try {
        const notes = await window.electronAPI.getNotes();
        renderNotes(notes);

        if (notes && notes.length > 0) {
            textarea.innerHTML = notes[notes.length - 1].content;
            currentFilePath = notes[notes.length - 1].id;
        } else {
            const savedNote = await window.electronAPI.loadNote();
            textarea.innerHTML = savedNote || '';
        }

        lastSavedText = textarea.innerHTML;
        currentState = textarea.innerHTML;
        updateWordCount();
    } catch (err) {
        console.error("Initialization error:", err);
    }

    // =================================================================
    // 5. EVENT LISTENERS: BUTTONS
    // =================================================================

    undoBtn.addEventListener('click', () => {
        if (undoStack.length === 0) return;
        redoStack.push(currentState);
        currentState = undoStack.pop();
        applyState();
        statusEl.textContent = `Undo applied`;
    });

    redoBtn.addEventListener('click', () => {
        if (redoStack.length === 0) return;
        undoStack.push(currentState);
        currentState = redoStack.pop();
        applyState();
        statusEl.textContent = `Redo applied`;
    });

    saveAsBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.saveAs(textarea.innerHTML);

        if (result.success) {
            currentFilePath = result.filePath;
            const fileName = result.filePath.split('\\').pop().split('/').pop();

            const noteObject = {
                id: result.filePath,
                title: fileName,
                content: textarea.innerHTML,
                updatedAt: new Date().toISOString()
            };

            await window.electronAPI.saveJSONNote(noteObject);
            renderNotes();

            lastSavedText = textarea.innerHTML;
            statusEl.textContent = `Saved as: ${fileName}`;
        }
    });

    saveBtn.addEventListener('click', async () => {
        const text = textarea.innerHTML;

        if (!currentFilePath) {
            saveAsBtn.click();
            return;
        }

        await window.electronAPI.saveNote(text, currentFilePath);

        const noteObject = {
            id: currentFilePath,
            title: textarea.innerText.substring(0, 20) || 'Untitled Note',
            content: text,
            updatedAt: new Date().toISOString()
        };

        await window.electronAPI.saveJSONNote(noteObject);
        renderNotes();

        lastSavedText = text;
        statusEl.textContent = 'Note saved successfully';
    });

    openFile.addEventListener('click', async () => {
        const result = await window.electronAPI.openFile();
        if (result.success) {
            textarea.innerHTML = result.content;
            lastSavedText = result.content;
            currentFilePath = result.filePath;
            currentState = result.content;
            updateWordCount();
            statusEl.textContent = `Opened ${result.filePath}`;
        }
    });

    openNewWindowBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.openNewNote();
        if (result.confirmed) {
            lastSavedText = '';
            textarea.innerHTML = '';
            currentState = '';
            currentFilePath = '';
            undoStack = [];
            redoStack = [];
            updateWordCount();
            statusEl.textContent = 'New note initialized';
        }
    });

    // =================================================================
    // 6. EVENT LISTENERS: TYPING / TEXTAREA
    // =================================================================

    // EXPOSED TO WINDOW so formatting.js can use it!
    window.handleContentChange = function () {
        if (!editor) return;

        let newText = editor.innerHTML;

        if (typeof saveState === 'function') {
            saveState(newText);
        }

        // Live update word count on every keystroke
        updateWordCount();

        clearTimeout(debounceTimer);
        clearInterval(countdownInterval);

        let timeLeft = 5;
        if (statusEl) {
            statusEl.textContent = `Changes detected - auto saving in ${timeLeft}s...`;
        }

        countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                if (statusEl) statusEl.textContent = `Changes detected - auto saving in ${timeLeft}s...`;
            } else {
                clearInterval(countdownInterval);
                if (statusEl) statusEl.textContent = `Saved automatically.`;
            }
        }, 1000);

        debounceTimer = setTimeout(() => {
            if (typeof autoSave === 'function') {
                autoSave();
            }
        }, 5000);
    };

    editor.addEventListener('input', window.handleContentChange);

    // =================================================================
    // 7. EXTERNAL TRIGGERS (Menus & Shortcuts)
    // =================================================================

    if (window.electronAPI.onMenuAction) {
        window.electronAPI.onMenuAction('menu-new-note', () => openNewWindowBtn.click());
        window.electronAPI.onMenuAction('menu-open-file', () => openFile.click());
        window.electronAPI.onMenuAction('menu-save-note', () => saveBtn.click());
        window.electronAPI.onMenuAction('menu-save-as', () => saveAsBtn.click());
    }

    // KEYBOARD SHORTCUTS
    window.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveBtn.click();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redoBtn.click();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undoBtn.click();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            openNewWindowBtn.click();
        }
    });
});