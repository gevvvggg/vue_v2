<template>
  <el-container class="home-container">
    <el-header>
      <el-row type="flex" justify="space-between">
        <div>
          <img src="../assets/heima.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出登录</el-button>
      </el-row>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">
          |||
        </div>

        <el-menu :default-active="activePath" :router="true" unique-opened :collapse-transition="false" :collapse="isCollapse" background-color="#333744" text-color="#fff" active-text-color="#ffd04b">
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <el-menu-item @click="saveNaveState(subItem.path + '')" :index="subItem.path + ''" v-for="subItem in item.children" :key="subItem.id"><i class="el-icon-menu"></i>
              <span>{{ subItem.authName }}</span></el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main><router-view></router-view></el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
      activePath: "",
      menulist: [],
      iconsObj: {
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("./login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res.data);
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    saveNaveState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
};
</script>
<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  padding-left: 0;
  .el-row {
    color: #fff;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
      > span {
        margin-left: 15px;
      }
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
.iconfont {
  margin-right: 15px;
}
.toggle-button {
  text-align: center;
  font-size: 10px;
  background-color: #4a5064;
  line-height: 24px;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
