var fs = require("fs");

module.exports = {
  readImg: function (path, res) {
    fs.readFile(path, "binary", function (err, file) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("输出图片");
        res.write(file, "binary");
        res.end();
      }
    });
  },
};
