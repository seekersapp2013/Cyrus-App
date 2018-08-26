'use strict'

import {app, BrowserWindow, default as electron, globalShortcut} from 'electron'
// import System from '../renderer/store/modules/Snippets'


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
	? `http://localhost:9080`
	: `file://${__dirname}/index.html`

function createWindow(app) {

	const userDataPath = (electron.app || electron.remote.app).getPath('userData');

	var Positioner = require('electron-positioner')
	var path = require("path")
	var fs = require("fs")
	var initPath = path.join(userDataPath, "UserData/settings.json")
	var dirname = path.dirname(initPath)
	if(!fs.existsSync(dirname) || !fs.existsSync(initPath)){
		fs.mkdirSync(dirname)
		fs.writeFileSync(initPath, JSON.stringify({}));
	}

	var data
	let haveLoadedBounds = false
	try {
		data = JSON.parse(fs.readFileSync(initPath, 'utf8')).bounds || {}
	}
	catch (e) {
		data = { }
	}

	if(data.hasOwnProperty('x') && data.hasOwnProperty('y')){
		haveLoadedBounds = true
	}

	data.height = 400
	data.width = 401
	data.useContentSize = true
	data.transparent = true
	data.resizable = false
	data.frame = false
	data.hasShadow = false

	mainWindow = new BrowserWindow(data);
	mainWindow.loadURL(winURL)

	if(!haveLoadedBounds){
		var positioner = new Positioner(mainWindow)
		positioner.move('bottomRight')
	}

	mainWindow.on('close', () => {
		var data = {
			bounds: mainWindow.getBounds()
		};
		fs.writeFileSync(initPath, JSON.stringify(data));
	})

	mainWindow.on('closed', () => {
		mainWindow = null
	})

	///////////////////////////////////////////////////////////
	//
	// handle links
	//
	///////////////////////////////////////////////////////////

	// let webContents = mainWindow.webContents
	//
	// var handleRedirect = (e, url) => {
	// 	if (url != webContents.getURL()) {
	// 		e.preventDefault()
	// 		require('electron').shell.openExternal(url)
	// 	}
	// }
	//
	// webContents.on('will-navigate', handleRedirect)
	// webContents.on('new-window', handleRedirect)

}

function registerShortCutsKeys() {
	// TODO figure out how to get this from the store

	// let x = System.state.shortcutKey.pattern;
	// debugger
	globalShortcut.register('CommandOrControl+Alt+C', () => {
		mainWindow.focus();

		app.emit('GLOBAL_SHORT_CUT_KEY');

	})

}

app.on('ready', () => {
	createWindow(app)

	registerShortCutsKeys()

})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})

app.on('will-quit', () => {
	globalShortcut.unregisterAll()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */