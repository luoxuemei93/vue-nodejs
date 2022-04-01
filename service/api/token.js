const jwt = require('jsonwebtoken');

// 签名
const secret = '113Bmongojsdalkfnxcvmas';

// 生成 Token
function createToken(info) {
    let token = jwt.sign(info, secret, { expiresIn: '10s' })
    return token;
}
// 验证 Token 
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    })
}

module.exports = {
    createToken,
    verifyToken
}