// formatting.js - Handles all Word-like text features

function initializeRichText() {
    const editor = document.getElementById('note');
    const formatButtons = document.querySelectorAll('.format-btn');
    const textColorPicker = document.getElementById('text-color');
    const insertImageBtn = document.getElementById('insert-image-btn');
    const imageUpload = document.getElementById('image-upload');

    formatButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const command = button.getAttribute('data-command');
            document.execCommand(command, false, null);
            editor.focus();
            
            // Trigger auto-save on button click
            if (typeof handleContentChange === 'function') handleContentChange(); 
        });
    });

    textColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.execCommand('foreColor', false, color);
        editor.focus();
        
        // Trigger auto-save on color change
        if (typeof handleContentChange === 'function') handleContentChange(); 
    });

    insertImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                const imgTag = `<img src="${base64Image}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">`;
                document.execCommand('insertHTML', false, imgTag);
                
                // Trigger auto-save immediately when an image is inserted
                if (typeof handleContentChange === 'function') handleContentChange(); 
            };
            reader.readAsDataURL(file);
        }
        imageUpload.value = ''; 
    });
}