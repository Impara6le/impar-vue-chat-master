<template>
  <div class="login-container" v-title data-title="用户登录-即时聊天系统">
    <flexbox orient="vertical" justify="center" align="center">
      <img class="login-avator" src="../assets/icon/login_icon.png" />
      <flexbox-item>
        <group class="login-group">
          <span>登录/注册</span>
          <x-input :show-clear="false" title="姓名" v-model="username" placeholder="请输入姓名" v-enter="handleLogin"
            :max="16"></x-input>
          <x-input :show-clear="false" title="密码" type="password" v-model="password" placeholder="请输入密码"
            v-enter="handleLogin" :max="32"></x-input>
          <div class="login-button">
            <x-button @click.native="handleLogin">登录</x-button>
            <x-button @click.native="handleRegister">注册</x-button>
          </div>

          <x-button @click.native="feedback = !feedback">意见反馈</x-button>
          <div class="feedback" v-show="feedback">
            <div class="feedback-content">
              <span>你有意见？</span>
              <x-input :show-clear="false" type="text" v-model="feedback_text" placeholder="请输入你的意见"
                v-enter="feedback_submit"></x-input>
              <div class="feedback-button">
                <x-button @click.native="feedback = !feedback">取消</x-button>
                <x-button @click.native="feedback_submit">提交</x-button>
              </div>
            </div>
          </div>
        </group>
      </flexbox-item>
    </flexbox>
    <toast v-model="showToast" type="text" :time="2000" :text="errMsg" position="middle"></toast>
  </div>
</template>

<script>
import axios from "axios";
import { Flexbox, FlexboxItem, Group, XInput, XButton, Toast } from "vux";
export default {
  components: {
    Flexbox,
    FlexboxItem,
    Group,
    XInput,
    XButton,
    Toast,
  },
  data() {
    return {
      feedback_text: '',
      feedback: false,
      username: '',
      password: '',
      useravatarurl: '',
      showToast: false, // 是否显示 toast
      errMsg: "" // 出错提示信息
    };
  },
  created() {
    if (localStorage.getItem('localsaveUsername') !== 'null' || localStorage.getItem('localsaveUsername') !== 'null') {
      this.username = localStorage.getItem('localsaveUsername')
      this.password = localStorage.getItem('localsavePassword')
    }
    this.getIPAddress();
  },
  mounted() {
    //注册
    /* eslint-disable */
    socket.on("register_result", (code, msg) => {
      if (code) {
        this.errMsg = "注册失败:" + msg;
        this.showToast = true;
      } else {
        this.errMsg = "注册成功";
        this.showToast = true;
      }
    });
    // 登录
    /* eslint-disable */
    socket.on("login_result", (code, msg) => {
      if (code) {
        this.errMsg = "登录失败:" + msg;
        this.showToast = true;
      } else {
        // 登录成功
        this.errMsg = "登录成功";
        this.showToast = true;
        //存储于本地
        window.localStorage.setItem('localsaveUsername', this.username);
        window.localStorage.setItem('localsavePassword', this.password);
        this.$router.push({ name: "index", params: { username: this.username, useravatarurl: this.useravatarurl } });
        this.username = '';
      }
    })
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
    async getIPAddress() {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        const ipAddress = response.data.ip;
        console.log('IP地址:', ipAddress);
      } catch (error) {
        console.error('检索IP地址时出错:', error);
      }
    },
    handleRegister() {
      // 验证数据
      if (!this.isValidate())
        return;
      // 向 socket 发送注册信息
      /* eslint-disable */
      socket.emit("register", this.username, this.password);
    },
    handleLogin() {
      // 验证数据
      if (!this.isValidate())
        return;
      // 向 socket 发送登录信息
      /* eslint-disable */
      socket.emit("login", this.username, this.password);
    },
    feedback_submit() {
      if (this.feedback_text === '') {
        this.errMsg = "你没意见？<br/>strong？";
        this.feedback = false;
        this.showToast = true;
      } else {
        socket.emit("feedback", this.feedback_text);
        this.errMsg = "已收到你的意见";
        this.feedback = false;
        this.showToast = true;

      }
    },
    isValidate() {
      // 验证数据
      if (this.username === "") {
        this.errMsg = "请输入用户名";
        this.showToast = true;
        return false;
      }
      if (this.password === "") {
        this.errMsg = "请输入密码";
        this.showToast = true;
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="less">
.login-container {
  width: 100%;
  height: 100%;
  // padding-top: 30%;
  display: flex;
  justify-content: center;
  background-color: #35495e;

  .login-avator {
    padding-top: 13rem;
    width: 10rem;
  }

  .login-group {
    display: flex;
    justify-content: center;

    .weui-cells {
      border-radius: 8px;
      box-shadow: 0px 2px 7px 0px rgba(68, 98, 196, 0.1);
      padding: 2px;

      span {
        display: flex;
        justify-content: center;
        color: #666;
        font-weight: 550;
        font-size: 1.5rem;
      }
    }

    .login-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 8px;
      align-items: baseline;

      button {
        margin: 0.5rem;
      }
    }
  }
}

.feedback {
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

.feedback-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;

  .weui-cell {
    border: solid 1px #666;
    border-radius: 10px;
  }
}



.feedback-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 8px;
  align-items: baseline;

  button {
    margin: 0.5rem;
  }
}
</style>
