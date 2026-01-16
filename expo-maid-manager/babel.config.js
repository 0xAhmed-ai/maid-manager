// SDK 54 Best Practice: Use only babel-preset-expo
// Do NOT add react-native-reanimated/plugin - it's handled automatically
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
