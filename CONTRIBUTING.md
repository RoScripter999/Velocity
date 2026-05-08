# Contributing to Velocity

Velocity is a community project and welcomes any kind of contribution from anyone!

All contributions should be made in accordance with our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to contribute

Contributions can be sent via pull requests. If you're new to Git, check [this guide](https://opensource.com/article/19/7/create-pull-request-github).

Pull requests can be made either to the `main` or the `dev` branch. However, unless you're an advanced user, I recommend sticking to `main`. This is because the dev branch might contain unstable changes and be force pushed frequently, which could cause conflicts in your pull request.

## Write a plugin

Writing a plugin is the primary way to contribute.

Before starting your plugin:

- Check existing pull requests to see if someone is already working on a similar plugin
- Check our [plugin requests](https://github.com/RoScripter999/Velocity/issues?q=is:open+label:%22plugin%20request%22) to see if there is an existing request, or if the same idea has been rejected
- If there isn't an existing request, [open one](https://github.com/RoScripter999/Velocity/issues/new?assignees=&labels=&projects=&template=request.yml) yourself
  and include that you'd like to work on this yourself. Then wait for feedback to see if the idea even has any chance of being accepted. Or maybe others have some ideas to improve it!
- Familarise yourself with our plugin rules below to ensure your plugin is not banned

### Plugin Rules

#### What you **cannot** do:

- No simple slash command plugins. Instead, create a [user-installable Discord bot](https://discord.com/developers/docs/change-log#userinstallable-apps-preview).
- No basic text-replace plugins like “Let me Google that for you.” Use the TextReplace plugin for this functionality.
- No raw DOM manipulation. Use proper patches and React.
- No state-spoofing or “fake” behavior plugins (e.g., FakeMute, FakeDeafen).
- No plugins that only hide or restyle UI. Use CSS instead, unless a specific element requires programmatic handling.
- No plugins that interact with other Discord bots (official apps like YouTube WatchTogether are allowed).
- No untrusted third-party APIs. Popular services like Google or GitHub are fine, but self-hosted APIs are not allowed.
- No plugins that require the user to enter their own API key or any other secret credentials.

#### What you **can** do:

- Selfbots and API spam are allowed only in safe, controlled environments with no risk to accounts.
- API spoofing or any related topic involving “bypassing” or “spoofing” etc.
- Plugins that modify the Discord API or client in fun, creative ways.
- Anything that generally improves Discord’s functionality or user experience.
