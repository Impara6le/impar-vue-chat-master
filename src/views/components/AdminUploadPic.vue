<template>
  <div class="box-right">
    <div class="box-button" style="text-align:center;">
      <el-button type="success" @click="all" icon="el-icon-refresh">显示全部</el-button>
      <el-input style="width: 9rem;" v-model="usernameAll" clearable placeholder="请输入用户名" class="input"
        v-enter="get"></el-input>
      <el-button type="primary" @click="get">查询</el-button>
      <el-button type="primary" @click="rewrite" icon="el-icon-loading">重置</el-button>
      <el-button type="danger" @click="multipleDel" icon="el-icon-warning">批量删除</el-button>
    </div>

    <!-- 显示表格 -->
    <el-table border style="width: 100%" class="right" @selection-change="handleSelectionChange"
      :data="info.slice((currentPage - 1) * pagesize, currentPage * pagesize)" v-show="buttonDisplay">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="uploadimg" label="消息内容" :show-overflow-tooltip="true">
        <template slot-scope="scope">
        <div v-if="scope.row.uploadimg.includes('data:image')">
          <img v-image-preview :src="scope.row.uploadimg" style="max-width: 100px; max-height: 100px;" />
        </div>
        <div v-else>
          {{ scope.row.uploadimg }}
        </div>
      </template>
      </el-table-column>
      <el-table-column prop="time" label="发送时间" :formatter="formatTime" width="220" />
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="operation" label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="danger" @click="del(scope.row.id)" icon="el-icon-delete-solid">删除</el-button>
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
      uploadimg: '',
      showToast: false, // 是否显示 toast
      errMsg: "", // 出错提示信息
      time: '',
      usernameAll: '',
      username: '',
      adminuser: '',
      addDisplay: false,
      buttonDisplay: true,
      buttonDisplaySave: false,
      info: [], //需要data定义一些，info定义一个空数组，请求的数据都是存放这里面
      multipleSelect: [] //批量操作
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
    handleSelectionChange(rows) {
      this.multipleSelect = rows;
      // console.log(this.multipleSelect);
      // console.log(this.multipleSelect.length);

    },
    multipleDel() {
      if (this.multipleSelect.length === 0) {
        this.$message({
          message: '哥们你没选中啊',
          type: 'error'
        });
      } else {
        //提示框，判断用户是否操作失误
        this.$confirm("此操作将永久删除, 是否继续?", "警告", {
          confirmButtonText: "继续",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          for (var i = 0; i < this.multipleSelect.length; i++) {
            axios.get('http://192.168.1.105:3001/uploadpic/del', {
              params: {
                id: this.multipleSelect[i].id
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
            // console.log(this.multipleSelect[i].id);
          }
        }).catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        })

      }
    },
    rewrite() {
      this.usernameAll = '';
    },
    all() {
      this.currentPage = 1;
      axios.get('http://192.168.1.105:3001/uploadpic/all').then(res => {
        // console.log(res.data.length);
        this.info = res.data;
        // console.log(this.info);
      }).catch(err => {
        console.log("获取数据失败" + err);
      })
    },
    del(id) {    //删除操作
      //提示框，判断用户是否操作失误
      this.$confirm("此操作将永久删除, 是否继续?", "警告", {
        confirmButtonText: "继续",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        axios.get('http://192.168.1.105:3001/uploadpic/del', {
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
      axios.get('http://192.168.1.105:3001/uploadpic/get', {
        params: {
          username: this.usernameAll,
        },
      }).then(res => {
        // console.log(this.username);
        // console.log(this.uploadimg);
        // console.log(res.data);
        this.info = res.data;
      }).catch(err => {
        console.log("操作失败" + err);
      })
    },
    buttonDisplayCancel() {
      this.buttonDisplay = true;
      this.buttonDisplaySave = false;
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
.vue-directive-image-previewer{
  z-index: 2;
}
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