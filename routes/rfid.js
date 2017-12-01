var rfidDb = require('../models/rfidDao.js');

//var EPC_PRODUCING = false;
/* GET home page. */

var gSock={};

var msg = function(code, msg, data){
    this.code = code;
    this.msg = JSON.stringify(msg);
    this.data = data;
};

function queryRfidLab(req, res, next){
	console.log('rfid js');
    if(req.session.user.permission != 1){
        res.json(new msg(-1,""));
        return;
    }

    rfidDb.query(req,function(result){
        //console.log('now, query result:', result);
        if (result.type == "success") {
            req.flash('success');
            return res.json(new msg(0, '', {count: result.count, data: result.data}));
        } else {
            console.log('query rfid lab', result.message);
            return res.json(new msg(-1, 'query rfid lab'));
		}
    });
}

function randomWord(length){
    var str = "";
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
 
    for(var i=0; i<length; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}

function getYearWeek (a, b, c) { 
	var date1 = new Date(a, parseInt(b) - 1, c), date2 = new Date(a, 0, 1), d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000); 
	return Math.ceil( (d + ((date2.getDay() + 1) - 1)) / 7 );
}

var printTotal, printCount = 0;
var epcidPrefix;
var epcidResData;
function printLabelOnce(res, req_body_type)
{
	var rfid = [];
	rfid['rfid_epcid'] = epcidPrefix + randomWord(5);
	console.log(rfid);
	rfidDb.search(rfid, function(err, result) {
		if (!err) {
			console.log(result);
			if (result.length == 0) {
				rfid['epcid_status']= 'PRINTED';
				rfid['label_type'] = req_body_type;
				console.log(rfid);

				rfidDb.insert(rfid, function(err) {
					if (!err) {
						epcidResData[printCount++] = rfid['rfid_epcid'];
						if (printTotal <= printCount) {
							res.json(new msg(0, 'OK', {result: "ok", data:epcidResData}));
//							EPC_PRODUCING = false;
							return;
						}
					}
					else {
						console.log("failed to insert EPCID: " + rfid['rfid_epcid'] + " to database");
					}
					printLabelOnce(res, req_body_type);
				});
				return;
			}
			console.log("find the epcid in the db, try again");
		}
		else {
			console.log("access db failed in print new label search");
		}
		printLabelOnce(res, req_body_type);
	});
}

function print_new_label(req, res, next)
{
	console.log("print_new_label");

	if (req.body.site) {/*
		if (EPC_PRODUCING) {
			console.log("Previous producing not finished, please try it later...");
			data = new msg(0, 'error', {data: "Previous producing not finished, please try it later..." });
			res.json(data);
			return;
		}*/

		if (isNaN(req.body.number)) {
			res.render("alert", {alertmsg: "please input the numbers	"});
			return;
		}

//		EPC_PRODUCING = true;

		var today = new Date();
		console.log(today);
		var y = today.getFullYear() - 2000;
		var w = getYearWeek(y, today.getMonth()+1, today.getDate());
		console.log(w);

		epcidPrefix = req.body.site;
		if (w < 10) {
			epcidPrefix += 0;
		}
		epcidPrefix += '' + w + y + req.body.type;
		printTotal = req.body.number;
		printCount = 0;

		console.log("printTotal:" + printTotal + ", epcidPrefix:" + epcidPrefix + ".");
		epcidResData = [];

		printLabelOnce(res, req.body.type);
	}
}

function remove_one_failed_printed(failedList, res)
{
	if (0 == failedList.length) {
		res.json(new msg(0, 'OK', {result: "ok"}));
		return;
	}

	var rfid = [];
	rfid['rfid_epcid'] = failedList.pop();
	rfidDb.search(rfid, function(err, result) {
		if (!err) {
			if (result.length != 0) {
				rfidDb.remove(rfid, function(err) {
					if (err) {
						res.json(new msg(0, 'error', {result: "remove EPCID:'" + rfid['rfid_epcid'] + "' failed"}));
					}
					else {
						console.log("EPCID:'%s' is successfully removed from database", rfid['rfid_epcid']);
					}
					remove_one_failed_printed(failedList, res);
				});
				return;
			}
			console.log("Can't find the printed EPCID:'%s' in database", rfid['rfid_epcid']);
		}
		else {
			console.log("access db failed in searching one failed printed label");
		}
		remove_one_failed_printed(failedList, res);
	});
}

function print_failed(req, res, next)
{
	console.log("print_failed");

	var failedList = req.body.failed;
	remove_one_failed_printed(failedList, res);
}

