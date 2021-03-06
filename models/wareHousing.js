/** * Created by xying on 2017/9/21. */
var lib = require('../config/lib.js');
//使用链接池,提升性能var pool = lib.getPool();
var query = function (req,callback) {
  var data = []; console.log('warehousing sql js');
  pool.getConnection(function(err, connection) {
    if(err) {
      data.type = "fail";
      data.message = "connect fail";
      data.err = err;
      callback(data);
      return;  }
        
    var epcid = req.body.epcid||'';
    var start = parseInt(req.body.start);
    var length = parseInt(req.body.length);
    var epcsql ='where epcid_status='+connection.escape("INSTALLED") + 'and rfid_epcid like "%'+epcid+'%" or epcid_status='+connection.escape("OBSOLETE");
    connection.query('select * from rfid_inventory left join rfid_location on rfid_inventory.location_epcid = rfid_location.rfid_location_epcid '+ epcsql +'limit ?,?',[start,length], function(err,result){
      if (err) {
        data.type = "fail";
        data.message = "select fail";
        data.err = err;
        callback(data);
      } else {
        connection.query('select count(1) from rfid_inventory '+ epcsql +'',[], function(err,result2){
          data.type = "success";
          data.message = "success";
          data.err = '';
          data.count = result2[0]['count(1)'];
          data.data = result;
          callback(data);
        });
      }
      connection.release();
    });
  });}
var save = function (index,locationS,serialNo,status,locationEpcid,assertType,callback) {
  var data = [];
  console.log('warehousing save js');
    pool.getConnection(function(err, connection) {
      if(err) {
        data.type = "fail";
        data.message = "connect fail";
        data.err = err;
        callback(data);
        return;
      }
      connection.query('update rfid_inventory set epcid_status = ?, asset_num = ? where rfid_index = ?', [status, serialNo, index], function (err, result) {
        if (err) {
          data.type = "fail";
          data.message = "update fail";
          data.err = err;
          callback(data);
          return;
        } else {
          if(assertType=='E') {
            connection.query('select count(1) from rfid_inventory where location_epcid =?', [locationEpcid], function (err, result1) {
              console.log(result1[0]['count(1)']);
              if ( result1[0]['count(1)']>0) {
                connection.query('update rfid_inventory set location_epcid = ? where rfid_index = ?', [locationEpcid, index], function (err, result2) {
                  if (err) {
                    data.type = "fail"; 
                    data.message = "connect fail";
                    data.err = err;
                    callback(data); 
                    return;
                  }
                  data.type = "success";
                  data.message = "success";
                  data.err = '';
                  callback(data);
                }); 
              }
              else
              {
                data.type = "fail";
                data.message = "please input existing locationEpcid in rfid table";
                data.err = err;
                callback(data);
                return;
              }
            });
            connection.release();
          }
          else {
            connection.query('update rfid_location set lasLocationString = ? where rfid_location_epcid = ?', [locationS, locationEpcid], function (err, result) {
              if (err) {
                data.type = "fail";
                data.message = "update fail";
                data.err = err;
                callback(data);
                return;
              } else {
                data.type = "success";
                data.message = "success";
                data.err = '';
                callback(data);
              }
              connection.release();
            });
          }
        }
      });
    });
}
/** just for analysis csv files * maybe for audit in the future * create by xying 2017-09-25 */
var insert = function(elem, callback){
  var data = [];
  var time;
  var epcid;
  var serialNo;
  var locationEpcid;
  var locationS;
  var operator;
  var ptsNo;
  var timestamp = new Date();
  console.log('warehousing insert js');
  console.log(elem);
    
  //just for debug and show elem infor
  for (var i=0;i<elem.length;i++){
    time = String(elem[i][0]);
    epcid = String(elem[i][1]);
    console.log(epcid);
    serialNo = String(elem[i][2]);
    console.log(serialNo);
    locationEpcid = String(elem[i][3]);
    locationS = String(elem[i][4]);
    operator = String(elem[i][5]);
    console.log(operator);
    ptsNo = String(elem[i][6]);
  }
    
  pool.getConnection(function(err, connection) {
    if(err) {
      data.type = "fail";
      data.message = "connect fail";
      data.err = err;
      callback(data);
      return;
    }
        
    var mysql = "insert into rfid_temp(`install_time`,`rfid_epcid`,`asset_num`,`location_epcid`,`lasLocationString`,`installed_account`,`installed_tem_id`) values ?";
    connection.query(mysql,[elem],function(err, result){
      if (err) {
        data.type = "fail";
        data.message = "load warehousing information fail";
        data.err = err;
      } else {
        data.type = "success";
        data.message = "load warehousing information success";
        data.err = '';
      }
    });
    callback(data);
    connection.release();
  });
}
var lock = function(sql, callback){
  console.log('lock tables');
  var data = [];
  var lockSql = 'lock tables '+ sql +' ';
  lib.query({sql:lockSql,params:[]}, function(err,result){
    if(err) {
      data.type = "fail";
      data.message = "lock tables fail";
      data.err = err; 
      callback(data);
      return;
    }
    data.type = "success";
    callback(data);
  });
}
var unlock = function(callback){
  console.log('unlock tables'); var data = [];    var unlockSql = 'unlock tables;';
    lib.query({sql:unlockSql,params:[]}, function(err,result){        if(err) {            data.type = "fail";            data.message = "unlock tables fail";            data.err = err;            callback(data);            return;        }        data.type = "success";        callback(data);    });}
