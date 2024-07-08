# Naksha Components React 🗺️

[![GitHub Actions Status](https://github.com/strandls/naksha-components-react/workflows/CI/badge.svg)](https://github.com/strandls/naksha-components-react/actions)
![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/naksha-components-react/latest)
[![typed with TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://www.typescriptlang.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![stable release](https://badgen.net/github/release/strandls/naksha-components-react/stable)](https://github.com/strandls/naksha-components-react/releases)

Map Components for Biodiversity Informatics Platform

![geohash-grid-layer](https://user-images.githubusercontent.com/5774849/157698247-e125ba02-a2a0-45b9-83e3-119e53026e97.gif)

![geoserver-vector-layer](https://user-images.githubusercontent.com/5774849/157698405-ad1e4e18-58c4-4407-90bf-1468c1bca558.gif)

## 🔌 Packages

- [naksha-components-react](./packages/naksha-components-react/README.md)
- [@biodiv-platform/naksha-commons](./packages/naksha-commons/README.md) ![@biodiv-platform/naksha-commons](https://img.shields.io/bundlephobia/minzip/@biodiv-platform/naksha-commons/latest)
- [@biodiv-platform/naksha-gmaps-draw](./packages/naksha-gmaps-draw/README.md) ![@biodiv-platform/naksha-gmaps-draw](https://img.shields.io/bundlephobia/minzip/@biodiv-platform/naksha-gmaps-draw/latest)
- [@biodiv-platform/naksha-mapbox-draw](./packages/naksha-mapbox-draw/README.md) ![@biodiv-platform/naksha-mapbox-draw](https://img.shields.io/bundlephobia/minzip/@biodiv-platform/naksha-mapbox-draw/latest?z)
- [@biodiv-platform/naksha-mapbox-list](./packages/naksha-mapbox-list/README.md) ![@biodiv-platform/naksha-mapbox-list](https://img.shields.io/bundlephobia/minzip/@biodiv-platform/naksha-mapbox-list/latest)
- [@biodiv-platform/naksha-mapbox-view](./packages/naksha-mapbox-view/README.md) ![@biodiv-platform/naksha-mapbox-view](https://img.shields.io/bundlephobia/minzip/@biodiv-platform/naksha-mapbox-view/latest)

## 📦 Development Setup

```sh
git clone https://github.com/strandls/naksha-components-react.git
yarn install
yarn dev
```

## 🔧 Configuration

Code quality checks are done with `prettier`, `eslint`.

## 🔗🏠 Local Link
```
cd packages/naksha-component-react
yarn link (or `npm link` if yarn doesnt work)
```
Then go to the project you want to link the package into(example: cca-ui):
```
yarn link naksha-component-react
```

## 🔖📦Beta Publish on NPM
Follow this tutorial : https://egghead.io/lessons/javascript-publishing-a-beta-version

## 🙏 Contributing

Contributions/Suggestions are always welcome!

## 📄 License

Apache-2.0 &copy; [Strand Life Sciences](https://github.com/strandls)
