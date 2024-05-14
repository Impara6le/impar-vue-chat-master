<template>
  <div id="box" style="display: inline;" v-title data-title="后台管理平台-即时聊天系统">
    <div class="top">
      <h1>后台管理平台</h1><h2>基于Vue的即时聊天系统</h2>
    </div>
    <div class="box-top">
      <el-menu mode="horizontal" default-active="4">
        <el-menu-item index="2" @click="AdminUserInformation()">用户信息管理</el-menu-item>
        <el-menu-item index="4" @click="AdminHistoricalMessage()">历史消息管理</el-menu-item>
        <el-menu-item index="7" @click="AdminUploadPic()">上传图片管理</el-menu-item>
        <el-menu-item index="3" @click="AdminEmoji()">表情包管理</el-menu-item>
        <el-menu-item index="5" @click="AdminUserLog()">用户日志管理</el-menu-item>
        <el-menu-item index="6" @click="AdminFeedback()">意见反馈管理</el-menu-item>
        <el-submenu index="7" style="float:right;">
          <template slot="title">管理员:{{ this.adminuser }}</template>
          <el-menu-item index="2-1" @click="AdminLogout()">退出登录</el-menu-item>
        </el-submenu>
        <!-- <el-menu-item index="3" disabled>消息中心</el-menu-item> -->
      </el-menu>
    </div>
    <router-view></router-view>
    <toast v-model="showToast" type="text" :time="1000" :text="errMsg" position="middle"></toast>
  </div>
</template>

<script>
import axios from "axios"
import { XHeader, XInput, XButton, Toast } from "vux";

export default {
  components: {
    XHeader,
    XInput,
    XButton,
    Toast,
  },
  data() {
    return {
      id: '',
      message: '',
      showToast: false, // 是否显示 toast
      errMsg: "", // 出错提示信息
      time: '',
      adminuser: '',
      info: []
    };
  },
  // created() {
  //   // 接收路由传递过来的参数，判断是否登录
  //   if (localStorage.getItem('localsaveAdminuser') === undefined) {
  //     this.adminuser = this.$route.params.adminuser;
  //   } else {
  //     this.adminuser = localStorage.getItem('localsaveAdminuser');
  //   }
  // },
  mounted() {
    this.adminuser = this.$route.params.adminuser;
    if (this.adminuser === undefined) {
      // 如果当前没有登录，则跳转到登录界面(不能改)
      this.$router.push('/adminlogin');
    }
    /* eslint-disable */
    socket.on("admin_login_result", (code, msg) => {
      if (code) {
        this.errMsg = "注意：" + msg;
        this.showToast = true;
        setTimeout(() => {
          this.$router.go('/adminlogin');
          location.reload();
        }, 1000); // 在1秒后执行
      }
    });
    this.AdminHistoricalMessage();
  },
  methods: {
    AdminHistoricalMessage() {
      this.$router.push({ name: "adminhistoricalmessage", params: { adminuser: this.adminuser } });
    },
    AdminUserInformation() {
      this.$router.push({ name: "adminuserinformation", params: { adminuser: this.adminuser } });
    },
    SystemOverview() {
      this.$router.push({ name: "systemoverview", params: { adminuser: this.adminuser } });
    },
    AdminEmoji() {
      this.$router.push({ name: "adminemoji", params: { adminuser: this.adminuser } });
    },
    AdminUserLog() {
      this.$router.push({ name: "adminuserlog", params: { adminuser: this.adminuser } });
    },
    AdminFeedback() {
      this.$router.push({ name: "adminfeedback", params: { adminuser: this.adminuser } });
    },
    AdminUploadPic() {
      this.$router.push({ name: "adminuploadpic", params: { adminuser: this.adminuser } });
    },
    AdminLogout() {
      localStorage.removeItem('localsaveAdminuser');
      localStorage.removeItem('localsaveAdminpass');
      this.$router.go({ name: "adminlogin" });
    }
  }
}
</script>

<style>
.top {
  background-color: rgb(235, 235, 235);
  display: flex;
  justify-content: center;
  align-items: center;

  h2 {
    padding-top: 0.5rem;
    margin-left: 1rem;
  }
}
.box-top{
  user-select:none;
}
</style>