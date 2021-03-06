/*
Source Server Type    : MySQL
Source Server Version : 1 Source
Host           : localhost
Source Database       : rfid

 Target Server Type    : MySQL
 Target Server Version : 1
 File Encoding         : utf-8
 
 Date: 09/11/2017 15:37:27 PM
 */
 SET NAMES utf8mb4;
 SET FOREIGN_KEY_CHECKS = 0;
-- ------------------------------  Table structure for `rfid_inventory`-- ----------------------------
DROP TABLE IF EXISTS `rfid_inventory`;
CREATE TABLE `rfid_inventory` (
  `rfid_index` int(11) NOT NULL AUTO_INCREMENT,
  `rfid_epcid` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `asset_num` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `rfid_tid` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `label_type` varchar(1) CHARACTER SET utf8 DEFAULT NULL,
  `epcid_status` varchar(10) CHARACTER SET utf8 DEFAULT NULL,
  `location_epcid` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `gen_time` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `install_time` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `obsolete_time` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `last_location_time` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `installed_account` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `installed_tem_id` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  `last_operation_account` varchar(30) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`rfid_index`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ------------------------------  Table structure for `users`-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `permission` int(11) NOT NULL,
  `status` int(1) DEFAULT '1',
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
-- ------------------------------  Records of `users`-- ----------------------------
BEGIN;INSERT INTO `users` VALUES ('1', 'admin', 'asb#1234', '1', '1', null), ('2', 'root', '123456', '1', '1', null);
COMMIT;
/*
执行sql脚本,可以有2种方法:
第一种方法:  在命令行下(未连接数据库),输入 mysql -h localhost -u root -p123456 < RFID.sql (注意路径不用加引号的!!) 回车即可.
第二种方法:  在命令行下(已连接数据库,此时的提示符为 mysql> ), use databases; 输入 source RFID.sql 
(注意路径不用加引号的) 
或者 \. RFID.sql (注意路径不用加引号的) 回车即可
*/

