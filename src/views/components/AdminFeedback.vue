<template>
  <div class="box-right">
    <div class="box-button" style="text-align:center;">
      <el-button type="success" @click="all" icon="el-icon-refresh">显示全部</el-button>
      <el-input style="width: 15rem;" v-model="feedbackAll" clearable placeholder="请输入意见反馈留言" class="input"
        v-enter="get"></el-input>
      <el-input style="width: 15rem;" v-model="reply_adminAll" clearable placeholder="请输入回复的管理员" class="input"
        v-enter="get"></el-input>
      <el-radio-group v-model="reply_stateAll">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="0">未回复</el-radio-button>
        <el-radio-button label="1">已回复</el-radio-button>
      </el-radio-group>
      <el-button type="primary" @click="get">查询</el-button>
      <el-button type="primary" @click="rewrite" icon="el-icon-loading">重置</el-button>
    </div>

    <!-- 显示表格 -->
    <el-table border style="width: 100%" class="right"
      :data="info.slice((currentPage - 1) * pagesize, currentPage * pagesize)" v-show="buttonDisplay">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="feedback" label="意见反馈留言" />
      <el-table-column prop="time" label="发送时间" :formatter="formatTime" width="220" />
      <el-table-column prop="reply" label="管理员的回复" width="180" />
      <el-table-column prop="reply_admin" label="回复的管理员" width="140" />
      <el-table-column prop="reply_time" label="回复时间" width="180" :formatter="formatTime" />
      <el-table-column prop="operation" label="操作" width="220">
        <template slot-scope="scope">
          <el-button @click="updateOperate">回复</el-button>
          <el-button type="danger" @click="delreply(scope.row.id)">删除回复</el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 显示修改表格 -->
    <el-table border style="width: 100%" class="right"
      :data="info.slice((currentPage - 1) * pagesize, currentPage * pagesize)" v-show="buttonDisplaySave">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="feedback" label="意见反馈留言" />
      <el-table-column prop="time" label="发送时间" :formatter="formatTime" width="220" />
      <el-table-column prop="reply" label="管理员的回复" width="180">
        <template slot-scope="scope">
          <el-input type="textarea" v-model="scope.row.reply" placeholder="请回复内容"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="reply_admin" label="回复的管理员" width="140" />
      <el-table-column prop="reply_time" label="回复时间" width="180" :formatter="formatTime" />
      <el-table-column prop="operation" label="操作" width="220">
        <template slot-scope="scope">
          <el-button type="success" @click="toreply(scope.row)">确认</el-button>
          <el-button @click="buttonDisplayCancel">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 页数 -->
    <div class="pagination" style="text-align:center;">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[5, 10, 20, 50]" :page-size="pagesize" layout="total, sizes,prev, pager, next" :total="info.length"
        prev-text="上一页" next-text="下一页">
      </el-pagination>
    </div>
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
      currentPage: 1, //默认显示页面为1
      pagesize: 10, //    每页的数据条数
      id: '',
      feedback: '',
      showToast: false, // 是否显示 toast
      errMsg: "", // 出错提示信息
      time: '',
      feedbackAll: '',
      reply_state: '',
      reply_stateAll: '',
      reply_adminAll: '',
      reply_admin: '',
      adminuser: '',
      addDisplay: false,
      buttonDisplay: true,
      buttonDisplaySave: false,
      info: [], //需要data定义一些，info定义一个空数组，请求的数据都是存放这里面
    };
  },
  mounted() {
    // 接收路由传递过来的参数，判断是否登录
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
    this.all();
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
  //格式化时间
  computed: {
    formattedTime() {
      return (time) => {
        if (!time) return '';
        const date = new Date(time);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };
    }
  },
  methods: {
    //   imgSearch(row, column){
    //     var data = row[column.property];
    //     if (data.includes("data:image")) {
    //       return "<img src='../assets/tx1.jpg'>";
    //   }else{
    //     this.info = res.data;
    //   }
    // },
    // 时间格式化
    formatTime(row, column) {
      var data = row[column.property];
      if (data === '1970-01-01T00:00:00.000Z') {
        return '';
      }
      var dtime = new Date(data);
      const year = dtime.getFullYear()
      var month = dtime.getMonth() + 1
      if (month < 10) {
        month = '0' + month
      }
      var day = dtime.getDate()
      if (day < 10) {
        day = '0' + day
      }
      var hour = dtime.getHours()
      if (hour < 10) {
        hour = '0' + hour
      }
      var minute = dtime.getMinutes()
      if (minute < 10) {
        minute = '0' + minute
      }
      var second = dtime.getSeconds()
      if (second < 10) {
        second = '0' + second
      }

      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    },
    rewrite() {
      this.feedbackAll = '';
      this.reply_adminAll = '';
      this.reply_stateAll = '';
    },
    all() {
      axios.get('http://192.168.1.105:3001/feedback/all').then(res => {
        // console.log(res.data.length);
        this.info = res.data;
        // console.log(this.info);
      }).catch(err => {
        console.log("获取数据失败" + err);
      })
    },
    delreply(id) {    //删除操作
      //提示框，判断用户是否操作失误
      this.$confirm("此操作将永久删除, 是否继续?", "警告", {
        confirmButtonText: "继续",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        axios.get('http://192.168.1.105:3001/feedback/delreply', {
          params: {
            id: id
          },
        }).then(res => {
          // console.log(res.data);
          if (res.data.status == 200) {
            this.$message({
              type: "success",
              message: "已删除"
            });
            this.get();
          } else {
            this.$message({
              message: '删除失败',
              type: 'error'
            });
          }
        }).catch(err => {
          console.log("操作失败" + err);
        })
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      })
    },
    get() {    //查询操作
      this.currentPage = 1;
      axios.get('http://192.168.1.105:3001/feedback/get', {
        params: {
          reply_admin: this.reply_adminAll,
          feedback: this.feedbackAll,
          reply_state: this.reply_stateAll,
        },
      }).then(res => {
        this.info = res.data;
      }).catch(err => {
        console.log("操作失败" + err);
      })
    },
    updateOperate() {
      this.buttonDisplay = false;
      this.buttonDisplaySave = true;
    },
    //修改操作
    toreply(row) {
      axios.get('http://192.168.1.105:3001/feedback/toreply', {
        params: {
          id: row.id,
          reply: row.reply,
          reply_admin: this.adminuser
        }
      }).then(res => {
        // console.log(res.data);
        if (res.data.status == 200) {
          this.get();
          this.$message({
            message: '修改成功',
            type: 'success'
          });
          this.buttonDisplay = true;
          this.buttonDisplaySave = false;
        } else {
          this.$message({
            message: '你没有修改信息',
            type: 'error'
          });
        }
      }).catch(err => {
        console.log("操作失败" + err);
      })
    },
    buttonDisplayCancel() {
      this.buttonDisplay = true;
      this.buttonDisplaySave = false;
      this.get();
    },
    //每页下拉显示数据
    handleSizeChange: function (size) {
      this.pagesize = size;
      /*console.log(this.pagesize) */
    },
    //点击第几页
    handleCurrentChange: function (currentPage) {
      this.currentPage = currentPage;
      /*console.log(this.currentPage) */
    },
  }
}
</script>

<style>
.box-operation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.box-operation-info {
  padding: 0 1rem 1rem 1rem;
  background-color: rgb(255, 255, 255);
  border-radius: 1rem;

  div {
    padding: 0.1rem 0.1rem 0.1rem 0;
  }
}

.box-operation-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 8px;
  align-items: baseline;

  button {
    margin-left: 2rem;
  }
}

.box-button {
  margin: 1rem 1rem;
}
</style>