module.exports = {
  // presets: ['module:@react-native/babel-preset'],
  presets: ['module:@react-native/babel-preset'], // or 'module:metro-react-native-babel-preset' for older versions
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
