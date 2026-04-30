const {app, BrowserWindow, ipcMain, dialog } = require('electron');


const path = require('node:path');
const fs  = require('node:fs');

function createWindow(){
    const win = new BrowserWindow({
        width:900,
        height:600,
        webPreferences:{
            preload:path.join(__dirname, 'preload.js'),
            contextIsolation:true,
            nodeIntegration:false,
        }
    });
 win.loadFile('index.html');
}

app.whenReady().then(() => {
    ipcMain.handle('save-note', async (event,text) => {
        const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
        fs.writeFileSync(filePath,text, 'utf-8');
        return {success:true, message:"Note saved successfully."};
    })
    
    ipcMain.handle('load-note', async ()=>{
        const  filePath = path.join(app.getPath('documents'), 'quicknote.txt');
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, "utf-8");        
        }
        return '';
    })

    ipcMain.handle('save-as', async (event, text) =>{
        const result = await dialog.showSaveDialog({
            defaultPath: 'quicknote.txt',
            filters: [{name: 'Text Files', extensions: ['txt']}]
        });
        if (result.canceled) return {success:false}

        
        fs.writeFileSync(result.filePath, text, 'utf-8');
        return {success:true, filePath: result.filePath};
    });

    // opening new  note window
    ipcMain.handle('open-new-note', async (event) =>{
        const result = await dialog.showMessageBox({
            type:"warning",
            buttons:['Discard Changes', 'Cancel'],
            defaultId:1,
            title:'Unsaved Changes',
            message:"You have unsaved changes. Are you sure you want to discard them ?"
        });
        // if user click discard changes button then we return true value 
        return {confirmed:result.response === 0}
    });
    
    //opening new file from exisitng path
    ipcMain.handle('open-file', async ()=>{
        const result = await dialog.showOpenDialog({
            properties:['openFile'],
            filters:[{name:'Text Files', extensions:['txt']}]
        });
        if (result.canceled) return {success:false};

        const filePath = result.filePaths[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        return {success:true, filePath:result.filePaths[0], content};
    })

    createWindow();
    app.on('active', ()=>{
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin' ) app.quit();
});