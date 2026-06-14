const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      /\/node_modules\/.*\/android\/\.cxx\/.*/,
      /\/android\/\.cxx\/.*/,
    ],
  },
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(__dirname), config), { input: './global.css' });
