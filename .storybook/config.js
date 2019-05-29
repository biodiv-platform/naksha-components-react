import { addParameters, configure, addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";
import { themes } from "@storybook/theming";

// Option defaults.
addParameters({
  options: {
    theme: {
      ...themes.light,
      brandTitle: "Naksha Components React"
    },
    showPanel: false
  }
});

// Decorators
addDecorator(withKnobs);

// automatically import all files ending in *.stories.js
const req = require.context("../src", true, /\.story\.tsx$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
