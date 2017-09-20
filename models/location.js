/**
 * Created by taoyi-third on 2017/3/23.
 */
var mysql = require('mysql');
var cfg = require('../config/cfg.js');
var lib = require('../config/lib.js');

//使用链接池,提升性能
var pool = lib.getPool();

var msg = function(code, msg, data){
    this.code = code;
    this.msg = JSON.stringify(msg);
    this.data = data;
};
module.exports={
    addLab:function (req,res,next) {
        if(req.session.user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }

        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };
			var timestamp = new Date();
			var site = req.body.site;
            var building = req.body.building;
            var floor = req.body.floor;
            var longitudo = req.body.longitudo;
            var latitude = req.body.latitude;
			connection.query('INSERT INTO labLocation (site, building, floor, longitudo, latitude, opentime, status) VALUES (?, ?, ?, ?, ?, ?, "1");',[site, building, floor, longitudo, latitude, timestamp],function(err, result){
                var data;
                if (err) {
                    data = new msg(-1, err);
                } else {
                    data = new msg(0, "success");
                    // req.session.user = result[0];
                }
                res.json(data);
                connection.release();
            });
        });
    },//select table,ok
    queryPosition:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            var start = parseInt(req.body.start);
            var length = parseInt(req.body.length);
            var site = req.body.site||'';
            var building = req.body.building||'';
            var floor = req.body.floor||'';
            var sitesql=' and site like "%'+site+'%" and building like "%'+building+'%" and floor like "%'+floor+'" ';
            connection.query('select * from labLocation where status = 1 '+sitesql+' limit ?,?',[start,length],function (err,result) {
                if(err){
                    console.log("connect database fail  start="+start+"length=="+length);
                    return res.json(new msg(-1, err));
                }

                connection.query('select count(1) from labLocation where status = 1 '+sitesql+' ', [], function(err, result2) {
                    res.json(new msg(0, '', {count: result2[0]['count(1)'], data: result}));
                });

                connection.release();
            })
        })
    }, //delete position, ok
	deletePosition:function (req,res,next) {
        if(req.session.user.permission != 1){
            res.json(new msg(-1,"not permit"));
            return;
        }
        pool.getConnection(function (err,connection) {
            if(err){
                console.log("connect database fail");
                throw err;
			}
            var ids = parseInt(req.body.ids);
            connection.query('update labLocation set status = 0 where id = ?', [ids], function(err,result) {
                if(err){
                    console.log("connect database fail  ids="+ids);
                    return res.json(new msg(-1, err));
                }
                res.json(new msg(0,'success'));
                connection.release();
            });
        });
    }

}