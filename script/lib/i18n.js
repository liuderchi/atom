'use strict'
/*
STEPS to localize Atom in build process

git clone && cd atom
git checkout v1.x.x
./script/build   # NOTE should build first then localize
node i18n.js -l "zh-tw"
./script/build --create-debian-package
sudo dpkg -i out/atom-amd64.deb
*/

const fs = require('fs')
const CSON = require('season')
const WORKDIR = "out/app/node_modules"
const CONFIG = require('../config')

const dependentPackages = [
  "tree-view"
  // TODO get all core pkg requiring localization
];

module.exports = function() {
  console.log(`Localizing JSON paths in ${CONFIG.intermediateAppPath}`)
  for (let pkgName of dependentPackages) {
    var targetFilePath = WORKDIR + "/" + pkgName + "/" + "menus/" + pkgName + ".json"
    // TODO path util

    var local = undefined || 'zh-tw';  // TODO Parse argument for local
    var sourceFilePath = 'localization/' + local + '/' + pkgName + '.cson'

    fs.writeFileSync(targetFilePath, JSON.stringify(CSON.readFileSync(sourceFilePath)))
  }
}
