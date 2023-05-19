<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div>
        <el-input placeholder="请输入内容" class="input-with-select">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </div>
      <el-table ref="singleTable" border stripe :data="orderlist" style="width: 100%">
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column property="order_number" label="订单编号">
        </el-table-column>
        <el-table-column property="order_price" label="订单价格">
        </el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success"> 已付款
            </el-tag>
            <el-tag v-else type="danger"> 未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货">
          <template slot-scope="scope">
            {{ scope.row.is_send }}
          </template>
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @closed="addressDialogClosed('addressFormRef')">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <span>物流交易</span>
    </el-dialog>
  </div>
</template>
<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      progressVisible: false,
      progressInfo: [],
      cityData,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      orderlist: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: "",
      },
      addressFormRules: {
        address1: [
          { required: true, message: "请输入省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    showProgressBox() {
      this.progressVisible = true;
    },
    addressDialogClosed(formName) {
      this.$refs[formName].resetFields();
    },

    showBox() {
      this.addressVisible = true;
    },
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getOrderList();
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getOrderList();
    },
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("订单列表获取失败");
      }
      console.log(res.data);
      this.total = res.data.total;
      this.orderlist = res.data.goods;
      console.log(this.total, this.orderlist);
    },
  },
  created() {
    this.getOrderList();
  },
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>