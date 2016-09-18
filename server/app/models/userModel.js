"use strict";

module.exports = require('mongoose').model('User', require('./db/userSchema'), "users");