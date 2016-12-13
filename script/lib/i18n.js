'use strict'

const fs = require('fs')
const CSON = require('season')
const path = require('path')
const syncRequest = require('sync-request')
const CONFIG = require('../config')

const LocaleSupport = new Set([
  "zh-tw"
  // TODO add support
])
const packageDependencies = [
  'autoflow',
  'bookmarks',
  'bracket-matcher',
  'command-palette',
  'dev-live-reload',
  'encoding-selector',
  'find-and-replace',
  'fuzzy-finder',
  'git-diff',
  'go-to-line',
  'grammar-selector',
  'image-view',
  'keybinding-resolver',
  'markdown-preview',
  'open-on-github',
  'package-generator',
  'settings-view',
  'snippets',
  'spell-check',
  'styleguide',
  'symbols-view',
  'tabs',
  'timecop',
  'tree-view',
  'welcome',
  'whitespace'
]

function getCsonSync(pkgName, locale) {
  const url = `https://raw.githubusercontent.com/liuderchi/atom-i18n-cson/master/${locale}/${pkgName}.cson`
  const resp = syncRequest('GET', url)
  if (resp.statusCode === 200) {
    return CSON.parse(resp.getBody('utf8'))
  }
  return false
}

module.exports = function(locale) {
  locale = locale.toLowerCase()
  if (locale === undefined) {
    console.log('Skipping localization'.gray)
    return
  }
  if (!LocaleSupport.has(locale)) {
    console.error(`locale ${locale} not supported!`.red)
    process.exit(1)
  }
  console.log(`Localizing JSON paths in ${CONFIG.intermediateAppPath} with locale ${locale}`)

  for (let pkgName of packageDependencies) {
    const cson = getCsonSync(pkgName, locale)
    if (cson) {
      const targetFilePath = path.join(CONFIG.intermediateAppPath, "node_modules", pkgName, "menus", pkgName + ".json")
      console.log(`i18n: updating files: ${targetFilePath}`.blue)
      fs.writeFileSync(targetFilePath, JSON.stringify(cson))
    }
  }

  for (let platform of ['darwin', 'linux', 'win32']) {
    const subURL = path.join('menus', platform)
    const cson = getCsonSync(subURL, locale)
    if (cson) {
      const targetFilePath = path.join(CONFIG.repositoryRootPath, 'menus', `${platform}.cson`)
      console.log(`i18n: updating files: ${targetFilePath}`.blue)
      fs.writeFileSync(targetFilePath, CSON.stringify(cson))
    }
  }

  // TODO copy cson from src/*
  // trace usage of electron.Menu: (http://electron.atom.io/docs/api/menu/)
  //    1. Menu.buildFromTemplate  @AtomApplication
  //    2. getDefaultTemplate @ApplicationMenu
  //    3. createProjectsMenu @ReopenProjectMenuManager
  //    #Menu.
  //    #MenuItem
  // trace usage #MenuManager: it's registry based on electron.Menu
  // trace usage #ContextMenu:
  // trace usage #ContextMenuManager:
  // trace usage #ContextMenuItemSet:
  //    1. Inspect Element
}
