<template>
  <div class="home" v-title data-title="随意聊-即时聊天系统">
    <div class="loading">
      <img src="../assets/tx1.jpg" alt="">
      <div class="loading-content">
        <p>加载中...</p>
      </div>
    </div>
    <x-header :left-options="{ backText: '退出', preventGoBack: true }" title="Imparable的私人聊天室"
      @on-click-back="$router.go('/login')" />
    <div class="home-body" ref="chatRoom">

      <div @click="ReproduceHistorical()">
        <XButton v-show="historical_display">加载历史消息</XButton>
      </div>
      <!-- 信息发送框 -->
      <div v-for="(message, index) of messages" :key="index" :class="{ active: message.isActive }" class="home-body-item">
        <img class="home-body-avator" :src="message.avatarurl" />
        <div class="home-body-content">
          <span class="messagetime">{{ message.messagetime }}</span>
          <span class="username">{{ message.username }}</span>
          <span class="content"><img v-image-preview :width="message.emoji_width" :src="message.emoji" />{{
            message.context }}</span>
        </div>
      </div>
    </div>
    <div class="home-bottom">
      <!-- 表情弹窗 -->
      <div class="emoji_menu" v-show="emoji_active" v-for="(emojisave, emoji_url) of emojisaves" :key="emoji_url">
        <div>
          <td class="emoji"><button @click="clickimg(emojisave.emoji);"><img :src="emojisave.emoji" /></button></td>
        </div>
      </div>
      <!-- 横向菜单栏 -->
      <div class="menu_bottom">
        <button @click="emoji_active = !emoji_active"><img src="../assets/icon/emoji_icon.png"></button>
        <button @click="imgClick()"><img src="../assets/icon/uploadimg_icon.png"></button>
        <input @change="update" class="file" type="file" name="file" id="file"
          accept="image/png,image/gif,image/jpeg,image/jpg,image/webp" style="display: none;" />
        <button @click="userinformation = !userinformation"><img src="../assets/icon/information_icon.png"></button>
      </div>
      <!-- 发送栏 -->
      <div class="home-bottom-container">
        <x-input :show-clear="false" required placeholder="请输入发送消息" v-model="context" v-enter="handleSend"
          ref="inputFocus"></x-input>
        <x-button type="primary" mini @click.native="handleSend">发送</x-button>
      </div>
    </div>
    <!-- 个人信息修改窗口 -->
    <div class="user_information" v-show="userinformation" v-for="(useravatar, useravatar_url) of useravatars"
      :key="useravatar_url">
      <div class="user_information_display">
        <div class="user_information_swindows">
          <div style="display: inline-block;">
            <p style="padding: 10px 15px;">头像：</p>
          </div>
          <div style="display: inline-block;vertical-align: middle;">
            <img style="padding: 10px 15px;" :src="useravatar.useravatarurl" width="100">
          </div>
          <div style="display: inline-block;">
            <button @click="avatarClick()" style="padding:0.6rem;font-size: 15px;">修改头像</button>
            <input @change="updateavatar" class="avatarfile" type="file" name="avatarfile" id="avatarfile"
              accept="image/png,image/gif,image/jpeg,image/jpg,image/webp" style="display: none;" />
          </div>
        </div>
        <!-- <x-input class="user_information_swindows" :show-clear="false" title="用户名：" v-model="username"
          placeholder="请输入新用户名" :max="16"></x-input> -->
        <!-- <x-input :show-clear="false" title="新密码：" type="password" placeholder="请输入新密码" :max="32"></x-input> -->
        <div class="user_information_button">
          <x-button @click.native="informationChange()">修改</x-button>
          <x-button @click.native="userinformation = !userinformation">取消</x-button>
        </div>
      </div>
    </div>

    <toast v-model="showToast" type="text" :time="1000" :text="errMsg" position="middle"></toast>
  </div>
</template>

<script>
import { XHeader, XInput, XButton, Toast } from "vux";


