
---

# 📝 NoteItDown

> *“Note it down right now, later you may forget the idea.”*

A simple and lightweight desktop note-taking application built using **Electron.js**.
This project is designed for learning core concepts like file handling, auto-save, undo/redo logic, and keyboard shortcuts.

---

## 🚀 Features

### ✍️ Note Editing

* Simple text editor for writing notes
* Clean and minimal interface

---

### 💾 Save System

* Manual Save button
* **Save As** option to store notes anywhere on your system
* Auto-save after a few seconds of inactivity

---

### ⏱️ Auto Save

* Detects changes in the editor
* Automatically saves after 5 seconds
* Displays real-time save status

---

### ↩️ Undo System

* Custom undo stack implementation
* Tracks previous states of text
* Reverts changes step-by-step

---

### 🌙 Dark Mode

* Toggle between light and dark themes

---

### 🪟 Multi Window Support

* Open a new note window separately

---

### ⌨️ Keyboard Shortcut

* `Alt + S` → Save As

---

## 🧠 How It Works

### 🔄 Undo Mechanism

This app uses a **stack-based undo system**:

* Every change pushes previous state into `undoStack`
* Undo:

  * Pops last state from stack
  * Applies it to the editor
* Redo:

  * Uses a separate `redoStack`

---

### ⏳ Auto Save Logic

1. User types in the editor
2. A debounce timer starts (5 seconds)
3. If no further input:

   * Content is saved automatically
4. Status updates are shown in UI

---

### 📂 File Handling

* Uses Electron's `ipcRenderer` to communicate with backend (`main.js`)
* Notes are saved locally on your system

---

## 🛠️ Tech Stack

* **Electron.js**
* **Node.js**
* **JavaScript (Vanilla)**

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/himmatnyp019/note-taker.git
```

---

### 2️⃣ Navigate to Project Folder

```bash
cd note-taker
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Run the App

```bash
npm start
```

---

## ⚙️ Scripts

```json
"scripts": {
  "start": "electron . --ozone-platform=x11 --disable-gpu"
}
```

---

## 📁 Project Structure (Basic)

```bash
note-taker/
│
├── main.js        # Electron main process
├── renderer.js    # Frontend logic
├── index.html     # UI layout
├── preload.js     # Secure bridge (IPC)
├── package.json
```

---

## 🎯 Learning Goals of This Project

This project helps understand:

* Electron app structure
* IPC communication
* File system operations
* Debouncing
* Undo/Redo logic
* Event handling (keyboard + UI)

---

## 🚧 Future Improvements

* Rich Text Editor (Bold, Italic, Lists)
* Multiple Notes System
* Search Notes
* Tags / Categories
* Cloud Sync
* AI-powered features

---

## 🐛 Known Issues

* Undo system is basic (tracks every change)
* No redo button in UI yet
* Single note editing (no note list yet)

---

## 🤝 Contributing

Feel free to fork this repo and improve it.
Pull requests are welcome!

---

## 👨‍💻 Author

**Himmat Neupane**

* GitHub: [https://github.com/himmatnyp019](https://github.com/himmatnyp019)

---

## ⭐ Support

If this project helped you:

* Give it a ⭐ on GitHub
* Share with others

---
