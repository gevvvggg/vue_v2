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
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbottom',i1===0?'bdtop':'','vcenter']">
                <!-- 一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag><i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级权限 -->
                <el-col :span="19">
                  <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'bdtop','vcenter']">
                    <el-col :span="6">
                      <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{ item2.authName }}</el-tag><i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag closable @close="removeRightById(scope.row,item3.id)" v-for="(item3,i3) in item2.children" :key="item3.id" :class="[i3===0?'':'bdtop']" type="warning">{{ item3.authName }}</el-tag>

                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
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
              <el-button @click="showSetRightDialog(scope.row)" type="warning" size="mini" icon="el-icon-setting">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%" @close="setRightDialogClosed">
      <el-tree ref="tree" :default-checked-keys="defKeys" node-key="id" show-checkbox :default-expand-all="true" :data="rightslist" :props="defaultProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      defKeys: [],
      roleslist: [],
      setRightDialogVisible: false,
      rightslist: [],
      defaultProps: {
        children: "children",
        label: "authName",
      },
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async allotRights() {
      const keys = [
        ...this.$refs.tree.getCheckedKeys(),
        ...this.$refs.tree.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("角色授权失败");
      }
      this.getRolesList();
      this.setRightDialogVisible = false;
      this.$message.success("角色授权成功");
    },
    setRightDialogClosed() {
      this.defKeys = [];
    },
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 发送请求获取改主角的权限列表
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取主角的权限列表失败");
      }
      this.rightslist = res.data;
      console.log(this.rightslist);
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    removeRightById(role, rightId) {
      this.$confirm("此操作将永久删除该标签, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          );
          if (res.meta.status !== 200) {
            return this.$message({
              type: "info",
              message: "删除失败",
            });
          }
          role.children = res.data;
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
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
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>