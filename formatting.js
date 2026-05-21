// formatting.js - Handles all Word-like text features

function initializeRichText() {
    const editor = document.getElementById('note');
    const formatButtons = document.querySelectorAll('.format-btn');
    const textColorPicker = document.getElementById('text-color');
    const insertImageBtn = document.getElementById('insert-image-btn');
    const imageUpload = document.getElementById('image-upload');

    // 1. Basic formatting (Bold, Italic, Alignment, etc.)
    formatButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevents the editor from losing focus
            const command = button.getAttribute('data-command');
            document.execCommand(command, false, null);
            editor.focus();
        });
    });

    // 2. Text Color
    textColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.execCommand('foreColor', false, color);
        editor.focus();
    });

    // 3. Image Insertion Logic
    insertImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        imageUpload.click(); // Trigger the hidden file input
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            // Convert image to Base64 so it can live directly inside the text
            reader.onload = function(event) {
                const base64Image = event.target.result;
                
                // Create an image tag and insert it at the cursor position
                const imgTag = `<img src="${base64Image}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">`;
                document.execCommand('insertHTML', false, imgTag);
            };
            
            reader.readAsDataURL(file);
        }
        // Reset input so you can upload the same image again if needed
        imageUpload.value = ''; 
    });
}