/* * for AIDC * create by xying 2017-10-15 */var beginsql = function(){    console.log('beginsql tables');
    lib.query({sql:'begin;',params:[]}, function(err,result){        if(err) {            throw err;        }    });    console.log('beginsql infor');}
var commitsql = function(){    console.log('commitsql tables');
    lib.query({sql:'commit;',params:[]}, function(err,result){        if(err) {            throw err;        }    });    console.log('commitsql infor');}
/* * load warehousing information, to the new temp tables * update new temp with label_type E or Z * notes: update function need to modify according to design document * create by xying 2017-09-26 * maybe use in the future */var loadsql = function(req,callback) {    console.log('warehousing loadsql js');    var data=[];
    var filterSql = "(`install_time`,`rfid_epcid`,`asset_num`,`location_epcid`,`lasLocationString`,`installed_account`,`installed_tem_id`);";    var mysql = "load data infile '/var/lib/mysql-files/avatar.csv' " +             " ignore into table rfid_temp character set gbk fields terminated by ',' enclosed by '\"' lines terminated by '\n' " +                filterSql +" ";
    lib.query({sql:mysql,params:[]}, function(err,result){        if(err) {            data.type = "fail";            data.message = "load warehousing information fail";            data.err = err;            callback(data);            return;        }    });
    console.log('load warehousing ok');
    data.type = "success";    data.message = "load warehousing information successful!";    data.err = '';    callback(data);
}
/* * analysis rfid inventory, import rfid_inventory tables from temp tables * update new warehousing rfid_inventory information * create by xying 2017-10-12 */var analysis = function(req, callback){    console.log('warehousing analysis js');    var data=[];    var timestamp = new Date();
    var mysql = "update rfid_inventory AS d,rfid_temp AS s " +                " set d.asset_num=s.asset_num,d.location_epcid=s.location_epcid,d.epcid_status=?, d.install_time=?,d.installed_account=s.installed_account,d.installed_tem_id=s.installed_tem_id," +                " s.label_type=d.label_type,s.epcid_status=? " +                " where d.rfid_epcid = s.rfid_epcid ; ";
    lib.query({sql:mysql,params:['INSTALLED',timestamp,'ok']}, function(err,result){        if(err) {            data.type = "fail";            data.message = "analyze warehousing basic inventory fail";            data.err = err;            callback(data);            return;        }    });
    data.type = "success";    data.message = "analyze warehousing inventory successful";    data.err = '';    callback(data);}
