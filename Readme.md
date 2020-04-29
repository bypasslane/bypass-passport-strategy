# bypass-passport-strategy

[![CircleCI](https://circleci.com/gh/bypasslane/bypass-passport-strategy.svg?style=svg&circle-token=def6ddf5670339f606d411b0d5095ca16fa8d57c)](https://circleci.com/gh/bypasslane/bypass-passport-strategy)

[Passport](http://passportjs.org/) strategy for authenticating with Bypass session tokens

This module lets you authenticate using a the Bypass session token in Node.js
applications.

## Install

This is stored in a private repository. Add the following in your package.json file.

```json
$ npm install --save @bypass/passport-strategy
```

## Usage

#### Configure Strategy

The local authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

```js
var BypassStrategy = require("@bypass/passport-strategy").Strategy;

passport.use(new BypassStrategy({server: 'http://where-my-auth-is'}));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'bypasstoken'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
const passport = require('passport');
passport.use(new BypassStrategy({ server: config.authURL, jwtSecret: config.jwtSecret }));
app.post('/login',
  passport.authenticate('bypasstoken'),
  function(req, res) {
    res.redirect('/');
  });
```
BypassStrategy requires an options object upon instantiation with two properties:
`server`: Clortho's URL, required for validating session tokens
`jwtSecret`: Our system's HMAC shared secret to decode and verify JWTs.

## Tests

```bash
$ npm install
$ npm test
```