export default {
  name: "index",
  components: {
    XHeader,
    XInput,
    XButton,
    Toast,
  },
  data() {
    return {
      context: "", // 记录发送的消息内容
      showToast: false, // 是否显示 toast
      errMsg: "", // 出错提示信息
      messages: [], // 储存消息内容
      username: '', // 保存当前登录的用户名
      useravatarurl: '',// 保存当前登录的用户名的头像
      useravatars: [], //储存登录的用户名的头像信息
      messagetime: '', //记录发送的时间
      informationPrompt: '', //上下线提示信息
      avatarurl: '', //头像URL
      emojisave: '', //emoji表情url
      userinformation: false,  //个人信息修改窗口
      historical_display: true, //加载历史消息窗口显示
      emoji_active: false, //表情窗口显示
      emoji_width: '', //当发送表情，显示表情的宽度
      emojisaves: [], //储存表情信息
      uploadimg: '', //上传的图片
      uploadfiles: [] //储存上传的图片信息
    };
  },
  updated() {
    if (this.username) {
      // 只有在获取到了 username 参数后才执行 scroll 相关的操作
      this.scrollToBottom();
    }
  },
  mounted() {
    if (this.username) {
      // 只有在获取到了 username 参数后才执行 scroll 相关的操作
      this.scrollToBottom();
    }
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


    // 接收路由传递过来的参数，判断是否登录
    this.username = this.$route.params.username;
    if (this.username === undefined) {
      // 如果当前没有登录，则跳转到登录界面(不能改)
      this.$router.push('/login');
    }
    /* eslint-disable */
    socket.on("msg_result", (code, msg, avatarurl) => {
      if (code) {
        this.errMsg = "消息发送失败: <br/>" + msg;
        this.showToast = true;
      } else {
        // 发送消息成功处理
        var data = {
          context: this.context,
          username: this.username,
          messagetime: time,
          avatarurl: avatarurl,
          isActive: true
        };
        this.messages.push(data);
        this.context = '';
        this.messagetime = '';
        // console.log(time);
      }
    });

    //表情包发送
    socket.on("emoji_result", (code, msg, avatarurl, emoji) => {
      if (code) {
        this.errMsg = "消息发送失败: <br/>" + msg;
        this.showToast = true;
      } else {
        // 表情包发送成功处理
        var data = {
          emoji: emoji,
          username: this.username,
          messagetime: time,
          avatarurl: avatarurl,
          isActive: true,
          emoji_width: '150px'
        };
        this.messages.push(data);
        this.context = '';
        this.messagetime = '';
        // console.log(time);
      }
    });

    // 历史记录
    socket.on("msg_history", (name, time, context, avatarurl) => {

      var time_date = time.slice(0, 10);
      // 读取时间比本地时间少8小时
      var time_hours = time.slice(11, 14);
      time_hours = parseInt(time_hours) + 8;
      if (time_hours === 24) {
        time_hours = 0 + '0';
      }
      var time_time = time.slice(13, 19);

      // 包含/img/、data:image的切成图片
      if (context.includes("/img/") || context.includes("data:image")) {
        var data = {
          username: name,
          messagetime: time_date + "  " + time_hours + time_time,
          emoji: context,
          avatarurl: avatarurl,
          isActive: false,
          emoji_width: '150px'
        };
        if (this.username === name) {
          var data = {
            username: name,
            messagetime: time_date + "  " + time_hours + time_time,
            emoji: context,
            avatarurl: avatarurl,
            isActive: true,
            emoji_width: '150px'
          }
        }
        this.messages.push(data);
      } else {
        var data = {
          username: name,
          messagetime: time_date + "  " + time_hours + time_time,
          context: context,
          avatarurl: avatarurl,
          isActive: false
        };
        if (this.username === name) {
          var data = {
            username: name,
            messagetime: time_date + "  " + time_hours + time_time,
            context: context,
            avatarurl: avatarurl,
            isActive: true
          }
        }
        this.messages.push(data);
      };



      // this.context = '';
      // this.messagetime = '';
    });

    // 向群内发送用户状态
    socket.on("informationPromptOnline", (name) => {
      var data = {
        context: "提示信息：" + name + "加入了聊天室",
        messagetime: global.time,
        avatarurl: require('../assets/warn.png')
      };
      this.messages.push(data);
    });
    // 向群内发送用户状态
    socket.on("informationPromptOffline", (name) => {
      var data = {
        context: "提示信息：" + name + "离开了聊天室",
        messagetime: global.time,
        avatarurl: require('../assets/warn.png')
      };
      this.messages.push(data);
    });

    // 接收发过来的消息
    /* eslint-disable */
    socket.on("msg", (name, time, context, avatarurl) => {
      var data = {
        username: name,
        messagetime: time,
        context: context,
        avatarurl: avatarurl,
        isActive: false
      };
      this.messages.push(data);
    });

    // 接收发过来的表情
    /* eslint-disable */
    socket.on("emoji", (name, time, emoji, avatarurl) => {
      var data = {
        username: name,
        messagetime: time,
        emoji: emoji,
        avatarurl: avatarurl,
        isActive: false,
        emoji_width: '150px'
      };
      this.messages.push(data);
    });

    //接受发过来的图片
    socket.on("file", (name, time, file, avatarurl) => {
      var data = {
        username: name,
        messagetime: time,
        emoji: file,
        avatarurl: avatarurl,
        isActive: false,
        emoji_width: '150px'
      };
      this.messages.push(data);
    });

    //图片发成功后自己得到的信息
    socket.on("file_result", (code, msg, avatarurl, file) => {
      if (code) {
        this.errMsg = "消息发送失败: <br/>" + msg;
        this.showToast = true;
      } else {
        // 图片发送成功处理
        var data = {
          emoji: file,
          username: this.username,
          messagetime: time,
          avatarurl: avatarurl,
          isActive: true,
          emoji_width: '150px'
        };
        this.messages.push(data);
        this.context = '';
        this.messagetime = '';
        // console.log(time);
      }
    });

    socket.on("login_result", (code, msg) => {
      if (code) {
        this.errMsg = "您未登录！" + msg;
        this.showToast = true;
        setTimeout(() => {
          this.$router.go('/login');
          location.reload();
        }, 1000); // 在1秒后执行
      }
    });

    socket.on("avatar_result", (code, msg) => {
      if (code) {
        this.errMsg = "注意：" + msg;
        this.showToast = true;
      }
    });
    //用户头像获取
    socket.on("obtain_avatarurl", useravatarurl => {
      var data = {
        useravatarurl: useravatarurl,
      }
      this.useravatars.push(data);
    });

    //表情url获取
    socket.on("emoji_url", emoji_url => {
      // //上传表情包
      // var file = e.target.files[0];
      // var reads = new FileReader();
      // // console.log(file.size); //Byte ——  不允许超过 1000000 Byte
      // if (file.size > 1000000) {
      //   this.errMsg = "图片太大了<br/>不能超过1MB";
      //   this.showToast = true;
      // } else {
      //   var f = document.getElementById('file').files[0];
      //   reads.readAsDataURL(f);
      //   reads.onload = function (e) {
      //     if (this.result.includes("data:image")) {
      //       socket.emit("emoji_save", this.result); //base64
      //       // document.getElementById('show').src = this.result;
      //     } else {
      //       console.log("只能上传图片！");
      //     }
      //   }
      // };
      if (emoji_url.includes("data:image")) {
        var data = {
          emoji: emoji_url,
        };
        // var data = JSON.parse(JSON.stringify(data));
        this.emojisaves.push(data);
      } else {
        var data = {
          emoji: require('../assets/emoji/' + emoji_url),
        };
        // var data = JSON.parse(JSON.stringify(data));
        this.emojisaves.push(data);
      }

    });
  },


  // 回车键输出信息
  directives: {
    enter: {
      bind(el, binding) {
        el.addEventListener('keyup', (event) => {
          if (event.keyCode === 13) {
            binding.value();
          }
        });
      },
    },
  },
  methods: {
    imgClick() {
      document.getElementById("file").click();
    },
    avatarClick() {
      document.getElementById("avatarfile").click();
      this.userinformation = false;
    },
    update(e) {

      // var param = new FormData(); //创建form对象
      // param.append('file', file);//通过append向form对象添加数据
      // console.log(param.get('file')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去


      //发送图片
      var file = e.target.files[0];
      var reads = new FileReader();
      // console.log(file.size); //Byte ——  不允许超过 1000000 Byte
      if (file.size > 1000000) {
        this.errMsg = "图片太大了<br/>不能超过1MB";
        this.showToast = true;
      } else {
        var f = document.getElementById('file').files[0];
        reads.readAsDataURL(f);
        reads.onload = function (e) {
          if (this.result.includes("data:image")) {
            socket.emit("file_send", this.result); //base64
            // document.getElementById('show').src = this.result;
          } else {
            console.log("只能上传图片！");
          }
        }
      };
    },


    updateavatar(e) {
      //上传头像
      var file = e.target.files[0];
      var reads = new FileReader();
      // console.log(file.size); //Byte ——  不允许超过 1000000 Byte
      if (file.size > 1000000) {
        this.errMsg = "图片太大了<br/>不能超过1MB";
        this.showToast = true;
      } else {
        var f = document.getElementById('avatarfile').files[0];
        reads.readAsDataURL(f);
        reads.onload = function (e) {
          if (this.result.includes("data:image")) {
            socket.emit("avatar_change", this.result); //base64
            // document.getElementById('show').src = this.result;
          } else {
            console.log("只能上传图片！");
          }
        }
      };
    },



    //发送表情
    clickimg(emoji) {
      this.emoji_active = false;
      socket.emit("emoji_send", emoji);
      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        var chatRoom = this.$refs.chatRoom;
        chatRoom.scrollTop = chatRoom.scrollHeight;
      })
    },
    ReproduceHistorical() {
      this.historical_display = true;
      socket.emit(`startReHi`);
    },
    handleSend() {
      // 进行验证
      // 判断是否登录
      if (this.username === '') {
        // 如果当前没有登录，则跳转到登录界面
        this.errMsg = "请先登录!";
        this.showToast = true;
        this.$router.go("/login");
      }
      if (this.context === "") {
        this.errMsg = "请输入发送内容";
        this.showToast = true;
        // 重新获取input焦点
        this.$refs.inputFocus.focus();
        return;
      }
      // 发送消息
      /* eslint-disable */
      socket.emit("msg_send", this.context);
      // 重新获取input焦点
      this.$refs.inputFocus.focus();
    },
    informationChange() {
      this.userinformation = false;
      // socket.emit("obtain_avatarurl", this.username);
    },
  }
};
</script>

