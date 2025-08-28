<template>
  <div
    v-for="(group, i) in columns"
    class="group-box"
    :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
    :key="i"
  >
    <div :key="i" class="group-header" v-if="group.showToggleHeader">
      {{ group.name }}
      <el-icon
        v-if="group.showToggleExpand"
        @click="toggleExpand(group.prop, !expand[group.prop])"
        class="toggle-expand-icon"
        ><CaretRight v-if="!expand[group.prop]" /> <CaretBottom v-else
      /></el-icon>
    </div>
    <template v-if="group.renderType === 'form'">
      <el-form
        ref="bomFormRef"
        label-width="80px"
        :model="formData"
        label-suffix=":"
        :disabled="allDisabled"
      >
        <template v-for="col in group.items">
          <el-form-item
            v-if="!col.showFunc || (col.showFunc && col.showFunc?.call && col.showFunc(data))"
            class="form-item-operation-detail"
            :class="`form-item-${col.prop}`"
            :label="col.label"
            :prop="col.prop"
            :rules="getColumnRules(col)"
            :key="col.prop"
            size="small"
          >
            <remoteSelect
              v-if="col.type === 'remote-select'"
              v-model="formData[col.prop]"
              v-bind="col.props"
              @change="
                val => {
                  handleFormItemChange(val, {}, col);
                }
              "
            />
            <div v-else-if="col.type === 'compose'" class="compose">
              <el-input-number
                v-model="formData.number1"
                v-bind="col.props"
                @change="
                  val => {
                    handleFormItemChange(val, {}, col);
                  }
                "
              />出
              <el-input-number
                v-model="formData.number2"
                v-bind="col.props"
                @change="
                  val => {
                    handleFormItemChange(val, {}, col);
                  }
                "
              />
            </div>
            <dc-widget
              v-else
              v-model="formData[col.prop]"
              :data="{
                ...col,
                props: {
                  ...col.props,
                },
              }"
              :dictMaps="dictMaps"
              @change="
                val => {
                  handleFormItemChange(val, {}, col);
                }
              "
            >
            </dc-widget>
          </el-form-item>
        </template>
        <el-form-item class="mt-5">
          <el-button type="primary" @click="doAction('row-add', {})" size="small">添加</el-button>
          <el-button
            type="primary"
            @click="doAction('get-his', {})"
            size="small"
            :disabled="!data?.isHistoryBom"
          >
            获取历史BOM
          </el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-if="group.renderType === 'table'">
      <el-form-item
        class="form-item-table"
        :prop="group.prop"
        :label-width="0"
        :rules="getTableRule(group.items)"
      >
        <div ref="dragableTableRef">
          <el-table
            :data="data[group.prop] || []"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            row-key="uuid"
            border
            size="small"
          >
            <!-- <el-table-column label="排序" width="50">
              <template #default="{ row }">
                <el-icon><Sort /></el-icon>
              </template>
            </el-table-column> -->
            <template v-for="(col, i) in group.items">
              <el-table-column
                v-if="
                  col.type === 'selection' &&
                  (!col.showFunc || (col.showFunc && col.showFunc?.call && col.showFunc(data)))
                "
                type="selection"
                :fixed="col.fixed"
                :width="col.width"
                :min-width="col.minWidth"
                :key="i"
                :selectable="col.selectable"
              >
              </el-table-column>
              <el-table-column
                v-else-if="col.type === 'index'"
                :key="'index' + i"
                :prop="col.prop"
                label="序号"
                fixed="left"
                align="center"
                :min-width="col?.minWidth || '80px'"
                :width="col?.width"
              >
                <template #default="scoped">{{ scoped.$index + 1 }}</template>
              </el-table-column>
              <el-table-column
                v-else-if="col.type === 'actions'"
                :key="'option' + i"
                :fixed="col.fixed"
                :label="col.label"
                :width="col.width ? col.width : 180"
                :align="col.align ? col.align : 'center'"
              >
                <template #default="scoped">
                  <el-button
                    v-for="(btn, j) in col.children"
                    :key="j"
                    link
                    v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                    type="primary"
                    @click="doAction(btn.action, scoped)"
                    >{{ btn.label }}</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column
                v-else-if="
                  !col.showFunc || (col.showFunc && col.showFunc?.call && col.showFunc(data))
                "
                :key="`other-${i}`"
                :fixed="col.fixed"
                :width="col.width"
                align="left"
                :min-width="col.minWidth"
                :prop="col.prop"
                show-overflow-tooltip
              >
                <template #header><span v-html="getLabelCode(col)"> </span></template>
                <template #default="scoped">
                  <el-input-number
                    v-if="editIndex === scoped.$index && col.prop === 'numeratorNumber'"
                    v-model="scoped.row[col.prop]"
                  />
                  <dc-field-view
                    v-else
                    :value="col?.transVal ? col?.transVal(scoped) : scoped.row[col.prop]"
                    :data="col"
                    :dictMaps="dictMaps"
                  />
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>
      </el-form-item>
    </template>
  </div>
  <hisBbomDrawer ref="hisBbomDrawerRef" @confirm="handleHisBomConfirm" />
