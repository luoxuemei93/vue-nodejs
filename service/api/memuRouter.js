const express = require('express');
const router = express.Router();
const token = require('./token.js');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'logindb'
})
connection.connect();
// 账号密码登录
router.post('/getMenuList', (req, res) => {
    const user = req.body;
    console.log("getMenuList")
    console.log(req.body);
})
 

module.exports = router;