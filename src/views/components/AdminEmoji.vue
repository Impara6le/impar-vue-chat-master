<template>
  <div class="box-right">
    <!-- 显示表格 -->
    <el-table border style="width: 100%" class="right"
      :data="info.slice((currentPage - 1) * pagesize, currentPage * pagesize)">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="emoji_url" label="表情包">
        <template slot-scope="scope">
          <img v-image-preview :src="getEmojiImageUrl(scope.row.emoji_url)" style="max-width: 500px; max-height: 50px;" />
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
      showToast: false, // 是否显示 toast
      errMsg: "", // 出错提示信息
      emoji_url: '',
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
  methods: {
    getEmojiImageUrl(emojiUrl) {
      return require(`../../assets/emoji/${emojiUrl}`);
    },
    all() {
      this.currentPage = 1;
      axios.get('http://192.168.1.105:3001/emoji/all').then(res => {
        // console.log(res.data.length);
        this.info = res.data;
        // console.log(this.info);
      }).catch(err => {
        console.log("获取数据失败" + err);
      })
    },    //每页下拉显示数据
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