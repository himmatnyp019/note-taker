window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const toggleBtn = document.getElementById('toggle-mode');
    const statusEl = document.getElementById('save-status');
    const openNewWindowBtn = document.getElementById('new-note');

    const saveAsBtn = document.getElementById('save-as');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');


    //undo redo system vars
    let undoStack = [];
    let redoStack = [];
    let currentState = textarea.value;

    //we save/track every stack of text written in textarea
    const saveState = (newStack) => {
        undoStack.push(currentState);
        currentState = newStack;
        redoStack = [];
    }

    // undo function 
    undoBtn.addEventListener('click', async () => {

        if (undoStack.length === 0) return;

        statusEl.textContent = `undo text, ${undoStack.length}`
        redoStack.push(currentState);  // redo stack will filled with the currently done undo stack
        currentState = undoStack.pop(); // adding undo stacked text in currentState, which have to displayed in the text area later 
        applyState(); // this function help to display undo text in the text area

    })


    // redo function
    redoBtn.addEventListener('click', async () => {

        statusEl.textContent = `redo text, ${undoStack.length}`
        if (redoStack.length === 0) return;

        undoStack.push(currentState); // undo stack ma redo text filling
        currentState = redoStack.pop(); // pop means new state inserting in current state
        applyState();// apply the current state in text area

    });

    // to make visible effect of undo/redo system in text area
    const applyState = () => {
        textarea.value = currentState;
    }


    saveAsBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.saveAs(textarea.value);
        if (result.success) {
            lastSavedText = textarea.value;
            statusEl.textContent = `Saved to ${result.filePath}`;
        } else {
            statusEl.textContent = 'Save failed, cancelled.';
        }
    })


    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');  //add class name 'dark-mode' to html body
        //toggle, will check the classList if 'dark-mode' exist then remove to default otherwise add 'dark-mode'
    });



    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;

    let lastSavedText = textarea.value;

    saveBtn.addEventListener('click', async () => {
        await window.electronAPI.saveNote(textarea.value);
        alert('Note Saved Successfully.')
    })

    let debounceTimer;
    let countdownInterval;

    textarea.addEventListener('input', () => {
        let newText = textarea.value;
        saveState(newText); // 🔥 THIS TRACK THE CHANGES IN TEXT AREA

        clearTimeout(debounceTimer);
        clearInterval(countdownInterval);


        let timeLeft = 5;
        statusEl.textContent = `changes detected - auto saving in ${timeLeft}s ...`;

        countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                statusEl.textContent = `changes detected - auto saving in ${timeLeft}s ...`;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);

        debounceTimer = setTimeout(() => {
            autoSave();
        }, 5000);

        undoHistory = setInterval(() => {
            if (lastSavedText != currentText) {

            }
        }, 3000);
    });


    async function autoSave() {
        const currentText = textarea.value;
        if (currentText === lastSavedText) {
            statusEl.textContent = 'No changes to save'
            return;
        }
        try {
            await window.electronAPI.saveNote(currentText);
            lastSavedText = currentText;
            const now = new Date().toLocaleTimeString();
            statusEl.textContent = `Auto saved at ${now}`;

        }
        catch (err) {
            console.error('Auto save failed : ', err);
            statusEl.textContent = 'Auto save failed';

        }
    }

    // new note window function
    openNewWindowBtn.addEventListener('click', async () => {
        ``
        console.log("new window button clicked")
        const result = await window.electronAPI.openNewWindow();
        if (result.confirmed) {
            lastSavedText = '';
            textarea.value = '';
            statusEl.textContent = 'New note window opened';
        } else {
            textarea.value = '';
            statusEl.textContent = 'New note window not opened';
        }
    })

    // keyboard press listener 
    // 🔥☠️ KEYBOARD SHORTCUT =============================================================
    window.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();

            const result = await window.electronAPI.saveAs(textarea.value);

            if (result.success) {
                statusEl.textContent = `Saved to ${result.filePath}`;
            } else {
                statusEl.textContent = 'Save cancelled';
            }
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            redoBtn.click();
        }
        if(e.ctrlKey && e.key.toLocaleLowerCase() === 'n' ){
            openNewWindowBtn.click();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            undoBtn.click();
        }
    });


})