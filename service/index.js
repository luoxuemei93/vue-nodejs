const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./api/router.js');
const token = require('./api/token.js');

// 解析 application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// 解析 application/json
app.use(express.json());

app.use(cors());

// 白名单 （免登录）
const whiteList = ['/api/user/login', '/api/user/add'];

app.use((req, res, next) => {
    if (!whiteList.includes(req.url)) {
        token.verifyToken(req.headers.Authorization).then(res => {
            next();
        }).catch(err => res.status(401).send('invalid token'))
    } else {
        next();
    }
})

app.use('/api/user', router);

app.listen(3000, () => {
    console.log('server running at http://127.0.0.1:3000');
})