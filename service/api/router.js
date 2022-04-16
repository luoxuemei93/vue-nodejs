const express = require("express");
const router = express.Router();
const token = require("./token.js");
const moment = require("moment");
const async = require("async"); // 异步
const mysql = require("mysql");
var mqMutil = require("mysql-queries");

const options = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "logindb",
};
const connection = mysql.createConnection(options);

connection.connect();
mqMutil.init(options);

// ====================商品模块====================
// 获取商品信息
router.post("/getGoodsList", (req, res) => {
  // 定义查询 sql
  const get_goods = `select * from goods`;
  connection.query(get_goods, (err, results) => {
    if (err) throw err;
    if (!results) {
      res.json({
        status: "-1",
        message: "查询错误",
      });
    } else {
      res.json({
        status: "0",
        message: "查询成功！",
        results,
      });
    }
  });
});

// ====================购物车====================
// 加入购物车
router.post("/addShopCar", (req, res) => {
  const userName = req.headers.username;
  const params = req.body;
  const add_shop_car = `select * from shopcar where goodsId = '${params.goodsId}' and userName='${userName}'`;
  connection.query(add_shop_car, (err, results) => {
    let sql = "";
    if (results.length == 0) {
      // 购物车没有该数据，则新增，否则仅修改购买数量
      sql = `INSERT INTO shopcar(goodsId, goodsName, goodsPrice, goodsUnit, goodsImgUrl, orderNum, userName) 
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
      const newNum = stockNum * 1 + params.orderNum * 1;
      sql = `UPDATE shopcar set orderNum = ${newNum} WHERE goodsId= '${params.goodsId}'`;
    }
    connection.query(sql, (err, results) => {
      if (err) throw err;
      if (!results) {
        res.json({ status: "-1" });
      } else {
        res.json({
          status: "0",
          message: "添加成功！",
          results,
        });
      }
    });
  });
});
// 查询购物车数据
router.post("/getShopCar", (req, res) => {
  const reqBody = req.body;
  const userName = req.headers.username;
  // 定义查询 sql
  const get_shop_car = `select * from shopcar where userName = '${userName}'`;
  connection.query(get_shop_car, (err, results) => {
    if (err) throw err;
    if (!results) {
      res.json({ status: "-1", message: "查询错误" });
    } else {
      res.json({ status: "0", message: "查询成功", results });
    }
  });
});

// 移出购物车
router.post("/removeShopCar", (req, res) => {
  const reqBody = req.body;
  const userName = req.headers.username;
  // 定义查询 sql
  const remove_shop_car = `delete from shopcar where goodsId in (${reqBody.goodsIdStr}) and userName = '${userName}'`;
  connection.query(remove_shop_car, (err, results) => {
    if (err) throw err;
    if (!results) {
      res.json({ status: "-1", message: "删除错误" });
    } else {
      res.json({ status: "0", message: "删除成功", results });
    }
  });
});

// ====================订单管理====================
// 生成订单
router.post("/addOrder", (req, res) => {
  const reqBody = req.body;
  const userName = req.headers.username;
  const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");
  const add_order = `select * from shopcar where goodsId in (${reqBody.goodsIdStr}) and userName = '${userName}'`;
  connection.query(add_order, (err, results) => {
    if (err) throw err;
    if (results[0] === undefined) {
      res.json({ status: "-1", message: "购物车查询不到该产品信息！" });
    } else {
      let addValue = "";
      for (let index in results) {
        const item = results[index];
        let p = `(${reqBody.orderCode},'${item.goodsId}','${item.goodsName}',${item.goodsPrice},'${item.goodsUnit}','${item.goodsImgUrl}',${item.orderNum},'${orderDate}','${userName}')`;
        if (index == 0) {
          addValue = p;
        } else {
          addValue += `,${p}`;
        }
      }
      const add_order = `INSERT INTO goodsorder(orderCode, goodsId, goodsName, goodsPrice, goodsUnit, goodsImgUrl, orderNum, orderDate, userName) values ${addValue}`;
      connection.query(add_order, (err, results) => {
        if (err) throw err;
        if (!results) {
          res.json({ status: "-1" });
        } else {
          res.json({
            status: "0",
            message: "添加成功！",
            results,
          });
        }
      });
    }
  });
});
// 查询详情
const getDetail = (orderCode, callback) => {
  const get_order_detail = `SELECT * FROM goodsorder where orderCode = "${orderCode}"`;
  connection.query(get_order_detail, (cErr, cResults) => {
    return callback(cResults);
  });
};
// 查询订单详情
router.post("/getOrder", (req, res) => {
  const reqBody = req.body;
  let get_order_code = `select orderCode, orderDate, userName from goodsorder group by orderCode limit ${
    (reqBody.pagenum - 1) * reqBody.pagesize
  }, ${reqBody.pagesize} `;
  let get_total = `select count(1) as total from (select orderCode from goodsorder group by orderCode) as tb`;
  if (reqBody.orderCode) {
    get_order_code = `select orderCode, orderDate, userName from goodsorder where orderCode='${
      reqBody.orderCode
    }' group by orderCode limit ${(reqBody.pagenum - 1) * reqBody.pagesize}, ${
      reqBody.pagesize
    } `;
    get_total = `select count(1) as total from (select orderCode from goodsorder where orderCode='${reqBody.orderCode}'  group by orderCode) as tb`;
  }
  mqMutil.queries([get_order_code, get_total], [], function (err, resultMap) {
    if (err) throw err;
    let results = resultMap[0]; // 获取分页查询结果
    const orderTotal = resultMap[1][0].total || 0; // 获取total
    if (results && results.length > 0) {
      let index = 0;
      results.forEach((item) => {
        getDetail(item.orderCode, (cResults) => {
          index++;
          item["children"] = cResults;
          if (index == results.length) {
            res.json({
              status: "0",
              message: "查询成功！",
              total: orderTotal,
              data: {
                total: orderTotal,
                results,
              },
            });
            return false;
          }
        });
      });
    } else if (results && results.length == 0) {
      res.json({
        status: "0",
        message: "查询成功！",
        total: orderTotal,
        data: {
          total: orderTotal,
          results: [],
        },
      });
    } else {
      res.json({
        status: "-1",
        message: "查询错误",
      });
    }
  });
});

// ====================商品分类====================
// 查询商品分类
router.post("/categories", (req, res) => {
  // 定义查询 sql
  const get_goodscat = `SELECT * FROM goodscat ORDER BY orderNum asc`;
  connection.query(get_goodscat, (err, results) => {
    if (err) throw err;
    if (!results) {
      res.json({
        status: "-1",
        message: "查询错误",
      });
    } else {
      res.json({
        status: "0",
        message: "查询成功！",
        results,
      });
    }
  });
});

// 新增分类
router.post("/categoriesAdd", (req, res) => {
  const reqBody = req.body;
  const get_is_catcode = `select count(1) as total from goodscat where catCode = '${reqBody.catCode}'`; // 用于查询商品编码是否已存在
  const add_cat = `INSERT INTO goodscat(catCode, catName, orderNum) values('${reqBody.catCode}','${reqBody.catName}',${reqBody.orderNum});`;
  connection.query(get_is_catcode, (err, results) => {
    if (err) throw err;
    if (results[0].total > 0) {
      res.json({
        status: "-1",
        message: "新增失败，商品编码已存在",
      });
    } else {
      connection.query(add_cat, (err, results) => {
        if (err) throw err;
        if (!results) {
          res.json({
            status: "-1",
            message: "查询错误",
          });
        } else {
          res.json({
            status: "0",
            message: "查询成功！",
            results,
          });
        }
      });
    }
  });
});

// 修改分类categoriesEdit
router.post("/categoriesEdit", (req, res) => {
    const reqBody = req.body;
    // 定义查询 sql
    const edit_cat = `UPDATE goodscat set catName = '${reqBody.catName}', orderNum = ${reqBody.orderNum} where catCode='${reqBody.catCode}'`;
    connection.query(edit_cat, (err, results) => {
      if (err) throw err;
      if (!results) {
        res.json({ status: "-1", message: "删除错误" });
      } else {
        res.json({ status: "0", message: "删除成功", results });
      }
    });
  });



// 删除分类
router.post("/categoriesDelete", (req, res) => {
    const reqBody = req.body;
    // 定义查询 sql
    const delete_cat = `delete from goodscat where catCode = '${reqBody.catCode}'`;
    connection.query(delete_cat, (err, results) => {
      if (err) throw err;
      if (!results) {
        res.json({ status: "-1", message: "删除错误" });
      } else {
        res.json({ status: "0", message: "删除成功", results });
      }
    });
  });

// ====================登录模块====================
// 账号密码登录
router.post("/loginByUserName", (req, res) => {
  const user = req.body;
  // 定义查询 sql
  const sel_user_sql = `select * from login where userName = '${user.userName}' and password ='${user.password}'`;
  connection.query(sel_user_sql, (err, results) => {
    if (err) throw err;
    if (results[0] === undefined) {
      res.json({
        status: "-1",
        message: "用户名错误，用户不存在！",
      });
    } else {
      if (
        results[0].userName === user.userName &&
        results[0].password === user.password
      ) {
        const userToken = token.createToken(user);
        const rspJson = {
          status: "0",
          message: "登陆成功！",
          token: userToken,
          userName: user.userName,
        };
        res.json(rspJson);
      } else {
        res.json({
          status: "1",
          message: "密码错误！",
        });
      }
    }
  });
});

// 注册模块
router.post("/add", (req, res) => {
  const register = req.body;
  // 查询 sql 防止一个邮箱重复注册
  const sel_sql = `select * from user where email = '${register.email}'`;
  // 添加 sql
  const add_sql = "insert into user(email, password) values (?, ?)";
  connection.query(sel_sql, (err, results) => {
    if (err) throw err;
    if (results.length !== 0 && register.email === results[0].email) {
      res.json({
        status: "2",
        message: "邮箱已被注册，注册失败！",
      });
    } else {
      connection.query(
        add_sql,
        [register.email, register.password],
        (err, results) => {
          if (err) throw err;
          else {
            res.send({
              status: "3",
              message: "注册成功！",
            });
          }
        }
      );
    }
  });
});

module.exports = router;
