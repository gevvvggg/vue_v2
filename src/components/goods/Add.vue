<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" :label-position="'top'">
        <el-tabs @tab-click="tabClicked" :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange" :clearable=true></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item" :key="i" v-for="(item,i) in item.attr_vals"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :on-preview="handlePreview" :on-success="handleSuccess" :on-remove="handleRemove" :headers="headerObj" :action="uploadURL" :file-list="fileList" list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button type="primary" @click="add('addFormRef')" class="btnAdd">添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
var _ = require("lodash");
export default {
  data() {
    return {
      previewVisible: false,
      previewPath: "",
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      fileList: [],
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      onlyTableData: [],
      manyTableData: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      catelist: [],
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          {
            required: true,
            message: "请输入商品分类",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
  created() {
    this.getCateList();
  },
  methods: {
    add(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          return this.$message.error("表单必须填写完整");
        } else {
          this.$message.success("继续把");
          const form = _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(",");
          this.manyTableData.forEach((item) => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(" "),
            };
            this.addForm.attrs.push(newInfo);
          });
          this.onlyTableData.forEach((item) => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals,
            };
            this.addForm.attrs.push(newInfo);
          });
          form.attrs = this.addForm.attrs;
          console.log(form);
          const { data: res } = await this.$http.post("goods", form);
          if (res.meta.status !== 201) {
            console.log(res.meta.msg);
            return this.$message.error("添加商品失败");
          }
          this.$router.push("/goods");
        }
      });
    },
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    handleSuccess(response) {
      const picInfo = {
        pic: response.data.tmp_path,
      };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    async tabClicked() {
      console.log(this.activeIndex);
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("参数列表查询分类失败");
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("参数列表查询分类失败");
        }
        this.onlyTableData = res.data;
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length === 0) {
        this.$message.error("请选中商品分类");
        return false;
      }
    },
    handleChange() {
      console.log(this.addForm.goods_cat);
    },
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.catelist = res.data;
      console.log(this.catelist);
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>



