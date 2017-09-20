# rfid_manage
rfid manage system, based on yzhtracy/LogisticSystem-node.js
# RFID Management System
该项目还在不定期更新中
## 使用说明
1.在终端该程序bin目录下使用 node www 指令运行程序。```node www```
2.如果出现依赖库未找到的错误，需要自己使用npm install 所需要的依赖库。
3.check.js为一个监听本程序运行状况并在程序出问题关闭时自动重启的小程序，在需要长期启动本系统时可以使用，也可以直接运行start.sh脚本。```node wwwnode check.js```或```./start.sh```
4.该系统运行需要mysql的支持，sql的格式和基本数据存放在RFID.sql中需要导入进mysql。
### User Management
#### 可以添加或删除用户，不同用户会拥有不同的功能权限，新注册用户默认为用户权限，管理员权限可以查看及修改所有用户的记录
### RFID Management
### warehousing Management
### location Management
### asset Management
### audit Management
### report Management