<style lang="less">
@keyframes loading-hidden {
  0% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    display: none;
  }
}

@keyframes loading-img {
  0% {
    transform: scale(0, 0);
  }

  80% {
    transform: scale(10rem, 10rem);
  }
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #35495e;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  user-select: none;
  // 根据数据库加载时间调整长短 
  animation-duration: 1.5s;
  animation-fill-mode: both;
  animation-name: loading-hidden;

  img {
    // 根据数据库加载时间调整长短 
    animation-duration: 1.5s;
    animation-fill-mode: both;
    animation-name: loading-img;

    margin-bottom: 7.5rem;
    border: solid 1px #ffffff;
    border-radius: 2rem;
    width: 10rem;
  }
}

.loading-content {
  position: fixed;
  top: 7rem;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  text-shadow: 0 0 4px #00ffff,
    0 0 4px #00ffff,
    0 0 4px #00ffff,
    0 0 4px #00ffff,
    0 0 4px #00ffff,
    0 0 4px #00ffff;
  // 根据数据库加载时间调整长短 
  animation-duration: 1.5s;
  animation-fill-mode: both;
  animation-name: loading-img;

  p {
    color: rgb(255, 255, 255);
    margin-bottom: 10rem;
  }
}

.home {
  position: relative;
  height: 100%;


  .home-body {
    position: absolute;
    bottom: 5rem;
    overflow-y: scroll;
    top: 2.9rem;
    -webkit-overflow-scrolling: touch;
    height: auto;
    width: 100%;

    .home-body-item {
      display: flex;
      flex-direction: row;
      padding: 0.5rem;

      .home-body-avator {
        width: 70px;
        height: 70px;
        box-shadow: 0px 2px 6px 1px #ccc;
        border-radius: 5px;
        margin-top: 0.5rem;
      }

      .home-body-content {
        display: flex;
        flex-direction: column;
        margin: 0 0.5rem 0.5rem 0.5rem;

        .username {
          color: rgb(255, 139, 7);
          font-weight: 1000;
          margin-bottom: 4px;
        }

        .messagetime {
          color: #999;
          font-size: 12px;
          font-weight: 100;
          margin-top: 10px;
        }

        .content {
          font-family: '黑体';
          background-color: rgb(238, 237, 237);
          padding: 0.6rem;
          border-radius: 5px;
          border: solid 1px gray;
          word-break: break-word;
          font-weight: 1000;
        }
      }
    }

    .active {
      flex-direction: row-reverse;

      .home-body-content {
        align-items: flex-end;
      }
    }
  }

  .home-bottom {
    position: absolute;
    bottom: 0;
    width: 100%;

    .home-bottom-container {
      display: flex;
      flex-direction: row;
      border: 1px solid #999;
      border-radius: 10px;

      .weui-cell {
        flex: 1;
      }
    }

    .home-bottom-menu {
      text-align: center;
    }
  }
}

.user_information {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.user_information_display {
  width: 20rem;
  padding-bottom: 0.5rem;
  border-radius: 1rem;
  border: #35495e 1px solid;
  background-color: #999;
}

// .user_information_swindows {
//   margin: 0.1rem 0;
//   background-color: #ccc;
//   border-radius: 1rem;
// }

.user_information_button {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 8px;
  align-items: baseline;

  button {
    margin: 0.5rem;
  }
}

.emoji_menu {
  background-color: rgba(153, 153, 153, 0.322);
  border-radius: 5px;
  display: inline-block;
}

.menu_bottom {
  height: 2.2rem;
}

.menu_bottom button {
  margin-left: 0.2rem;
  margin-bottom: 0.2rem;
  border-radius: 10px;
  background-color: white;
  width: 3rem;
  height: 2rem;

  img {
    width: 1rem;
  }
}

.emoji_menu td img {
  width: 4rem;
  height: 4rem;
  border: solid 1px rgba(87, 87, 87, 0.548);
}
</style>
