# verdaccio-plugin-secfilter

> plugin for filtering packages with security purposes

---

## Usage

- Install the plugin
```shell
npm i -g verdaccio-plugin-secfilter
```

- Add to verdaccio config (_for example you want to exclude package versions that were published after march 10, 2022_)
```yaml
filters:
  plugin-secfilter:
    dateThreshold: '2022-03-10T23:00:00.000Z'
```

If you trust some packages and want to be able to update them, you can specify them like so:
```yaml
filters:
  plugin-secfilter:
    dateThreshold: '2022-03-10T23:00:00.000Z'
    skipChecksFor:
      - sass
      - scope: '@babel'
```

- Start verdaccio

## Development

See the [verdaccio contributing guide](https://github.com/verdaccio/verdaccio/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. 
Once you have completed that, use the following npm tasks.

  - `npm run build`

    Build a distributable archive

  - `npm run test`

    Run unit test

For more information about any of these commands run `npm run ${task} -- --help`.
