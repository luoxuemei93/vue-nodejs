const express = require('express');
const router = express.Router();
const token = require('./token.js');
// const connection = require('./mysqlConnection.js');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'logindb'
})
connection.connect();
// 获取商品信息
// 账号密码登录
router.post('/getGoodsList', (req, res) => {
    const user = req.body;
    // 定义查询 sql
    const sel_user_sql =  `select * from goods`;
    connection.query(sel_user_sql, (err, results) => {
        if (err) throw err;
        if (!results) {
            res.json({
                status: '-1',
                message: '查询错误'
            })
        } else {
            res.json({
                status: '0',
                message: '登陆成功！',
                results
            })
        }
    })
})
// 账号密码登录
router.post('/loginByUserName', (req, res) => {
    const user = req.body;
    // 定义查询 sql
    const sel_user_sql =  `select * from login where userName = '${user.userName}'`;
    connection.query(sel_user_sql, (err, results) => {
        if (err) throw err;
        if (results[0] === undefined) {
            res.json({
                status: '-1',
                message: '用户名错误，用户不存在！'
            })
        } else {
            if (results[0].userName === user.userName && results[0].password === user.password) {
                const userToken = token.createToken(user);
                res.json({
                    status: '0',
                    message: '登陆成功！',
                    token: userToken
                })
            } else {
                res.json({
                    status: '1',
                    message: '密码错误！'
                })
            }
        }
    })
})

// 登录模块
router.post('/login', (req, res) => {
    const user = req.body;
    console.log("req.body")
    console.log(req.body);
    // 定义查询 sql
    const sel_email_sql =  `select * from user where email = '${user.email}'`;
    connection.query(sel_email_sql, (err, results) => {
        if (err) throw err;
        // console.log(results);
        if (results[0] === undefined) {
            res.json({
                status: '-1',
                message: '邮箱填写错误，用户不存在！'
            })
        } else {
            if (results[0].email === user.email && results[0].password === user.password) {
                const userToken = token.createToken(user);
                res.json({
                    status: '0',
                    message: '登陆成功！',
                    token: userToken
                })
            } else {
                res.json({
                    status: '1',
                    message: '密码错误！'
                })
            }
        }
    })
})

// 注册模块
router.post('/add', (req, res) => {
    const register = req.body;
    // console.log(register);
    // 查询 sql 防止一个邮箱重复注册
    const sel_sql = `select * from user where email = '${register.email}'`;

    // 添加 sql
    const add_sql = 'insert into user(email, password) values (?, ?)';

    connection.query(sel_sql, (err, results) => {
        if (err) throw err;
        if (results.length !== 0 && register.email === results[0].email) {
            res.json({
                status: '2',
                message: '邮箱已被注册，注册失败！'
            })
        } else {
            connection.query(add_sql, [register.email, register.password], (err, results) => {
                if (err) throw err;
                else {
                    res.send({
                        status: '3',
                        message: '注册成功！'
                    })
                }
            })
        }
    })
})

module.exports = router;