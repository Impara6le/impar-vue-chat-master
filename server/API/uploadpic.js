const mysql = require('mysql')
// 连接数据库
var db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Tanwenwei123",
    database: "test_database"
});

exports.all = (req, res) => {        //获取uploadimg_table表全部数据
    // var sql = 'SELECT * FROM uploadimg_table union SELECT * FROM uploadimg_table ORDER BY time ASC'
    var sql = 'SELECT * FROM uploadimg_table ORDER BY time DESC'

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
    var sql = "select * from uploadimg_table where binary username like '%" + req.query.username + "%' ORDER BY time DESC"
    db.query(sql, (err, data) => {
        if (err) {
            return res.send('错误：' + err.message)
        }
        res.send(data);
    })
}

exports.del = (req, res) => {        //通过id删除数据
    var sql = 'delete from uploadimg_table where id = ?'
    db.query(sql, [req.query.id], (err, data) => {
        if (err) {
            return res.send('错误：' + err.message)
        }
        if (data.affectedRows > 0) {
            res.send({
                status: 200,
                message: '删除成功'
            })
        } else {
            res.send({
                status: 202,
                message: '删除失败'
            })
        }
    })
}

