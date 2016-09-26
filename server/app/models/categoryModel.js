"use strict";

module.exports = require('mongoose').model('Category', require('./db/categorySchema'), "category");