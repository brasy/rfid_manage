/*
#!/usr/local/bin/node
-*- coding:utf-8 -*-
Desc: Error definition and inherit
*/
var config = require("../config/cfg.js");
var assert = require("assert");
var util   = require("util");

function DBError (message) {
  Error.call(this);
  this.name       = "DBError";
  this.message    = message || "DBError";
  this.statusCode = config.statusCode.STATUS_DBERROR;
}

util.inherits(DBError, Error);

global.DBError           = DBError;
