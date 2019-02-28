import { app, BrowserWindow } from 'electron';
import { Menu, MenuItem, dialog, ipcMain } from 'electron';
import { appMenuTemplate } from './appmenu.js';
//是否可以安全退出
let safeExit = false;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  //增加主菜单(在开发测试时会有一个默认菜单，但打包之后这个菜单是没有的，需要自己增加)
  const menu = Menu.buildFromTemplate(appMenuTemplate);
  //在File菜单下添加名为New的子菜单
  menu.items[0].submenu.append(new MenuItem({
    label: "New",
    click() {
      mainWindow.webContents.send('action', 'new');
    },
    accelerator: "CmdOrCtrl+N"
  }));
  //在New菜单后面添加一个名为Open的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: "Open",
    click() {
      mainWindow.webContents.send('action', 'open');
    },
    accelerator: "CmdOrCtrl+o"
  }));
  //在Open菜单后面添加一个名为Save的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: "Save",
    click() {
      mainWindow.webContents.send('action', 'save');
    },
    accelerator: "CmdOrCtrl+s"
  }));
  //添加一个分隔符
  menu.items[0].submenu.append(new MenuItem({
    type: "separator"
  }));
  //添加名为Exit的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    role: "quit"
  }));

  Menu.setApplicationMenu(menu);

  mainWindow.on('close',(e)=>{
    if(!safeExit){
      e.preventDefault();
      mainWindow.webContents.send('action','exiting')
    }
  })
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

//监听与渲染进程的通信
ipcMain.on('reqaction',(event,arg)=>{
  switch(arg){
    case "exit":
    safeExit=true;
    app.quit();
    break;
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
