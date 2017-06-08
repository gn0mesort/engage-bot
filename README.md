# engage-bot
A Discord bot built to drive user engagement. Built using Node and Discord.js

# Installing
## Windows Only
Ensure you have the `windows-build-tools` package installed globally.

If you don't, run `npm install --global --production windows-build-tools`

## Everywhere
`npm install`

## Running
Run `engage-bot.sh` in Linux or `engage-bot.bat` in Windows

# Configuring
If you run `engage-bot` without a valid configuration it will create a default configuration file for you.

You can find this file in the `cache/` folder created upon exiting. You may directly edit `cache/config.json` to your liking but it is reccomended that you create a `config.json` file of your own in the root directory of the project. 

A `config.json` file outside of `cache/` does not need to be complete. Any fields left empty will be overridden with the values in `cache/config.json` if it exists. If it doesn't exist they will be overriden with the default values.

A minimal `config.json` file looks like this
```json
{
  "token": "<YOUR_TOKEN_HERE>"
}
```

# Adding Commands
To add a command to `engage-bot` create a new command module in the `cmd/` directory. Then fill it with this boiler plate:

```js
const Command = require('../src/command.js')

module.exports = {
  'command-name': new Command(function (message, self){})
}

```

For more information on `Command`s read [command.js](https://github.com/gn0mesort/engage-bot/blob/master/src/command.js).

For some simple example `Command` modules you may want to read [utility.js](https://github.com/gn0mesort/engage-bot/blob/master/cmd/utility.js).