const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
