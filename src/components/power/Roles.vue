<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card -->
    <el-card>
      <el-row>
        <el-button type="primary">添加角色</el-button>
      </el-row>
      <template>
        <el-table ref="singleTable" :data="roleslist" style="width: 100%">
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index" label="#">
          </el-table-column>
          <el-table-column property="roleName" label="角色名称">
          </el-table-column>
          <el-table-column property="roleDesc" label="角色描述">
          </el-table-column>
          <el-table-column label="操作" width="380px">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              <el-button type="warning" size="mini" icon="el-icon-setting">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

  </div>
</template>
<script>
export default {
  data() {
    return {
      roleslist: [],
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleslist = res.data;
      console.log(this.roleslist);
    },
  },
};
</script>
<style lang="less" scoped>
</style>