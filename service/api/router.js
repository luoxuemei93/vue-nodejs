const express = require('express');
const router = express.Router();
const token = require('./token.js');
const moment = require('moment');

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
    // 定义查询 sql
    const get_goods =  `select * from goods`;
    connection.query(get_goods, (err, results) => {
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
// 加入购物车
router.post('/addShopCar', (req, res) => {
    const userName = req.headers.username
    const params = req.body;
    const add_shop_car = `select * from shopcar where goodsId = '${params.goodsId}' and userName='${userName}'`;
    connection.query(add_shop_car, (err, results) => {
        let sql = "";
        if(results.length == 0) {   // 购物车没有该数据，则新增，否则仅修改购买数量
            sql =  `INSERT INTO shopcar(goodsId, goodsName, goodsPrice, goodsUnit, goodsImgUrl, orderNum, userName) 
            values(
                '${params.goodsId}',
                '${params.goodsName}',
                ${params.goodsPrice},
                '${params.goodsUnit}',
                '${params.goodsImgUrl}',
                ${params.orderNum},
                '${userName}'
            );`;
        } else {
            const stockNum = results[0].orderNum; // 库存数据 
            const newNum = stockNum * 1 + params.orderNum * 1
            sql = `UPDATE shopcar set orderNum = ${newNum} WHERE goodsId= '${params.goodsId}'`
        }
        connection.query(sql, (err, results) => {
            if (err) throw err;
            if (!results) {
                res.json({status: '-1'})
            } else {
                res.json({
                    status: '0',
                    message: '添加成功！',
                    results
                })
            }
        })
    })
})
// 查询购物车数据
router.post('/getShopCar', (req, res) => {
    const reqBody = req.body;
    const userName = req.headers.username
    // 定义查询 sql
    const get_shop_car =  `select * from shopcar where userName = '${userName}'`;
    connection.query(get_shop_car, (err, results) => {
        if (err) throw err;
        if (!results) {
            res.json({status: '-1', message: '查询错误'})
        } else {
            res.json({status: '0',message: '查询成功',results})
        }
    })
})
// 移出购物车
router.post('/removeShopCar', (req, res) => {
    const reqBody = req.body;
    const userName = req.headers.username
    // 定义查询 sql
    const remove_shop_car =  `delete from shopcar where goodsId in (${reqBody.goodsIdStr}) and userName = '${userName}'`;
    connection.query(remove_shop_car, (err, results) => {
        if (err) throw err;
        if (!results) {
            res.json({status: '-1', message: '查询错误'})
        } else {
            res.json({status: '0',message: '查询成功',results})
        }
    })
})
// 生成订单
router.post('/addOrder', (req, res) => {
    const reqBody = req.body;
    const userName = req.headers.username
    const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`orderDate='${orderDate}'`);
    const add_order =  `select * from shopcar where goodsId in (${reqBody.goodsIdStr}) and userName = '${userName}'`;
    connection.query(add_order, (err, results) => {
        if (err) throw err;
        if (results[0] === undefined) {
            res.json({status: '-1',message: '购物车查询不到该产品信息！'})
        } else {
            let addValue = "";
            for(let index in results) {
                const item = results[index];
                let p = `(${reqBody.orderCode},'${item.goodsId}','${item.goodsName}',${item.goodsPrice},'${item.goodsUnit}','${item.goodsImgUrl}',${item.orderNum},'${orderDate}','${userName}')`
                if(index == 0) {
                    addValue = p;
                } else {
                    addValue+=`,${p}`;
                }
            }
            const add_order = `INSERT INTO goodsorder(orderCode, goodsId, goodsName, goodsPrice, goodsUnit, goodsImgUrl, orderNum, orderDate, userName) values ${addValue}`;
            connection.query(add_order, (err, results) => {
                if (err) throw err;
                if (!results) {
                    res.json({status: '-1'})
                } else {
                    res.json({
                        status: '0',
                        message: '添加成功！',
                        results
                    })
                }
            })
        }
    })
})
// 账号密码登录
router.post('/loginByUserName', (req, res) => {
    const user = req.body;
    // 定义查询 sql
    const sel_user_sql =  `select * from login where userName = '${user.userName}' and password ='${user.password}'`;
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
                const rspJson = {
                    status: '0',
                    message: '登陆成功！',
                    token: userToken,
                    userName: user.userName
                }
                res.json(rspJson)
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