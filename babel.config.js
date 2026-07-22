module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    ['babel-plugin-react-compiler', { target: '19' }],
  ],
};
