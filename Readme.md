# bypass-passport-strategy

[Passport](http://passportjs.org/) strategy for authenticating with Bypass session tokens

This module lets you authenticate using a the Bypass session token in Node.js
applications.

## Install

This is stored in a private repository. Add the following in your package.json file.

```json
{
  "dependencies": {
    "bypass-passport-strategy": "git@github.com:bypasslane/bypass-passport-strategy.git"
  }
}
```

## Usage

#### Configure Strategy

The local authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

```js
var BypassStrategy = require("bypass-passport-strategy").Strategy;

passport.use(new BypassStrategy());
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'bypasstoken'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.post('/login',
  passport.authenticate('bypasstoken'),
  function(req, res) {
    res.redirect('/');
  });
```

## Tests

```bash
$ npm install
$ npm test
```
