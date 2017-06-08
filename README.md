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

The `Command` constructor takes three parameters but only the first parameter is required.

You must give every command a fuction that accepts the `message` and `self` parameters. 

`message` is the message that triggered the function and it will include at least the following two properties:

---
`author`: the author of the message (if it is a console command this will contain the value `'CONSOLE'`).

`content`: the raw content of the message (without the name of the command and potentially a prefix).

---

`self` is a reference to the current instance of the bot that triggered the command

Optionally `Command` accepts the following two parameters:

---
`help` is the help message associated with the command. This defaults to `''`.

`permission` is the permission level required to trigger the command. This defaults to `Command.FLAG.CONSOLE`

---
