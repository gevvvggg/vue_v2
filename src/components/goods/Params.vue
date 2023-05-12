<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false">
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类</span>
          <el-cascader @change="handleChange" :options="catelist" :props="cateProps" v-model="selectCateKeys" clearable></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="addDialogVisible=true" type="primary" :disabled="isBtnDisabled">添加参数</el-button>
          <el-table :data="manyTableData" style="width: 100%">
            <el-table-column type="expand" width="180">
              <template slot-scope="scope">
                <el-tag @close="handleClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" :key="i" closable>
                  {{item}}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index" width="180">
            </el-table-column>
            <el-table-column label="参数名称" prop="attr_name" width="180">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="addDialogVisible=true" type="primary" :disabled="isBtnDisabled">添加属性</el-button>
          <el-table :data="onlyTableData" style="width: 100%">
            <el-table-column type="expand" width="180">
              <template slot-scope="scope">
                <el-tag @close="handleClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" :key="i" closable>
                  {{item}}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index" width="180">
            </el-table-column>
            <el-table-column label="属性名称" prop="attr_name" width="180">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @closed="addDialogClosed('addFormRef')">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams('addFormRef')">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'添加'+titleText" :visible.sync="editDialogVisible" width="50%" @closed="editDialogClosed('editFormRef')">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams('editFormRef')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      editForm: {},
      editFormRules: {
        attr_name: [{ required: true, message: "请输入参数", trigger: "blur" }],
      },
      editDialogVisible: false,
      addFormRules: {
        attr_name: [{ required: true, message: "请输入参数", trigger: "blur" }],
      },
      addForm: {
        attr_name: "",
      },
      addDialogVisible: false,
      manyTableData: [],
      onlyTableData: [],
      activeName: "many",
      selectCateKeys: [],
      catelist: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: "true",
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("编辑提交参数失败");
      }
      this.$message.success("编辑提交参数成功");
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttrVals(row);
    },
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已经取消删除");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getParmsData();
    },
    editParams(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          return this.$message.error("验证失败");
        } else {
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName,
            }
          );
          if (res.meta.status !== 200) {
            return this.$message.error("编辑提交参数失败");
          }
          this.$message.success("编辑提交参数成功");
          this.getParmsData();
          this.editDialogVisible = false;
        }
      });
    },
    editDialogClosed(formName) {
      this.$refs[formName].resetFields();
    },
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          attr_sel: this.activeName,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("ID查询参数失败");
      }
      this.editForm = res.data;
      console.log(this.editForm);
      this.editDialogVisible = true;
    },
    addParams(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          return this.$message.error("验证失败");
        } else {
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName,
            }
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加动态参数或者静态属性失败");
          }
          this.getParmsData();
          this.addDialogVisible = false;
          this.$message.success("添加动态参数或者静态属性成功");
        }
      });
    },
    addDialogClosed(formName) {
      this.$refs[formName].resetFields();
    },
    async getParmsData() {
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("参数列表获取失败");
      }
      res.data.forEach((element) => {
        element.attr_vals = element.attr_vals
          ? element.attr_vals.split(" ")
          : [];
        element.inputVisible = false;
        element.inputValue = "";
      });
      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    handleClick(tab, event) {
      this.getParmsData();
      console.log(tab, event);
    },
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类数据列表失败");
      }
      this.catelist = res.data;
      this.$message.success("获取商品分类数据列表成功");
      console.log(this.catelist);
    },
    async handleChange() {
      this.getParmsData();
    },
  },
  computed: {
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态参数";
    },
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
  },
};
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin-left: 10px;
}

.input-new-tag {
  width: 120px;
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
}
</style>