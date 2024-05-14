<template>
  <div class="login-container" v-title data-title="管理员后台登录-即时聊天系统">
    <flexbox orient="vertical" justify="center" align="center">
      <img class="login-avator" src="../assets/icon/Admin_icon.png" />
      <flexbox-item>
        <group class="login-group">
          <span>后台系统登录</span>
          <x-input :show-clear="false" title="管理员" v-model="adminuser" placeholder="请输入姓名" v-enter="handleLogin"
            :max="16"></x-input>
          <x-input :show-clear="false" title="密码 " type="password" v-model="adminpass" placeholder="请输入密码"
            v-enter="handleLogin" :max="32"></x-input>
          <div class="login-button">
            <x-button @click.native="handleLogin">登录</x-button>
          </div>
        </group>
      </flexbox-item>
    </flexbox>
    <toast v-model="showToast" type="text" :time="2000" :text="errMsg" position="middle"></toast>
  </div>
</template>

<script>
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
      adminuser: localStorage.getItem('localsaveAdminuser'),
      adminpass: localStorage.getItem('localsaveAdminpass'),
      showToast: false, // 是否显示 toast
      errMsg: "" // 出错提示信息
    };
  },
  created() {
    if (localStorage.getItem('localsaveAdminuser') !== 'null' || localStorage.getItem('localsaveAdminpass') !== 'null') {
      this.username = localStorage.getItem('localsaveAdminuser')
      this.password = localStorage.getItem('localsaveAdminpass')
    }
  },
  mounted() {
    // 登录
    /* eslint-disable */
    socket.on("admin_login_result", (code, msg) => {
      if (code) {
        this.errMsg = "登录失败:" + msg;
        this.showToast = true;
      } else {
        // 登录成功
        this.errMsg = "登录成功";
        this.showToast = true;
        //存储于本地
        window.localStorage.setItem('localsaveAdminuser', this.adminuser);
        window.localStorage.setItem('localsaveAdminpass', this.adminpass);
        setTimeout(() => {
          this.$router.push({ name: "adminindex", params: { adminuser: this.adminuser } });
        }, 1000); // 在1秒后执行
        // this.adminuser = '';
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
    handleLogin() {
      // 验证数据
      if (!this.isValidate())
        return;
      // 向 socket 发送登录信息
      /* eslint-disable */
      socket.emit("admin_login", this.adminuser, this.adminpass);
    },
    isValidate() {
      // 验证数据
      if (this.adminuser === "") {
        this.errMsg = "请输入用户名";
        this.showToast = true;
        return false;
      }
      if (this.adminpass === "") {
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
  background-color: #b6b6b6;

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

      button {
        margin: 0.5rem;
      }
    }
  }
}
</style>
