# Mailcow.js
  
The unofficial Mailcow nodejs wrapper

[![GitHub issues](https://img.shields.io/github/issues/DopeDealers/Mailcow.js)](https://github.com/DopeDealers/Mailcow.js/issues)
[![GitHub license](https://img.shields.io/github/license/DopeDealers/Mailcow.js)](https://github.com/DopeDealers/Mailcow.js/blob/main/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/DopeDealers/Mailcow.js/graphs/commit-activity) 

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/uses-badges.svg)](https://forthebadge.com)

## About
Mailcow.js is a simple and easy-to-use Node.js library designed to interact with the Mailcow email server API. With this library, you can effortlessly manage mailboxes, domains, aliases, sync jobs, and more, all through a clean and intuitive interface.

## Installation

**NPM**
``npm i mailcow.js``

**Yarn**
``yarn add TBD``


## Client
```js
const Mailcow = require('mailcow.js');

const mailcow = new Mailcow('https://mail.yourdomain.org/', {
    readOnlyKey: 'XXXX-XXXX-XXXX-XXXX',
    writeKey: 'XXXX-XXXX-XXXX-XXXX'
});

// Get user mailbox
mailcow.getUserMailBox('admin@yourdomain.org')
    .then(data => console.log(data))
    .catch(err => console.error(err));

// Add a new domain
mailcow.addDomain({ domain: 'newdomain.org' })
    .then(data => console.log(data))
    .catch(err => console.error(err));

```