const http = require("http");
const mysql = require("mysql");
const io = require("socket.io");
const bcrypt = require('bcrypt');
// 连接数据库
var db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Tanwenwei123",
  database: "test_database"
});
// 定义检验信息 --用户名1~16位 --密码3~32位
const userRegexp = /^[a-zA-Z0-9]{1,16}$/;
const passRegexp = /^[a-zA-Z0-9!@#$%^&*()]{3,32}$/;
// 创建 http 服务器
var httpServer = http.createServer();
var port = httpServer.listen(3000);
console.log("创建服务器...端口【" + port._connectionKey.slice(5, 9) + "】");
// 创建 WebSocket 服务器
// 创建数组用于存储连接对象
var clients = [];
var ws = io.listen(httpServer);
// 监听连接
ws.on("connection", sock => {
  // 利用闭包保存当前连接的用户数据
  var cur_avatarurl = ""; //当前用户名的头像url
  var cur_username = ""; // 当前登录的用户名
  var cur_userId = 0; // 当前用户 Id
  var cur_adminUsername = "";
  var cur_adminUserId = 0;

  //重置登录状态
  // db.query(`UPDATE user_table SET online=0`);
  // console.log('登录状态已重置');

  //意见反馈
  sock.on("feedback", feedback_text => {
    db.query(`INSERT INTO feedback_table (feedback, time, reply_state, reply_time) VALUES ("${feedback_text}", "${global.time}" , "0", "1970-01-01 08:00:00")`, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("收到反馈信息: " + feedback_text);
      }
    });
  });

  // 注册处理
  sock.on("register", async (user, pass) => {
    // 验证数据
    console.log("注册信息: " + user);
    if (!userRegexp.test(user)) {
      sock.emit("register_result", 1, "<br/>用户名只支持<br/>1~16位<br/>字母、数字");
    } else if (!passRegexp.test(pass)) {
      sock.emit("register_result", 1, "<br/>密码只支持<br/>3~32位<br/>字母、数字、符号");
    } else {
      try {
        // 插入数据
        // 生成盐并加密密码
        const hashedPassword = await bcrypt.hash(pass, 10); //盐值轮数
        // 将加密后的密码存入数据库
        db.query(
          `INSERT INTO user_table (username, password, online, avatarurl, reg_time) VALUES ("${user}", "${hashedPassword}", 0, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk2QkI4RkE3NjE2MTFFNUE4NEU4RkIxNjQ5MTYyRDgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk2QkI4Rjk3NjE2MTFFNUE4NEU4RkIxNjQ5MTYyRDgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjU2QTEyNzk3NjkyMTFFMzkxODk4RDkwQkY4Q0U0NzYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjU2QTEyN0E3NjkyMTFFMzkxODk4RDkwQkY4Q0U0NzYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5WHowqAAAXNElEQVR42uxda4xd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", "${global.time}")`,
          err => {
            if (err) {
              console.log(err);
              sock.emit("register_result", 1, "<br/>数据库有错误");
            } else {
              sock.emit("register_result", 0, "<br/>注册成功");
              // 更新注册日志
              db.query(
                `INSERT INTO loginfor_table(username, information, time) VALUES ("${user}", "注册成功", "${global.time}")`,
                err => {
                  if (err) {
                    console.log(err);
                    sock.emit("register_result", 1, "<br/>数据库有错误");
                  } else {
                    console.log('日志添加成功—注册用户：【' + user + "】注册时间：【" + global.time + "】");
                  }
                }
              );
            }
          }
        );
      } catch (error) {
        console.log(error);
        sock.emit("register_result", 1, "<br/>加密密码时出错");
      }
    }
  });

  // 登录后处理—获取历史记录—获取表情包url
  sock.on("login", async (user, pass) => {
    console.log("登录信息: " + user);
    // 检验登录信息
    if (!userRegexp.test(user)) {
      sock.emit("login_result", 1, "<br/>用户名只支持<br/>1~16位<br/>字母、数字");
    } else if (!passRegexp.test(pass)) {
      sock.emit("login_result", 1, "<br/>密码只支持<br/>3~32位<br/>字母、数字、符号");
    } else {
      // 登录操作
      db.query(
        `SELECT ID, password, online FROM user_table WHERE binary username="${user}"`,
        async (err, data) => {
          // 判断是否出错
          if (err) {
            console.log(err);
            sock.emit("login_result", 1, "<br/>数据库出错");
          } else if (data.length === 0) {
            sock.emit("login_result", 1, "<br/>用户不存在");
          } else {
            const storedPassword = data[0].password;
            // 使用 bcrypt.compare 方法比较用户输入的明文密码和数据库中存储的加密密码是否匹配
            bcrypt.compare(pass, storedPassword, async (err, result) => {
              if (err || !result) {
                sock.emit("login_result", 1, "<br/>用户名或密码有误");
              } else if (data[0].online !== 0) {
                sock.emit("login_result", 1, "<br/>用户已被登录");
              } else {
                // 修改在线状态
                db.query(
                  `UPDATE user_table SET online=1 WHERE ID="${data[0].ID}"`,
                  async (err) => {
                    if (err) {
                      console.log(err);
                      sock.emit("login_result", 1, "<br/>数据库出错");
                    } else {
                      sock.emit("login_result", 0, "<br/>登录成功");
                      //更新上线日志
                      db.query(`INSERT INTO loginfor_table(username, information, time) VALUES ("${user}", "上线", "${global.time}")`, err => {
                        if (err) {
                          console.log(err);
                          sock.emit("register_result", 1, "数据库有错误");
                        } else {
                          console.log('日志添加成功—用户上线：【' + cur_username + "】上线时间：【" + global.time + "】");
                        }
                      });
                      // 获取登录用户的头像
                      db.query(`SELECT * FROM user_table WHERE username='${user}'`, (err, data) => {
                        if (err) {
                          console.log(err);
                        } else {
                          var res = JSON.parse(JSON.stringify(data));
                          if (user === res[0].username) {
                            cur_avatarurl = res[0].avatarurl;
                            setTimeout(function () {
                              sock.emit("obtain_avatarurl", cur_avatarurl);
                            }, 500);
                          };
                        };
                      });
                      cur_username = user;
                      cur_userId = data[0].ID;
                      // 获取表情包url
                      setTimeout(function () {
                        db.query(`SELECT * FROM emoji_table`, (err, data) => {
                          if (err) {
                            console.log(err);
                          } else {
                            var emoji = JSON.parse(JSON.stringify(data));
                            for (var i = 0; i < emoji.length; i++) {
                              sock.emit("emoji_url", emoji[i].emoji_url);
                            }
                          }
                        });
                      }, 500);
                      clients.push(sock);
                      // 历史记录查询
                      // 获取历史记录
                      // 显示所有历史记录 SELECT * FROM (SELECT * FROM message_table union SELECT * FROM uploadimg_table) AS message_history ORDER BY time ASC
                      // 优化显示所有历史记录 SELECT * FROM message_table union SELECT * FROM uploadimg_table ORDER BY time ASC;
                      // 显示前50条的历史记录 SELECT * FROM (SELECT * FROM message_table union SELECT * FROM uploadimg_table ORDER BY time DESC LIMIT 50) AS message_history ORDER BY time ASC;
                      db.query(`SELECT * FROM (SELECT * FROM message_table union SELECT * FROM uploadimg_table ORDER BY time DESC LIMIT 100) AS message_history ORDER BY time ASC;`, (err, data) => {
                        var res = JSON.parse(JSON.stringify(data));
                        if (err) {
                          console.log(err);
                          // sock.emit("msg_result", 1, "数据库出错");
                        } else {
                          // 广播
                          // 获取所有用户的历史记录的头像url 
                          setTimeout(() => {
                            db.query(`SELECT * FROM user_table`, (err, data) => {
                              if (err) {
                                console.log(err);
                              } else {
                                global.res_avatarurl = JSON.parse(JSON.stringify(data));
                                for (var i = 0; i < res.length; i++) {
                                  for (var n = 0; n < global.res_avatarurl.length; n++) {
                                    if (res[i].username === global.res_avatarurl[n].username) {
                                      avatarurl = global.res_avatarurl[n].avatarurl
                                      sock.emit("msg_history", res[i].username, res[i].time, res[i].message, avatarurl);
                                    }
                                  }
                                }
                              }
                            });
                            // 向群内发送用户状态
                            setTimeout(function () {
                              sock.emit("informationPromptOnline", cur_username);
                              clients.forEach(client => {
                                if (client === sock) return;
                                client.emit("informationPromptOnline", cur_username);
                              });
                            }, 2000);
                          }, 100);
                        }
                      });
                    }
                  }
                );
              }
            });
          }
        }
      );
    }
  });
  // //加载历史记录
  sock.on(`startReHi`, () => {
    db.query(`SELECT * FROM (SELECT * FROM message_table union SELECT * FROM uploadimg_table ORDER BY time DESC LIMIT 100) AS message_history ORDER BY time ASC;`, (err, data) => {
      var res = JSON.parse(JSON.stringify(data));
      if (err) {
        console.log(err);
        // sock.emit("msg_result", 1, "数据库出错");
      } else {
        // 广播
        // 获取所有用户的历史记录的头像url 
        setTimeout(() => {
          db.query(`SELECT * FROM user_table`, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              global.res_avatarurl = JSON.parse(JSON.stringify(data));
              for (var i = 0; i < res.length; i++) {
                for (var n = 0; n < global.res_avatarurl.length; n++) {
                  if (res[i].username === global.res_avatarurl[n].username) {
                    avatarurl = global.res_avatarurl[n].avatarurl
                    // console.log(avatarurl);
                    sock.emit("msg_history", res[i].username, res[i].time, res[i].message, avatarurl);
                  }
                }
              }
            }
          });
        }, 100);
      }
    });
  })



  // 时间戳
  clearInterval(updateTime);
  var updateTime = setInterval(() => {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() < 10 ? '0' + Number(new Date().getMonth() + 1) : Number(new Date().getMonth() + 1);
    var date = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate();
    var hours = new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours();
    var minutes = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes();
    var seconds = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds();
    global.time = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
  }, 1000);


  //发送消息
  sock.on("msg_send", (context) => {
    if (!context) {
      sock.emit("msg_result", 1, "消息文本不能为空");
    } else {
      // 检查是否带用户名
      db.query(
        `SELECT ID FROM user_table WHERE username="${cur_username}"`,
        (err, data) => {
          // 判断是否出错
          if (err) {
            console.log(err)
            sock.emit("login_result", 1, "<br/>数据库出错");
          } else if (data.length === 0) {
            sock.emit("login_result", 1, "<br/>请重新登录");
          } else {
            // 广播
            clients.forEach(client => {
              // 当前用户不用发送消息
              if (client === sock) return;
              client.emit("msg", cur_username, time, context, cur_avatarurl);
            });
            sock.emit("msg_result", 0, "发送成功", cur_avatarurl);
            db.query(
              `INSERT INTO message_table(username,message,time) VALUES ('${cur_username}', '${context}', '${time}')`,
              (err) => {
                if (err) {
                  console.log(err)
                  sock.emit("login_result", 1, "数据库出错");
                } else {
                  console.log("由用户【" + cur_username + "】发出的信息：【" + context + "】已保存/时间：【" + time + "】");
                }
              });
          }
        }
      );
    }
  });

  // sock.on("emoji_save",()=>{

  // })

  //发送表情
  sock.on("emoji_send", emoji => {
    // 检查是否带用户名
    db.query(
      `SELECT ID FROM user_table WHERE username="${cur_username}"`,
      (err, data) => {
        // 判断是否出错
        if (err) {
          console.log(err)
          sock.emit("login_result", 1, "数据库出错");
        } else if (data.length === 0) {
          sock.emit("login_result", 1, "<br/>请重新登录");
        } else {
          // 广播
          clients.forEach(client => {
            // 当前用户不用发送消息
            if (client === sock) return;
            client.emit("emoji", cur_username, time, emoji, cur_avatarurl);
          });
          sock.emit("emoji_result", 0, "发送成功", cur_avatarurl, emoji);
          db.query(
            `INSERT INTO message_table(username,message,time) VALUES ('${cur_username}', '${emoji}', '${time}')`,
            (err) => {
              if (err) {
                console.log(err)
                sock.emit("login_result", 1, "数据库出错");
              } else {
                console.log("由用户【" + cur_username + "】发出的表情包：【" + emoji + "】已保存/时间：【" + time + "】");
              }
            });
        }
      }
    );
  });

  //发送图片
  sock.on("file_send", file => {
    // 检查是否带用户名
    db.query(
      `SELECT ID FROM user_table WHERE username="${cur_username}"`,
      (err, data) => {
        // 判断是否出错
        if (err) {
          console.log(err)
          sock.emit("login_result", 1, "数据库出错");
        } else if (data.length === 0) {
          sock.emit("login_result", 1, "<br/>请重新登录");
        } else {
          // 广播
          clients.forEach(client => {
            // 当前用户不用发送消息
            if (client === sock) return;
            client.emit("file", cur_username, time, file, cur_avatarurl);
          });
          sock.emit("file_result", 0, "发送成功", cur_avatarurl, file);
          db.query(
            `INSERT INTO uploadimg_table (username, uploadimg, time) VALUES ("${cur_username}", "${file}", "${time}")`,
            (err) => {
              if (err) {
                console.log(err);
                sock.emit("login_result", 1, "数据库出错");
              } else {
                console.log("由用户【" + cur_username + "】发出了一张图片，已保存/时间：【" + time + "】");
              }
            });
        }
      }
    );
  });

  //上传头像
  sock.on("avatar_change", avatar => {
    db.query(`UPDATE user_table SET avatarurl="${avatar}" WHERE username="${cur_username}"`, (err) => {
      if (err) {
        console.log(err);
        sock.emit("avatar_result", 1, "数据库出错");
      } else {
        console.log("用户：" + cur_username + "【修改头像】");
        sock.emit("avatar_result", 1, "头像修改成功");
        sock.emit("obtain_avatarurl", avatar);
        cur_avatarurl = avatar;
      }
    })
  })

  //离线处理
  sock.on("disconnect", function () {
    // 修改在线状态
    // 判断是否已经登录,如果已经登录则更新用户状态
    if (cur_username !== "") {
      db.query(`UPDATE user_table SET online=0 WHERE ID=${cur_userId}`, err => {
        if (err) {
          console.log(err);
          console.log("数据库出错");
        };
        // 向群内发送用户状态
        if (cur_username != '') {
          setTimeout(function () {
            sock.emit("informationPromptOffline", cur_username);
            clients.forEach(client => {
              if (client === sock) return;
              client.emit("informationPromptOffline", cur_username);
            });
            //更新下线日志
            db.query(`INSERT INTO loginfor_table(username, information, time) VALUES ("${cur_username}", "下线", "${global.time}")`, err => {
              if (err) {
                console.log(err);
                sock.emit("register_result", 1, "数据库有错误");
              } else {
                console.log('日志添加成功—用户离开：【' + cur_username + "】离开时间：【" + global.time + "】");
              }
            });
          }, 100);
        };
        // 更新状态
        // cur_username = "";
        cur_avatarurl = '';
        cur_userId = 0;
        clients = clients.filter(item => item !== sock);
      });
    }
  });

  //后台系统数据库增删改查——用户——查询
  //XXXXXXsock不能用于方法
  // db.query(`SELECT * FROM user_table`, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     // var res = JSON.parse(JSON.stringify(data));
  //     for (var i = 0; i < data.length; i++) {
  //       // console.log(data[i].id, data[i].username, data[i].password, data[i].online, data[i].avatarurl, data[i].reg_time);
  //       sock.emit("data_query_user_table", data[i].id, data[i].username, data[i].password, data[i].online, data[i].avatarurl, data[i].reg_time);
  //     }

  //   }
  // });

  /*后台系统登录*/
  sock.on("admin_login", (adminUser, adminPass) => {
    console.log("管理员登录信息：" + adminUser);
    //检验管理员登录信息
    if (!userRegexp.test(adminUser)) {
      sock.emit("admin_login_result", 1, "<br/>用户名不符合规范");
    } else if (!userRegexp.test(adminPass)) {

    } else {
      //管理员登录操作
      db.query(`SELECT ID, admin_pass, admin_online FROM admin_table WHERE binary admin_user="${adminUser}"`, (err, data) => {
        if (err) {
          console.log(err);
          sock.emit("admin_login_result", 1, "<br/>数据库出错");
        } else if (data.length === 0) {
          sock.emit("admin_login_result", 1, "<br/>用户不存在");
        } else if (data[0].admin_pass !== adminPass) {
          sock.emit("admin_login_result", 1, "<br/>用户名或密码有误");
        } else {
          sock.emit("admin_login_result", 0, "<br/>登录成功");
          db.query(`UPDATE admin_table SET admin_online=1 WHERE admin_user="${adminUser}"`);
          //登录成功提示
          console.log('管理员用户登录：【' + adminUser + "】登录时间：【" + global.time + "】");
          cur_adminUsername = adminUser;
          cur_adminUserId = data[0].ID;
        }
      });
    }
  });

  //管理员离线处理
  sock.on("disconnect", function () {
    // 修改在线状态
    // 判断是否已经登录,如果已经登录则更新用户状态
    if (cur_adminUsername !== "") {
      db.query(`UPDATE admin_table SET admin_online=0 WHERE ID=${cur_adminUserId}`, err => {
        if (err) {
          console.log(err);
          console.log("数据库出错");
        } else {
          console.log('管理员离开：【' + cur_adminUsername + "】离开时间：【" + global.time + "】");
          // 更新状态
          cur_adminUsername = '';
          cur_adminUserId = 0;
        };
      });
    }
  });
});


// ————————————————————————————————————————————————————————————————————



const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./router/router');

app.use(bodyParser.json());  //配置解析，用于解析json和urlencoded格式的数据
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors()); //配置跨域，必须在路由之前
app.use(router); //配置路由

// 创建express服务器
var expressPort = app.listen(3001, () => {
  console.log("创建服务器...端口【" + expressPort._connectionKey.slice(5, 9) + "】");
});