function print_label(req, res, next ) {
	
       var data;
  		 var type = req.body.type;
  		 var number = req.body.number;
  		 var rfid = [];
  		 
  		 if(type == 'EPCID')
  		 {
  		 	   rfid['rfid_epcid'] = number;
  		 }
  		 else if (type == 'ASSET_SN')
  		 {
  		 	   rfid['asset_num'] = number;
  		 }
  		 else
  		 {
  		 	   data = new msg(0, '成功', {result: "number type is wrong"});
      	   res.json(data);
      	   return;
  		 }
 		   
 		   rfidDb.search(rfid, function(err,rows){
 		   	  
 		       if(err)
			     {
				        console.log(err);
				        data = new msg(0, '成功', {result: "error founded when excute the db search"});
				       	return;
				   }
			
 		  
 		       if(rows.length == 0)
 		       {
 		   		     data = new msg(0, '成功', {result: "label is not found in the db"});
 		       }
 		       else
 		       {
 		           data = new msg(0, 'OK', {result: "ok", data: [rows[0].rfid_epcid]});
           }
           res.json(data);
           return;
 		
 		  });
}

function warehouse_update_database(sock, hint)
{
	var rfid = sock.rfid;
	rfid['rfid_epcid'] = sock.epcid;
	rfid['epcid_status'] = "INITIALIZED";
	rfid['rfid_tid'] = sock.rfid_tid;
	rfid['gen_time'] = new Date();
	rfidDb.update(rfid, function(err) {
		if (err) {
			console.log(err);
			sock.res.json(new msg(0, 'error', {result: "error happened while update db, please try again"}));
			return;
		}
		sock.res.json(new msg(0, 'OK', {result: "Successfully put Label into Warehouse" + hint}));
	});
}

function fmtlabel_update_database(sock)
{
	var rfid = sock.rfid_tid;
	rfid['epcid_status'] = "OBSOLETE";
	rfidDb.update(rfid, function(err) {
		if (err) {
			console.log(err);
			sock.res.json(new msg(0, 'error', {result: "Failed to update database while formatting existing label"}));
			return;
		}
		sock.res.json(new msg(0, 'OK', {result: "Successfully formated this RFID"}));
	});
}

const INVALID_LABEL = "FFFFFFFFFFFF";

function start_rfidrw_server()
{
	var net = require('net');
	var HOST = '135.251.123.102';
	var PORT = 6968;

	console.log("create server");
	var server = net.createServer(function(sock) {
		sock.setEncoding('utf8');
		if (typeof(gSock[sock.remoteAddress]) == 'undefined') {
			gSock[sock.remoteAddress] = new Object();
		}

		var objSock = gSock[sock.remoteAddress];
		objSock.socket = sock;
		console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

		sock.on('data', function(data) {
			if (objSock.socket != sock) {
				console.log("not this socket");
				return;
			}
			console.log("get data from client");
			console.log(data);

			if (objSock.req.body.epcid != objSock.epcid) {
				console.log(objSock.req.body.epcid);
				console.log(objSock.epcid);
				console.log("epcid changed");
				return;
			}

			var puredata = data.replace(/[\r\n\t]/g, '');
			console.log(puredata);
			var scandata = JSON.parse(puredata);
			if (scandata.msgtype == "RFIDERROR") {
				console.log("RFID error --", scandata);
				data = new msg(0, 'error', {result: "RFID error:" + scandata.ERRINFOField.data + " ,please try again"});
				objSock.res.json(data);
				return;
			}

			if (scandata.msgtype == 'RFIDSCANRESPONSE') {
				var epcid = scandata.EPCIDField.data;
				console.log(epcid);
				console.log(epcid.length);
				var rfid = [];
				rfid['rfid_epcid'] = String.fromCharCode(epcid[0]);
				for (var i=1; i<epcid.length; i++) {
					var temp = rfid['rfid_epcid'];
					rfid['rfid_epcid'] = temp + String.fromCharCode(epcid[i]);
				}
				objSock.rfid_tid = scandata.TIDField.data;
				console.log(rfid);
				rfidDb.search(rfid, function(err, rows) {
					if (err) {
						console.log(err);
						data = new msg(0, 'error', {result: "error founded when excute the db search, please try again"});
						objSock.res.json(data);
						return;
					}

					if (rows.length != 0) {
						if (rows[0].epcid_status == 'INITIALIZED' || rows[0].epcid_status == 'INSTALLED') {
							data = new msg(0, 'error', {result: "label is already useful in the db, please use new label"});
							objSock.res.json(data);
							return;
						}
						if (null == objSock.rfid || undefined == objSock.rfid) {
							objSock.rfid_tid = rows[0];
						}
					}

					if (rfid['rfid_epcid'] == objSock.epcid) {
						if (INVALID_LABEL != objSock.epcid && objSock.rfid != null && objSock.rfid != undefined) {
							warehouse_update_database(objSock, ".\nDon't need to rewrite RFID");
						}
						else {
							objSock.res.json(new msg(0, 'OK', {result: "RFID was already formated."}));
						}
						return;
					}

					var jsObj = {
						msgtype			: "RFIDWRITE",
						transactionid	: 5321,
						NEWEPCIDField	: {
							type	: "NEWEPCID",
							data	: []
						},
						EPCIDField		: {
							type	: "EPCID",
							data	: epcid
						}
					};
					console.log(objSock.epcid);
					var NEWEPCIDString = objSock.epcid;
					for (var i = 0; i< NEWEPCIDString.length; i++)
					{
						jsObj.NEWEPCIDField.data.push(NEWEPCIDString.charCodeAt(i));
					}
					var str = JSON.stringify(jsObj);
					console.log(str);
					sock.write(str);
				});
			}

			if (scandata.msgtype == 'RFIDWRITERESPONSE') {
				if (INVALID_LABEL != objSock.epcid && objSock.rfid != null && objSock.rfid != undefined) {
					warehouse_update_database(objSock, "");
				}
				else {
					fmtlabel_update_database(objSock);
				}
			}
		});

		sock.on('close', function(data) {
			console.log('CLOSED: ' + sock.remoteAddress);
			objSock.socket = -1;
		});

		sock.on('error', function(err) {
			console.log('socket error - ', err);
		});
	});

	server.listen({
		port: 6968
	}, function() {
		console.log(" opened server on address %j ", server.address());
	});
}

