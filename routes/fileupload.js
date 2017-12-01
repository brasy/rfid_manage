/* just for fileupload to server
 * xying001 2017-09-27
 */

var multer = require('multer');
var md5 = require('md5');
var config = require('./config')


var storage = multer.diskStorage({ 
    //set upload file path, or to file server
    //Note: if you deliver a function, you need to mkfir. if deliver a string, multer will create.
    destination: config.upload.path, 
    //destination: '/home/xying001/nodejsProj/projTest/RFIDServer/uploads',
    //destination: '/var/lib/mysql-files', 

    //TODO: storing file is seperated by directory
    //rename file
    filename: function (req, file, cb) { 
        var fileFormat = (file.originalname).split("."); 
        cb(null, file.fieldname + "." + fileFormat[fileFormat.length - 1]); 
    } 
}); 

 //add config to multer
 var upload = multer({ 
     storage: storage, 
     //other configuration refer to multer limits
     //limits:{} 
 }); 
 //export object
 module.exports = upload; 
