<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <el-row>
        <!-- 表格 -->
        <tree-table index-text='#' :selection-type="false" :expand-type='false' :data="catelist" :columns="columns" border show-index>
          <template slot="isok" slot-scope="scope">
            <i v-if="scope.row.cat_deleted===false" class="el-icon-success" style="color:lightgreen"></i>
            <i v-else class="el-icon-error" style="color:red"></i>
          </template>
          <template slot="order" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level===1" type="success" size="mini">二级</el-tag>
            <el-tag v-else type="warning" size="mini">三级</el-tag>
          </template><template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-setting" size="mini"></el-button>
          </template>
        </tree-table>
        <!-- 分页 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[3, 4, 5, 6]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-row>
    </el-card>
    <el-dialog title="提示" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed('addCateFormRef')">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader clearable v-model="selectedKeys" :options="parentCateList" :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',children:'children',checkStrictly:'true'}" @change="parentCateChanged"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate('addCateFormRef')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      selectedKeys: [],
      parentCateList: [],
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      addCateForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: 0,
      },
      addCateDialogVisible: false,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
          width: "400px",
        },
        {
          label: "是否有效",
          minWidth: "200px",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          minWidth: "200px",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          minWidth: "200px",
          type: "template",
          template: "opt",
        },
      ],
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      catelist: [],
      total: 0,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    addCateDialogClosed(formName) {
      this.$refs[formName].resetFields();
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
      this.selectedKeys = [];
    },
    addCate(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          return this.$message.error("验证失败");
        } else {
          const { data: res } = await this.$http.post(
            "categories",
            this.addCateForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加分类失败");
          }
          this.$message.success("添加分类成功");
          this.getCateList();
          this.addCateDialogVisible = false;
        }
      });
    },
    parentCateChanged() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length !== 0) {
        this.addCateForm.cat_level = this.selectedKeys.length;
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];

        return;
      } else {
        this.addCateForm.cat_level = 0;
        this.addCateForm.cat_pid = 0;
      }
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据列表失败");
      }
      this.parentCateList = res.data;
      console.log(this.parentCateList);
    },
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    handleSizeChange(pagesize) {
      this.querInfo.pagesize = pagesize;
      this.getCateList();
    },
    handleCurrentChange(pagenum) {
      this.querInfo.pagenum = pagenum;
      this.getCateList();
    },
    async getCateList() {
      const { data: res } = await this.$http.get("/categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("商品分类数据列表获取失败");
      }
      this.catelist = res.data.result;
      this.total = res.data.total;
      console.log(this.catelist, this.total);
    },
  },
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>