function do_format_label(req, res, epcid)
{
	var objSocket = gSock[req.socket.remoteAddress];
	if (typeof(objSocket) == 'undefined' || objSocket.socket == -1) {
		console.log("no connection for req sock address", req.socket.remoteAddress);
		res.json(new msg(0, 'error', {result: "No RFID writer connected"}));
		return;
	}

	var jsObj = {
		msgtype			: "RFIDSCAN",
		transactionid	: 5322
	};
	var str = JSON.stringify(jsObj);
	console.log(str);
	objSocket.req = req;
	objSocket.res = res;
	objSocket.epcid = req.body.epcid;
	objSocket.socket.write(str);
}

function format_label(req, res, next) {
	console.log("enter format_label");
	var epcid = req.body.epcid;
	if (INVALID_LABEL == epcid) {
		do_format_label(req, res, "");
		return;
	}

	var rfid = [];
	rfid['rfid_epcid'] = epcid;
	rfidDb.search(rfid, function(err, rows) {
		if (err) {
			console.log(err);
			res.json(new msg(0, 'error', {result: "Searching the database was failed"}));
			return;
		}

		if (rows.length != 0 && rows[0].epcid_status != 'OBSOLETE') {
			res.json(new msg(0, 'error', {result: "This EPCID number is still in use! Don't format it."}));
			return;
		}
		do_format_label(req, res, epcid);
	});
}

function label_warehouse(req, res, next){
	console.log("enter here");
	console.log(req.body.epcid);
	var rfid = [];
  	 
  	 
  	 
  	var epcid = req.body.epcid;
  	rfid['rfid_epcid']=epcid;
  	console.log("search ", rfid['rfid_epcid']);
 		rfidDb.search(rfid, function(err,rows){
 			  console.log("search finished");
 			  if(err)
			   {
				     console.log(err);
				     data = new msg(0, '成功', {result: "error founded when excute the db search"});
				     return;
				 }
			
 		     //console.log(rows);
 		     if(rows.length == 0)
 		     {
 		     	   console.log("can find label");
 		   		   data = new msg(0, '成功', {result: "label can not be found in the db"});
 		   		   res.json(data);
 		   		   return;
 		     }
 		     else
 		     {
 		     	   if(rows[0].epcid_status != 'PRINTED')
 		         {   
 		              data = new msg(0, '成功', {result: "this epcid number already used in the system, please change another one"});
 		              res.json(data);
 		   		        return;
 		   		   }
 		   		   else
 		   		   {
 		   		   	    var rfid_epcid = rows[0].rfid_epcid;
 		   		   	    var rfid_tid;
 		   		   	    
 		   		   	    if(typeof(gSock[req.socket.remoteAddress])== 'undefined' || gSock[req.socket.remoteAddress].socket==-1)
 		   		   	    {
 		   		   	    	  
 		   		   	    	  console.log("no connection for req sock address ", req.socket.remoteAddress);
 		   		   	    	  data = new msg(0, '成功', {result: "no rfid writer connection"});
 		   		   	    	  res.json(data);
 		   		            return;
 		   		   	    }
 		   		   	    
 		   		   	    gSock[req.socket.remoteAddress].req=req;
 		   		   	    gSock[req.socket.remoteAddress].res=res;
 		   		   	    gSock[req.socket.remoteAddress].epcid=epcid;
                  gSock[req.socket.remoteAddress].rfid=rows[0];

 		   		   	    var jsObj = new Object();
                  jsObj.msgtype = "RFIDSCAN";
                  jsObj.transactionid = 5322;
                  var str = JSON.stringify(jsObj);
                  console.log(str);
                  console.log("RFIDSCAN sent");
	                gSock[req.socket.remoteAddress].socket.write(str);
	                return;
 		   		   	    
 		   		   }
 		   		   
         }
 	  });
}
module.exports.queryRfidLab = queryRfidLab;
module.exports.start_rfidrw_server =start_rfidrw_server;
module.exports.print_new_label = print_new_label;
module.exports.print_failed = print_failed;
module.exports.print_label = print_label;
module.exports.label_warehouse = label_warehouse;
module.exports.format_label = format_label;
