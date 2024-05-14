const mysql = require('mysql')
// 连接数据库
var db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Tanwenwei123",
    database: "test_database"
});

exports.all = (req, res) => {        //获取loginfor_table表全部数据
    var sql = 'SELECT * FROM loginfor_table ORDER BY time DESC'

    db.query(sql, (err, data) => {
        if (err) {
            return res.send('错误：' + err.message)
        }
        // console.log(sql);
        // console.log(data);
        res.send(data);
    })
}

exports.get = (req, res) => {        //通过用户名和消息内容查询数据
    var sql = "select * from loginfor_table where binary username like '%" + req.query.username + "%' AND information like'%" + req.query.information + "%' ORDER BY time DESC"
    db.query(sql, [req.query.username, req.query.information], (err, data) => {
        if (err) {
            return res.send('错误：' + err.message)
        }
        res.send(data);
    })
}
