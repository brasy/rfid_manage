/**
 * Created by xying on 2017/9/21.
 */
var warehouseM = require('../models/wareHousing.js')
var fs = require("fs");

var msg = function(code, msg, data){
    this.code = code;
    this.msg = JSON.stringify(msg);
    this.data = data;
};

function queryWarehouse(req,res,next) {
    console.log('warehousing js');
    if(req.session.user.permission != 1){
        res.json(new msg(-1,""));
        return;
    }

    warehouseM.query(req,function(result){
        console.log('now, query result:', result);
        if (result.type == "success") {
            req.flash('success');
            return res.json(new msg(0, '', {count: result.count, data: result.data}));
        } else {
            console.log('query warehousing', result.message);
            return res.json(new msg(-1, 'query warehousing'));
		}
    });

}

function saveWarehouse(req,res,next){
    console.log('warehousing save js');
    if(req.session.user.permission != 1){
        res.json(new msg(-1,""));
        return;
    }

    var locationS = req.body.locationS;
    var index = req.body.index;
    var locationEpcid= req.body.locationEpcid;
    var status=req.body.status;
    var serialNo=req.body.serialNo;
    var assertType=req.body.assertType;
    if (assertType == 'Z'&&locationS == '')
    {
        return res.json(new msg(-1, "please enter valid locationS! "));
    }
    warehouseM.save(index,locationS,serialNo,status,locationEpcid,assertType,function(result) {
        if (result.type == "success") {
            req.flash('success');
            return res.json(new msg(0, 'success'));
        } else {
            console.log('update warehousing', result.message);
            return res.json(new msg(-1, result.message));
        }
    });
}

function readCSVFile(import_file, callBack){
    var rows = new Array();
    var elem = new Array();

    fs.readFile(import_file, function(err, data) {
        if (err) {
            callBack(elem);
            return;
        }

        rows = data.toString().split("\n");
        for(var i = 0;i< rows.length;i++){
            console.log(String(rows[i]));
            if (rows[i].toString().length!=0){
                elem.push(rows[i].toString().split(","));
            }
        }
        console.log(elem);
        callBack(elem);
    });
}

function importWarehouse(req,res,next){
    console.log('warehousing import js');
    if(req.session.user.permission != 1){
        res.json(new msg(-1,""));
        return;
    }
    if (!req.file) {
        console.log(req.file);
        return res.json(new msg(-1, ''));
    }

    //read file information for debug
    var import_file= req.file;
    readCSVFile(import_file, function(elem){
        warehouseM.beginsql();
        warehouseM.clearTemp();
        warehouseM.newTemp();
        warehouseM.queryDebug();

        warehouseM.insert(elem,function(result){
            console.log('insert temp.... ');
            if (result.type == "fail") {
                console.log('import result: '+result.message);
                return res.json(new msg(-1, result.message));
            }
        }); 
        warehouseM.commitsql();
    });

    return res.json(new msg(0, 'import successful!'));
}

/*
 * function for load csv to mysql
 * loading wareHousing to temp sql tables
 * add by xying 2017-09-26
 */
function analyzeWarehouseTosql(req,res,next){
    console.log('warehousing analysis js');
    if(req.session.user.permission != 1){
        res.json(new msg(-1,""));
        return;
    }

    warehouseM.analysis_location(req,function(result){
        console.log(result);
        if (result.type == "fail") {
            console.log('analysis result: '+result.message);
            return res.json(new msg(-1, result.err));
        }
        return res.json(new msg(0, result.message));
    });

}

function writeCSVFile(callBack){
    var filename;
    var rstarray=[];

    warehouseM.exportResultFiles(function(result){
        if (result.type == "success") {
            filename = result.file;

            for (var i = 0; i < result.data.length; i++) {
                var row = result.data[i];
                rstarray.push([
                    row.install_time,
                    row.rfid_epcid,
                    row.asset_num,
                    row.location_epcid,
                    row.lasLocationString,
                    row.installed_account,
                    row.installed_tem_id
                ]);
            }

            fs.createWriteStream(filename);
            fs.exists(filename,function(exists){
                if(exists){
                    fs.writeFile(filename,rstarray,function (err) {
                        if (err) throw err ;
                        console.log("File Saved !"); //save file
                    });
                }
            });
            callBack(filename);
        }
    });

}

/*
 * export wareHousing analysis result
 *1. save to a file and can download result files
 *2. show the fail_count and fail records
 * add by xying 2010-10-18
 */
function importResult(req,res,next){
    console.log('warehousing result js');
    var filename;

    if(req.session.user.permission != 1){
        res.json(new msg(-1,""));
        return;
    }

    writeCSVFile(function(result){
        filename = result;
    });

    console.log(filename);
    warehouseM.queryAnalysisRst(req,function(result){
        console.log(result);
        if (result.type == "fail") {
            console.log('import result', result.message);
            return res.json(new msg(-1, result.message));
        } else {
            return res.json(new msg(0, '', {count: result.fail_count,total:result.total_count,merge:result.success_count, data: result.data,file:filename}));
        }
    });

}

module.exports.queryWarehouse = queryWarehouse;
module.exports.saveWarehouse = saveWarehouse;

module.exports.importWarehouse = importWarehouse;
module.exports.analyzeWarehouseTosql = analyzeWarehouseTosql;
module.exports.importResult = importResult;