/* * analysis location, import location tables from temp tables * update new warehousing location information * create by xying 2017-10-19 * detail:  * 1. create new transaction for merge information. * 2. when do audit, this section code can reuse or reference. */var analysis_location = function(req, callback){    console.log('warehousing analysis location js');    var data=[];
    var timestamp = new Date();    var mysql = "update rfid_inventory AS d,rfid_temp AS s " +                " set d.asset_num=s.asset_num,d.location_epcid=s.location_epcid,d.epcid_status=?, d.install_time=?,d.installed_account=s.installed_account,d.installed_tem_id=s.installed_tem_id," +                " s.label_type=d.label_type,s.epcid_status=? " +                " where d.rfid_epcid = s.rfid_epcid ; ";
    pool.getConnection(function(err, connection) {        if(err) {            data.type = "fail";            data.message = "connect fail";            data.err = err;            callback(data);            return;        }        //create new transaction for merge information.        connection.beginTransaction(function(err) {            if (err) {                console.log('fail create transaction');                data.type = "fail";                data.message = "analyze warehousing fail when create transaction";                data.err = err;                callback(data);                connection.release();            }
            //update rfid inventory information            connection.query(mysql,['INSTALLED',timestamp,'ok'], function(err,result){                if (err) {                    return connection.rollback(function() {                        data.type = "fail";                        data.message = "analyze warehousing inventory fail";                        data.err = err;                        callback(data);                        connection.release();                     });                }
                //update rfid location information. for different funciton with different display policy                mysql = "update rfid_location AS d,rfid_temp AS s " +                " set d.lasLocationString=s.lasLocationString " +                " where d.rfid_location_epcid = s.location_epcid and s.epcid_status='ok' and s.label_type='Z'; ";                connection.query(mysql,['INSTALLED',timestamp,'ok'], function(err,result){                    if (err) {                        return connection.rollback(function() {                            data.type = "fail";                            data.message = "analyze warehousing location fail";                            data.err = err;                            callback(data);                            connection.release();                        });                    }
                    //transaction commit, match with sql ACID                    connection.commit(function(err) {                        if (err) {                            return connection.rollback(function() {                                data.type = "fail";                                data.message = "warehousing commit fail";                                data.err = err;                                callback(data);                                connection.release();                            });                        }
                        console.log('成功');                        data.type = "success";                        data.message = "analyze warehousing successful";                        callback(data);                        connection.release();                    });                });            });        });    });
}
/* * clean old temp tables and prepare for new warehousing * create by xying 2017-10-17 */var clearTemp = function(){    console.log('clear Temp tables result:');    lib.query({sql:'DROP TABLE IF EXISTS rfid_temp;',params:[]}, function(err,result){        if(err) {            throw err;        }    });}
/* * create temp tables for warehousing * create by xying 2017-10-19 */var newTemp = function(){    console.log('new Temp tables result:');
    var mysql =  "CREATE TABLE IF NOT EXISTS rfid_temp(" +         "rfid_index INT UNSIGNED AUTO_INCREMENT," +              "install_time VARCHAR(30)," +              "rfid_epcid VARCHAR(30)," +              "asset_num VARCHAR(30)," +              "location_epcid VARCHAR(30)," +              "lasLocationString VARCHAR(30) CHARACTER SET utf8 DEFAULT NULL," +              "installed_account VARCHAR(30)," +              "installed_tem_id VARCHAR(30)," +              "label_type VARCHAR(1) CHARACTER SET utf8 DEFAULT NULL," +              "epcid_status VARCHAR(10) CHARACTER SET utf8 DEFAULT NULL," +              "merge_status VARCHAR(10) CHARACTER SET utf8 DEFAULT NULL," +              "PRIMARY KEY ( rfid_index )" +              ")ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8";
    lib.query({sql:mysql,params:[]}, function(err,result){        if(err) {            throw err;        }    });
}
/* * just for warehousing Debug * create by xying 2017-10-11 */var queryDebug = function(){    console.log('debug query result:');    lib.query({sql:'select * from rfid_temp;',params:[]}, function(err,result){        if(err) {            throw err;        }        console.log(result);    });    console.log('debug query');}
/* * export analysis result and save to a file * create by xying 2017-10-18 */var exportResultFiles = function(callback){    console.log('export result:');    var data = [];
    //var timestamp = new Date().Format("yyyy-MM-dd hh:mm:ss");    //console.log(timestamp);    var filename='uploads/result' + (Math.random() * 10000)+ '.csv';    var mysql = 'select * from rfid_temp where epcid_status IS NULL ';// into outfile '+filename ;
    lib.query({sql:mysql,params:[]}, function(err,result){        if(err) {            throw err;        }        console.log(result);
    data.type = "success";    data.message = "expert warehousing result file successful";    data.err = '';    data.file = filename;    data.data = result;    callback(data);    console.log('export result');    });}
/* * query analysis result to html to show * create by xying 2017-10-18 */var queryAnalysisRst = function (req,callback) {    console.log("query export result : "); var data = [];    var total_count;    var success_count;
    pool.getConnection(function(err, connection) {        if(err) {            data.type = "fail";            data.message = "connect fail";            data.err = err;            callback(data);            return;        }
        var start = parseInt(req.body.start);        var length = parseInt(req.body.length);        connection.query('select * from rfid_temp where epcid_status IS NULL limit ?,?',[start,length], function(err,result){            if (err) {                data.type = "fail";                data.message = "export warehousing result fail";                data.err = err;                connection.release();                callback(data);                return;            } else {                connection.query('select count(1) from rfid_temp where epcid_status="ok" ',[], function(err,result2){                    success_count = result2[0]['count(1)'];                });
            console.log(success_count);            console.log('count the fail,success,total count');
            connection.query('select count(1) from rfid_temp ',[], function(err,result3){                data.type = "success";                data.message = "export warehousing result successful";                data.err = '';                data.total_count = result3[0]['count(1)'];                data.success_count = success_count;                data.fail_count = parseInt(data.total_count)-parseInt(success_count);                data.data = result;                callback(data);            });             }            connection.release();        });    });}
exports.query = query;exports.save = save;
exports.insert = insert;exports.loadsql = loadsql;exports.analysis = analysis;exports.analysis_location = analysis_location;
exports.beginsql = beginsql;exports.commitsql = commitsql;exports.queryDebug = queryDebug;
exports.clearTemp = clearTemp;exports.newTemp = newTemp;
exports.exportResultFiles = exportResultFiles;exports.queryAnalysisRst = queryAnalysisRst;
