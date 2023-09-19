# MetaMask Utilities

This is a simple utility app providing an interface UI to sign and broadcast messages.
The application is forked from [MetaMask e2e tests dap repo](https://metamask.github.io/test-dapp/).

## Contributing

### Setup

- Install [Node.js](https://nodejs.org) version 16
  - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install [Yarn v1](https://yarnpkg.com/en/docs/install)
- Run `yarn setup` to install dependencies and run any required post-install scripts
  - **Warning:** Do not use the `yarn` / `yarn install` command directly. Use `yarn setup` instead. The normal install command will skip required post-install scripts, leaving your development environment in an invalid state.

**Note:** `sha3` package setup does not really play well with `python 3.11.1` and the `setup` script throws errors. You can run the following to downgrade your python version:

```shell
> pyenv install 3.10
> pyenv global 3.10
> eval "$(pyenv init --path)"
> python3 --version
```

### Running locally

In order to run the project locally, run

```shell
> yarn start
```

and go to http://localhost:9011/

### Testing and Linting

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and fix any automatically fixable issues.

This package has no tests.

### Development

#### Elements Must Be Selectable by XPath

All HTML elements should be easily selectable by XPath.
This means that appearances can be misleading.
For example, consider this old bug:

```html
<button
  class="btn btn-primary btn-lg btn-block mb-3"
  id="approveTokensWithoutGas"
  disabled
>
  Approve Tokens Without Gas
</button>
```

This appears on the page as `Approve Tokens Without Gas`. In reality, the value included the whitespace on the second line, and caused XPath queries for the intended value to fail.
