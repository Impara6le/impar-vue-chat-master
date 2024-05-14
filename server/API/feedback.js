const mysql = require('mysql')
// 连接数据库
var db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Tanwenwei123",
    database: "test_database"
});

var month = new Date().getMonth() + 1;

// 设置每秒调用一次时间
clearInterval(updateTime);
var updateTime = setInterval(() => {
    global.time = new Date().getFullYear() + '-' + month + '-' + new Date().getDate() + ' ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
    // console.log(time);
}, 1000);  //每秒更新一次时间

exports.all = (req, res) => {        //获取feedback_table表全部数据
    var sql = 'SELECT * FROM feedback_table ORDER BY time DESC'

    db.query(sql, (err, data) => {
        if (err) {
            return res.send('错误：' + err.message)
        }
        // console.log(sql);
        // console.log(data);
        res.send(data);
    })
}

exports.get = (req, res) => {
    let sql = "SELECT * FROM feedback_table WHERE 1=1";
    let params = [];

    if (req.query.feedback) {
        sql += " AND feedback LIKE ?";
        params.push('%' + req.query.feedback + '%');
    }

    if (req.query.reply_admin) {
        sql += " AND reply_admin LIKE ?";
        params.push('%' + req.query.reply_admin + '%');
    }

    if (req.query.reply_state) {
        sql += " AND reply_state = ?";
        params.push(req.query.reply_state);
    }

    sql += " ORDER BY time DESC";

    db.query(sql, params, (err, data) => {
        if (err) {
            return res.send('错误：' + err.message);
        }
        res.send(data);
    });
}

exports.toreply = (req, res) => {        //向反馈回复信息
    var sql = "update feedback_table set reply = ? , reply_admin = ? , reply_time = NOW() , reply_state = '1' where id = ?"
    db.query(sql, [req.query.reply, req.query.reply_admin, req.query.id], (err, data) => {
        if (err) {
            return res.send('错误：' + err.message);
        }

        if (data.affectedRows > 0) {
            res.send({
                status: 200,
                message: 'success'
            })
        } else {
            res.send({
                status: 202,
                message: 'error'
            })
        }
    })
}

exports.delreply = (req, res) => {        //删除反馈回复信息
    var sql = "update feedback_table set reply = NULL , reply_admin = NULL , reply_time = '1970-01-01 08:00:00' , reply_state = '0' where id = ?"
    db.query(sql, [req.query.id], (err, data) => {
        if (err) {
            console.log(err.message);
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