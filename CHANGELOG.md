# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0](https://github.com/Ansile/verdaccio-plugin-secfilter/compare/v0.1.4...v1.0.0) (2022-08-09)


### Features

* move from dateThreshold + whitelist approach to blacklist for packages. npm ecosystem can't really handle inconsistent state, which is caused by some packages being old and some being new. ([27a3bfb](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/27a3bfbe75cf5e2d7d29b07e9bb07be7d1040a71))


### Bug Fixes

* disable signed commits for now ([93a05dc](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/93a05dcda1a946f636376d7b068518ceaf3fd9e8))

### 0.1.1 (2022-03-23)

### 0.1.0 (2022-03-23)


### Features

* add a way to bypass checks for certain packages ([747ddad](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/747ddad5dc3dc0c4ef944240b0d79ea32446bc1f))

### Bug Fixes

* deps ([8811fe1](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/8811fe1533bbd83a8855ada58f1473861169aa62))
* optimize a bit ([ea70e72](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/ea70e721ec9c4bdeee5adfe7855d42507873e70c))
* ts (use node typings) ([acd5009](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/acd500923b33bd23472a239c9ba65bab51c874de))

### 0.0.2 (2022-03-21)


### Features

* migrate to filtering plugin ([271a017](https://github.com/Ansile/verdaccio-plugin-secfilter/commit/271a01776fe1cbd5084fe584305362add2bcb45f))
