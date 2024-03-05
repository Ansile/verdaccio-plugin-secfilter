# verdaccio-plugin-secfilter

> plugin for filtering packages with security purposes

---

## Usage

- Install the plugin
```shell
npm i -g verdaccio-plugin-secfilter
```

- Configure options:

### 
```yaml
filters:
  plugin-secfilter:
    block:
      - scope: @evil # block all packages in scope
      - package: semvver # block a malicious package
      - package: @coolauthor/stolen
        versions: '>2.0.1' # block some malicious versions of previously ok package
                           # uses https://www.npmjs.com/package/semver syntax
      - package: @coolauthor/stolen
        versions: '>2.0.1'
        strategy: replace # block some malicious versions of previously ok package, replacing them with older, correct versions
                          # use when package is used in transient dependencies and 'block' breaks the installs
```

### dateThreshold (DEPRECATED)

This option is deprecated and is to be used **only** if you need a fast solution and you are **sure** your security was breached recently. 

- Add to verdaccio config (_for example you want to exclude package versions that were published after march 10, 2022_)
```yaml
filters:
  plugin-secfilter:
    dateThreshold: '2022-03-10T23:00:00.000Z'
```

- [Start verdaccio](https://verdaccio.org/docs/installation)

## Development

See the [verdaccio contributing guide](https://github.com/verdaccio/verdaccio/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. 
Once you have completed that, use the following npm tasks.

  - `npm run build`

    Build a distributable archive

  - `npm run test`

    Run unit test

For more information about any of these commands run `npm run ${task} -- --help`.