</template>
<script>
import detailPage from '@/mixins/detail-page';
import detailConfig from './bomDataUtils';
import BigNumber from 'bignumber.js';
import hisBbomDrawer from './hisBomDrawer.vue';
import Sortable from 'sortablejs';
import func from '@/utils/func';
import prefixTextMaps from '@/const/modules/prefixTextMaps';
import remoteSelect from './remote-select.vue';
import { calculateWeight } from '@/utils/calculate';

// 1. 建立映射
const dimensionRules = {
  DC_RAW_MATERIAL_TYPE_B: {
    // 板类 A*B*C（C 为厚度）
    regex: /^\d+(\.\d+)?\*\d+(\.\d+)?\*\d+(\.\d+)?$/,
    message: '板类:A*:B*C(C为厚度)',
  },
  DC_RAW_MATERIAL_TYPE_length: {
    // 棒类 直径*长
    regex: /^\d+(\.\d+)?\*\d+(\.\d+)?$/,
    message: '棒类:直径*长度(有顺序要求)',
  },
  DC_RAW_MATERIAL_TYPE_YG: {
    // 圆管 外径*内径*长
    regex: /^\d+(\.\d+)?\*\d+(\.\d+)?\*\d+(\.\d+)?$/,
    message: '圆管:外径:*:内径*长(有顺序要求)',
  },
  DC_RAW_MATERIAL_TYPE_FT: {
    // 方通 长*宽*厚*高
    regex: /^\d+(\.\d+)?\*\d+(\.\d+)?\*\d+(\.\d+)?\*\d+(\.\d+)?$/,
    message: '方通: 边宽1:*:边宽2*壁厚*长度(有顺序要求)',
  },
  DC_RAW_MATERIAL_TYPE_JT: {
    // 角铁型材 边长*边长*厚度*长度
    regex: /^\d+(\.\d+)?\*\d+(\.\d+)?\*\d+(\.\d+)?\*\d+(\.\d+)?$/,
    message: '角铁型材:边长*边长*厚度*:长度(有顺序要求)',
  },
};

/** 2. 通用校验函数 */
function validateSize(dictKey, size) {
  const rule = dimensionRules[dictKey];
  if (!rule) {
    // 类型未在映射表里，不做校验
    return { valid: true };
  }
  const trimmed = (size || '').trim();
  if (!rule.regex.test(trimmed)) {
    return { required: true, valid: false, message: rule.message };
  }
  return { required: true, valid: true };
}

