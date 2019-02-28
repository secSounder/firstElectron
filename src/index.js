import { ipcRenderer, remote } from 'electron';
import { IfObservable } from '../node_modules/rxjs/observable/IfObservable';
import { elementAt } from '../node_modules/rxjs/operator/elementAt';
const { Menu, MenuIte, dialog } = remote;

let currentFile = null;//当前文档保存路径;
let isSaved = true;//当前文档是否已经保存;
let txtEditor = document.getElementById('txtEditor');

document.title = "notepad-untited";//设置文档标题，影响窗口标题栏名称；

//给文本增加右键菜单 
const contextMenuTemplate = [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { role: 'delete' },
    { type: 'separator' },
    { role: 'selectall' }
];
const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
txtEditor.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.popup(remote.getCurrentWindow());
})

//监控文本框内容是否改变
txtEditor.oninput = (e) => {
    if (isSaved) {
        document.title += " *";
        isSaved = false;
}
}

//监听与主进程的通信
ipcRenderer.on('action', (event, arg) => {
    switch (arg) {
        case 'new': //新建文件
            askSaveIfNeed();
            currentFile = null;
            txtEditor.value = '';
            document.title = "Notepad-Untitled";
            isSaved = true;
            break;
        case 'open': //打开文件
            askSaveIfNeed();
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                filters: [
                    { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: ['openFile']
            });
            if (files) {
                currentFile = files[0];
                const txtRead = readText(curentFile);
                txtEditor.value = txtRead;
                document.title = "Notepad - " + currentFile;
                isSaved = true;
            }
            break;
        case 'save':
            saveCurrentDoc();
            break;
        case 'exiting':
            askSaveIfNeed();
            ipcRenderer.sendSync('reqaction','exit');
            break
    }
});
//读取本地文件
function readText(file){
    const fs = require('fs');
    return fs.readFileSync(file,'utf8')
}
//保存文本内容到文件
function saveText(text,file){
    const fs = require('fs');
    fs.writeFileSync(file,text)
}
//保存当前文档
function saveCurrentDoc(){
    if(!currentFile){
        const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(),{
            filters:[
                {name:"Text Files",extensions:['txt','js','html','md']},
                {name:'All Files',extensions:['*']}
            ]
        });
        if(file){
            currentFile = file;
        }
    }else{
        const txtSave=txtEditor.value;
        saveText(txtSave,currentFile);
        isSaved = true;
        document.title = "Notepad - " +currentFile;
    }
}

//如果需要保存，弹出保存对话框询问用户是否保存当前文档
function askSaveIfNeed(){
    if(isSaved)return;
    const response=dialog.showMessageBox(remote.getCurrentWindow(),{
        message:'Do you want to save the current document?',
        type:'question',
        buttons:['Yes','No']
    });
    if(response==0) saveCurrentDoc(); //点击Yes按钮后保存当前文档
}