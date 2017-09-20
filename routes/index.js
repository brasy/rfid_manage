var express = require('express');
var router = express.Router();

var cfg = require('../config/cfg.js');
var userDao = require('../models/userDao.js');
var locationM = require('../models/location.js');

var multer  = require('multer');
var formidable = require('formidable');
var os = require('os');
var lib = require('../config/lib.js');
var _ = require('lodash');
var async = require('async');
var request = require('superagent');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{ user: req.session.user });
});


// ===============================login/regist========================================

router.route("/login").get(function(req,res){
  res.render("login",{ user: req.session.user });
});

router.post("/login", function(req, res, next) {
  userDao.login(req, res, next);

});


/* GET resetPassword page. */
router.route("/resetPassword").get(function(req,res){
  res.render("resetPassword",{ user: req.session.user });
});
/* POST resetPassword page. */
router.post("/resetPassword", function(req, res, next) {
  userDao.resetPassword(req, res, next);

});

/* GET register page. */
router.route("/register").get(function(req,res){
  res.render("register",{ user: req.session.user });
});
/* POST register page. */
router.post("/register", function(req, res, next) {
  userDao.register(req, res, next);

});

/* GET logout page. */
router.post("/logout",function(req,res){
  userDao.logout(req, res);
});

/* GET home page. */
router.get("/home",function(req,res){
  res.render("home",{ user: req.session.user });

});

//============================user=================================

//user
router.get('/userlist', function(req, res, next) {
  res.render('userlist', { user: req.session.user});
});

//location
router.get('/locationManage', function(req, res, next) {
  res.render('locationManage', { user: req.session.user});
});


//============================rfid=================================

router.get('/rfidManage',function (req,res,next) {
  res.render('rfidManage',{ user: req.session.user});
})

router.get('/warehousing',function (req,res,next) {
  res.render('warehousing',{user:req.session.user});
})

router.get('/assetManage',function (req,res,next) {
  res.render('assetManage',{user:req.session.user});
})

//========================audit==================================
router.get('/auditManage',function (req,res,next) {
  res.render('auditManage',{user:req.session.user});
})

router.get('/reportManage',function (req,res,next) {
  res.render('reportManage',{user:req.session.user});
})


//============================API=============================
router.post('/user/query', function(req, res, next) {
  userDao.query(req, res, next,req.session.user);
});
router.post('/addUser',function (req,res,next) {
  userDao.addUser(req, res, next,req.session.user);
});
router.post('/editUser',function (req,res,next) {
  userDao.editUser(req, res, next,req.session.user);
});
router.post('/deleteUser',function (req,res,next) {
  userDao.deleteUser(req, res, next,req.session.user);
});

//location
router.post('/position/query',function (req,res,next) {
  locationM.queryPosition(req,res,next);
})

router.post('/addLab',function (req,res,next) {
  locationM.addLab(req,res,next);
})

router.post('/deletePosition',function (req,res,next) {
  locationM.deletePosition(req, res, next);
});


module.exports = router;
