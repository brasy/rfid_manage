/** * Created on 2017/9/20. */
var os = require('os');
var path = require("path");

var cfg = {
  mysql:{
    host:'localhost',
    user:'root',
    password:'bbb#1234',
    database:'rfid_user',
    port: 3306,
    acquireTimeout: 20000
  },
  errorCode:{
    STATUS_OK                 : 0,
    STATUS_NOTFOUND           : 1,   //means data not found not url request
    STATUS_SERVER_ERROR       : 2,
    STATUS_INVAILD_PARAMS     : 3,
    STATUS_DBERROR            : 4
    //....
  },
  footer_dir: 'footer_images/',
  comic_dir: 'comic/'
};
module.exports = cfg;
