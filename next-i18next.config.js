
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "zh",
    locales: ["en", "zh"],
  },
  localePath: path.resolve("./public/locales"),
  shallowRender: true,
};