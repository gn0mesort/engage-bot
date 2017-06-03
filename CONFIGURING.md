#Configuring engage-bot

##Custom Configuration
You can add a custom configuration to `engage-bot` by creating a `config.json` file in the project's root directory. The easy way to do this is by copying `default.config.json`. `engage-bot` will also create this file when it closes so running `node index.js` with no config file will create one.

##Default Configuration
A default configuration file can be found in `default.config.json`. 
To use the default configuration simply copy it to `config.json` and add your token to the `token` property.
You may also use a default configuration by simply altering `index.js` as follows so that `engageBot.login()` is `engageBot.login('YOUR TOKEN HERE')`