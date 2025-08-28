<template>
  <el-dialog
    :model-value="visible"
    title="转单"
    width="640px"
    @close="handleClose"
    :close-on-click-modal="false"
    v-loading="loading"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="small">
      <el-form-item label="工序单号" prop="processNo">
        <el-input v-model="form.processNo" placeholder="<系统带入>" disabled />
      </el-form-item>
      <el-form-item label="类型" prop="transferType">
        <el-radio-group
          v-model="form.transferType"
          :size="`small`"
          @change="val => handleChange('transferType', val)"
        >
          <el-radio-button
            v-for="dict in dicts.DC_FORWARD_TYPE"
            :label="dict.label"
            :value="dict.value"
            :key="dict.value"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="工艺" prop="processIds" v-if="!!form.transferType">
        <el-select
          v-model="form.processIds"
          :multiple="form.transferType !== 'DC_FORWARD_TYPE_WW'"
          placeholder="请选择工艺"
        >
          <el-option
            v-for="(opt, i) in optional"
            :label="opt.processName"
            :value="opt.id"
            :key="i"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="供应商"
        prop="supplierNo"
        v-if="form.transferType === 'DC_FORWARD_TYPE_WW'"
      >
        <dc-supplier-select
          v-model="form.supplierNo"
          placeholder="请输入供应商名称查询选择"
          :size="`small`"
          @change="val => handleChange('supplierNo', val)"
        />
      </el-form-item>

      <el-form-item label="单价" prop="unitPrice" v-if="form.transferType === 'DC_FORWARD_TYPE_WW'">
        <el-input-number
          v-model="form.unitPrice"
          :min="0"
          :precision="2"
          :step="0.1"
          controls-position="right"
          style="width: 100%"
          @change="val => handleChange('unitPrice', val)"
        />
      </el-form-item>
      <el-form-item label="转单数量" prop="transferQty">
        <el-input-number
          v-model="form.transferQty"
          :min="1"
          :step="1"
          controls-position="right"
          style="width: 100%"
          @change="val => handleChange('transferQty', val)"
        />
      </el-form-item>
      <el-form-item
        label="总价"
        prop="totalPrice"
        v-if="form.transferType === 'DC_FORWARD_TYPE_WW'"
      >
        <el-input v-model="form.totalPrice" placeholder="自动=单价×数量，可改" />
      </el-form-item>
      <el-form-item label="交期" prop="deliveryTime">
        <el-date-picker
          v-model="form.deliveryTime"
          type="date"
          placeholder="选择交期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleOk">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import Api from '@/api';
import dcSupplierSelect from './dc-supplier-select.vue';
export default {
  components: { dcSupplierSelect },
  name: 'RefDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 从父组件传入已选择的工艺行，用于生成 processIds
    optional: { type: Array, default: () => [] },

    detailData: { type: Object, default: () => {} },
  },
  emits: ['update:visible', 'submit'],
  dicts: ['DC_FORWARD_TYPE', 'DC_FORWARD_STATUS'],
  data() {
    return {
      loading: false,
      form: {
        supplierId: null, // number
        supplierNo: '',
        unitPrice: null, // number
        totalPrice: null, // number
        transferQty: 1, // integer
        deliveryTime: '', // 'YYYY-MM-DD HH:mm:ss'
        processNo: '',
        processIds: [],
      },
      rules: {
        processIds: [{ required: true, message: '工艺为必选项', trigger: 'blur' }],
        transferType: [{ required: true, message: '类型必选项', trigger: 'blur' }],
        supplierNo: [{ required: true, message: '请输入供应商编码', trigger: 'blur' }],
        supplierId: [
          { required: true, message: '请输入供应商ID', trigger: 'blur' },
          {
            validator: (_, v, cb) => (Number.isFinite(+v) ? cb() : cb(new Error('必须是数字'))),
            trigger: 'blur',
          },
        ],
        processNo: [{ required: true, message: '请输入工序单号', trigger: 'blur' }],
        unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
        transferQty: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        totalPrice: [{ required: true, message: '请输入总价', trigger: 'blur' }],
        deliveryTime: [{ required: true, message: '请选择交期', trigger: 'change' }],
      },
    };
  },
  watch: {
    visible: {
      immediate: true,
      handler(v) {
        if (v) {
          this.initFromSelection();
        }
      },
    },
  },
  methods: {
    handleChange(prop, val) {
      if (prop === 'supplierNo') {
        this.form.supplierName = val.supplierName;
        this.form.supplierId = val.supplierId;
      } else if (prop === 'unitPrice' || prop === 'transferQty') {
        this.syncTotalPrice();
      } else if (prop === 'transferType') {
        if (val === 'DC_FORWARD_TYPE_WW') {
          this.form = {
            ...this.form,
            transferType: val,
            supplierId: null, // number
            supplierNo: '',
            unitPrice: null, // number
            totalPrice: null, // number
            processIds: [],
          };
        } else if (val === 'DC_FORWARD_TYPE_ZZ') {
          this.form = {
            ...this.form,
            transferType: val,
            supplierId: null, // number
            supplierNo: '',
            unitPrice: null, // number
            totalPrice: null, // number
            processIds: [],
          };
        }
      }
    },
    initFromSelection() {
      // 从所选行里带出 processIds（兼容 id / processId 字段）
      const ids = (this.processSelection || []).map(r => r.id ?? r.processId).filter(Boolean);
      this.form.processIds = ids;
      this.form.processNo = this.detailData.processNo;
      this.form.deliveryTime = this.detailData.deliveryTime;

      // 初始兜底
      if (!this.form.deliveryTime) {
        const dt = new Date();
        const pad = n => String(n).padStart(2, '0');
        const v = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(
          dt.getHours()
        )}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
        this.form.deliveryTime = v;
      }
      if (!this.form.unitPrice) this.form.unitPrice = 0;
      if (!this.form.transferQty) this.form.transferQty = Math.max(1, ids.length || 1);
      this.syncTotalPrice();
    },
    syncTotalPrice() {
      const price = Number(this.form.unitPrice || 0);
      const qty = Number(this.form.transferQty || 0);
      // 只在 totalPrice 未被用户手改时自动联动；简单策略：若 totalPrice 为空或正好等于上一次联动值则覆盖
      const calc = price * qty;
      this.form.totalPrice = calc;
    },
    handleClose() {
      this.$emit('update:visible', false);
    },
    handleOk() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return;
        this.loading = true;
        Api.mes.transfer
          .postOrderTrans(this.form)
          .then(res => {
            const { code, data } = res.data;
            if (code === 200) {
              this.$emit('submit', this.form);
            }
            this.loading = false;
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
          });
      });
    },
  },
};
</script>

<style scoped>
.mr-1 {
  margin-right: 6px;
}
.text-muted {
  color: var(--el-text-color-secondary);
}
</style>
