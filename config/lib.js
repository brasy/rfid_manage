/**
 * Created by xying on 2017/9/20.
 */

var mysql = require('mysql');
var cfg = require('./cfg.js');


// 使用连接池，提升性能
var pool;
var getPool = module.exports.getPool = function(){
    if(!pool){
        pool = mysql.createPool(cfg.mysql);
    }
    return pool;
}

/**
 * mysql query 
 * xying 2017-10-11
 */
var query = module.exports.query = function(sqlReq, callback){
    pool = getPool();

    if(!sqlReq){
        throw new DBError("sqlReq is null");
    }
    console.log(sqlReq);
    var querySql = sqlReq.sql || "";
    if (querySql.length === 0) {
        throw new DBError("sql is empty");
    }

    pool.getConnection(function(err, connection) {
        if(err) {
            throw err;
		}

        //自定义格式化函数
        /*connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
              if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
              }
              return txt;
            }.bind(this));
        };*/

        connection.query(querySql, sqlReq.params, function(err,result){
            connection.release();
            return callback(err, result);
        });
    });
}
