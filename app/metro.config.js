// The game's stories, word lists, difficulty curve and artwork live in ../frontend/js and are
// shared with the web version (see src/shared.js), so Metro has to be allowed to read that folder.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../frontend/js')];

module.exports = config;
