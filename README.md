# vue3+nodejs

#### 介绍

使用vue3+nodejs实现一个简单的登录注册

#### 安装教程

当前目录（login）终端下输入 npm i 下载 nodejs 相关依赖，
进入 login-vue 文件夹，开启终端输入 npm i 下载 vue 相关依赖

#### 使用说明

1.  进入 service 文件夹下开启终端，输入 node index.js 启动 nodejs 服务（如果您之前下载过nodemon 可以使用nodemon index.js启动服务）
2.  进入 login-vue 文件夹下开启终端，输入 npm run serve 启动项目

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


# 数据库信息创建
数据库：代码拉下来后 启动mysql,创建名字是login的数据库和名字是user的表，三个字段 id email password. 修改router.js中链接数据库的配置。 然后用命令启动服务 ok

# 数据库执行语句
 # 创建数据库
 create DATABASE logindb
 # 创建数据库
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;
INSERT INTO `user` VALUES ('1', '11111@qq.com', '111111');