export default {
  components: { hisBbomDrawer, remoteSelect },
  mixins: [detailPage],
  name: 'bom-data',
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      detailKey: 'rawMaterialBom',
      columns: [],
      formData: {
        denominatorNumber: 1,
        number1: 1,
        number2: 1,
      },
    };
  },
  computed: {
    allDisabled() {
      if (this.pageMode === 'add') return !!this.data?.isUploadBom;
      if (this.pageMode === 'edit') return !!this.data?.isUploadBom;
      return true;
    },
  },
  beforeMount() {
    const { id, type } = this.$route.query;
    this.columns = detailConfig(type).columns;
    this.dictKeys = [{ key: 'DC_RAW_MATERIAL_TYPE' }];
    this.getDictData().then(() => {});
  },
  mounted() {
    // this.$nextTick(() => {
    //   if (this.allDisabled || this.data.isUploadBom) return true;
    //   // 1. 从 $refs 数组里拿到真正的 DOM 容器
    //   const wrapper = Array.isArray(this.$refs.dragableTableRef)
    //     ? this.$refs.dragableTableRef[0]
    //     : this.$refs.dragableTableRef;
    //   if (!wrapper) {
    //     console.warn('没拿到 wrapper');
    //     return;
    //   }
    //   // 2. 用正确的 class 找到 <tbody>
    //   const tbody = wrapper.querySelector('.el-table__body-wrapper tbody');
    //   if (!tbody) {
    //     console.warn('没找到 el-table__body-wrapper tbody');
    //     return;
    //   }
    //   // 3. 初始化 Sortable
    //   Sortable.create(tbody, {
    //     draggable: 'tr',
    //     animation: 150,
    //     onEnd: evt => {
    //       const list = this.data[this.detailKey];
    //       list.splice(evt.newIndex, 0, list.splice(evt.oldIndex, 1)[0]);
    //       list.forEach((item, idx) => (item.bomOrder = idx + 1));
    //     },
    //   });
    // });
  },
  methods: {
    /** 页面操作 **/
    doAction(action, scope) {
      if (action === 'row-click') {
        this.rowClick(scope);
      } else if (action === 'row-delete') {
        this.data[this.detailKey].splice(scope.$index, 1);
        this.data[this.detailKey].forEach((item, index) => {
          item.bomOrder = index + 1;
        });
      } else if (action === 'row-add') {
        this.handleAddRow();
      } else if (action === 'get-his') {
        this.$refs.hisBbomDrawerRef.openDialog(this.data?.materialNumber);
      }
    },
    handleHisBomConfirm(data) {
      data.forEach(item => {
        item.uuid = func.generateUUID();
        this.data[this.detailKey].push(item);
      });
      this.data[this.detailKey].forEach((item, index) => {
        item.bomOrder = index + 1;
        console.log(item.bomOrder);
      });
    },
    /** 处理行添加 */
    handleAddRow() {
      this.validateForm()
        .then(() => {
          // 其中 BOM用量= 下料数量/工单用量
          this.data[this.detailKey].push({
            ...this.formData,
            pageNumberString: `${this.formData.number1}出${this.formData.number2}`,
            uuid: func.generateUUID(),
          });
          this.data[this.detailKey].forEach((item, idx) => (item.bomOrder = idx + 1));
          this.formData = {
            denominatorNumber: 1,
            number1: 1,
            number2: 1,
          };
        })
        .catch(() => {
          //   this.$message.warning('请检查表单必填项及格式');
        });
    },
    validateForm() {
      return new Promise((resolve, reject) => {
        const form = this.$refs.bomFormRef;
        // if (!form || typeof form.validate !== 'function') {
        //   return reject(new Error('表单实例不存在'));
        // }
        form[0].validate(valid => {
          valid ? resolve() : reject();
        });
      });
    },
    /** 处理表单项变化 */
    handleFormItemChange(val, scoped, col) {
      if (col.prop === 'rawMaterialId') {
        this.formData.rawMaterialId = val.id;
        this.formData.rawMaterialName = val.materialName;
        this.formData.rawMaterialNumber = val.materialNumber;
        this.formData.shape = val.shapeTypeCode;
        this.formData.density = val.density;
        console.log(val);
      } else if (['shape', 'materialSize', 'density', 'cutNumber'].includes(col.prop)) {
        const isZero = value => {
          return new BigNumber(value || 0).isZero();
        };
        this.validateForm().then(() => {});
        const { shape, materialSize, density, cutNumber } = this.formData;
        const totalNumber = this.data.number;
        // 使用时
        if (isZero(density) || isZero(cutNumber) || isZero(totalNumber)) {
          this.$message.warning('密度、下料数量、计划数量不能为 0');
          return;
        }
        // —— 1. 所有字段都要有值 ——
        if (!shape || !materialSize || !density || !cutNumber || !totalNumber) {
          // 任意一项为空时，不计算
          return;
        }

        // —— 2. 按当前 shape 拿到对应校验规则 ——
        const rule = dimensionRules[shape];
        if (!rule) {
          this.$message.error(`未知的形状类型: ${shape}`);
          return;
        }
        if (!rule.regex.test(materialSize)) {
          this.$message.error(`下料尺寸格式不正确，应为：${rule.message}`);
          return;
        }

        // —— 3. 校验通过后，计算重量和 bomNumber ——
        const { weight } = calculateWeight(shape, materialSize, density);
        // 重量 * (下料数量 / 数量) = bomNumber
        const bomCalc = new BigNumber(weight)
          .times(cutNumber)
          .div(totalNumber)
          .toFixed(5, BigNumber.ROUND_HALF_UP);
        this.formData.bomNumber = parseFloat(bomCalc);
        // —— 4. 再算分子用量 numeratorNumber ——
        const numerCalc = new BigNumber(this.formData.bomNumber)
          .times(this.formData.denominatorNumber)
          .toFixed(5, BigNumber.ROUND_HALF_UP);
        this.formData.numeratorNumber = parseFloat(numerCalc);
      }
    },
    /** 处理表格项变化 */
    handleTableItemChange(val, scoped, col) {},
    /** 处理行点击 **/
    handleRowClick(row) {
      if (this.pageMode !== 'look') {
        const index = this.data[this.detailKey].findIndex(item => item === row);
        this.editIndex = index;
      } else {
        this.doAction('row-click', { row });
      }
      return;
    },
    /** 获取table的规则 **/
    getTableRule(columns) {
      const that = this;
      return [
        {
          required: true,
          validator(_, value = [], callback) {
            if (!Array.isArray(value) || value.length === 0) {
              return callback(new Error('明细信息不能为空'));
            }
            let errIndex = -1;
            let missCol = null;

            const rows = that.data[that.detailKey] || [];
            const checked = rows.filter(r => r.isSelected);

            const target = checked.length ? checked : rows;
            for (let i = 0; i < target.length; i++) {
              const row = target[i];
              missCol = columns.find(col => col.required && isNilOrEmpty(row[col.prop]));
              if (missCol) {
                errIndex = i;
                break;
              }
            }
            if (errIndex > -1) {
              callback(new Error(`第${errIndex + 1}行${missCol.label}不能为空`));
            } else {
              callback();
            }
          },
          trigger: 'change',
        },
      ];
    },
    /** 获取列规则 **/
    getColumnRules(col) {
      const rules = [];

      // 必填校验
      if (col.required && col.prop != 'materialSize') {
        rules.push({
          required: true,
          message: `${prefixTextMaps[col.type] || '请输入'}${col.label}`,
          trigger: ['blur', 'input', 'change'],
        });
      }

      // 针对 size 字段再做正则校验
      if (col.prop === 'materialSize') {
        rules.push({
          validator: (rule, value, callback) => {
            // 假设 data.rawMaterialType 存放当前选中的 dictKey
            const dictKey = this.formData.shape;
            const { valid, message } = validateSize(dictKey, value);
            if (!valid) {
              return callback(new Error(message));
            }
            callback();
          },
          trigger: ['blur', 'change'],
        });
      }

      return rules.length ? rules : undefined;
    },
  },
};
</script>
<style lang="scss" scoped>
.page-prod-plan-edit {
  margin-right: 1%;
  width: 50%;
  &.render-small {
    .form-basic-group {
      .form-item-rawMaterialId {
        width: 99% !important;
      }
    }
  }
  &.render-middle {
    .form-basic-group {
      .form-item-rawMaterialId {
        width: 99% !important;
      }
      .form-item-number1 {
        width: 99% !important;
      }
    }
  }
  &.render-large {
    .form-basic-group {
      .form-item-rawMaterialId,
      .form-item-materialSize {
        width: 65% !important;
      }
      .form-item-shape,
      .form-item-cutNumber {
        width: 33% !important;
      }
      .form-item-number1,
      .form-item-bomNumber {
        width: 49%;
      }
    }
  }
}
.drawer-container {
  .form-item-operation-detail {
    width: 49%;
    display: inline-flex;
    margin-bottom: 16px;
    &:nth-child(2n + 1) {
      margin-right: 2%;
    }
  }

  .compose {
    display: flex;
  }
}
</style>
