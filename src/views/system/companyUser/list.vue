<template>
  <basic-container>
    <div class="content-warp page-processing-outsourcing list-edit-page">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>

      <div class="table-container" style="margin-top: 20px">
        <el-form ref="formRef" class="form-main" :model="tableData">
          <!-- :rules="getTableRule(group.items)" -->
          <el-form-item class="form-item-table" :label-width="0">
            <el-table
              ref="tableRef"
              v-loading="loading"
              :data="tableData"
              row-key="id"
              @select="handleSelect"
              @select-all="handleSelectAll"
              @selection-change="handleSelectionChange"
              :row-class-name="tableRowClassName"
              border
            >
              <template v-for="(col, i) in columns">
                <!-- 多选 -->
                <el-table-column
                  v-if="col.type === 'selection'"
                  :key="i"
                  type="selection"
                  :align="col.align"
                  :width="col.width"
                  :fixed="col?.fixed || ''"
                />
                <!-- 序号类型 -->
                <el-table-column
                  v-else-if="col.type === 'index'"
                  :key="'index' + i"
                  label="序号"
                  :align="col.align"
                  :width="col.width"
                >
                  <template #default="{ $index }">
                    {{ $index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column
                  v-else-if="col.type === 'actions'"
                  :key="'option' + i"
                  :fixed="col.fixed"
                  :label="col.label"
                  :width="col.width ? col.width : 180"
                  :min-width="col.minWidth"
                  :align="col.align ? col.align : 'center'"
                >
                  <template #default="scoped">
                    <el-button
                      v-for="(btn, j) in col.children"
                      :key="j"
                      link
                      v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped, queryParams))"
                      type="primary"
                      @click="doAction(btn.action, scoped)"
                      >{{ btn.label }}</el-button
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  v-else
                  :key="col.type + i"
                  :label="col.label"
                  :width="col.width"
                  :min-width="col.minWidth"
                  :prop="col.prop"
                  :align="col.align ? col.align : 'center'"
                  show-overflow-tooltip
                >
                  <template #header><span v-html="getLabelCode(col)"> </span></template>
                  <template #default="scoped">
                    <div
                      class="cell-box"
                      :class="getCellBoxClass(scoped, col)"
                      @click.stop="handleCellClick(scoped, col)"
                    >
                      <template
                        v-if="
                          coordinate?.rowIndex === scoped.$index &&
                          scoped.cellIndex === coordinate?.cellIndex
                        "
                      >
                        <el-form-item
                          :prop="`${scoped.$index}.${col.prop}`"
                          :label-width="0"
                          :rules="getColumnRules(col, scoped)"
                        >
                          <dc-widget
                            v-model="scoped.row[col.prop]"
                            :data="col"
                            :dictMaps="dictMaps"
                            @change="
                              val => {
                                handleTableItemChange(val, scoped, col);
                              }
                            "
                          >
                          </dc-widget>
                        </el-form-item>
                      </template>
                      <template v-else>
                        <dc-view
                          v-if="['dc-select-user'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          objectName="user"
                        />
                        <dc-view
                          v-if="['wf-select-dialog', 'dc-select-dialog'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          :objectName="col.props.objectName"
                        />
                        <dc-dict-key
                          v-if="['dict'].includes(col.type)"
                          :value="scoped.row[col.prop]"
                          :options="dictMaps?.[col.dictKey]"
                        />
                        <span v-else>
                          {{
                            [undefined, null, ''].includes(scoped.row[col.prop])
                              ? '-'
                              : scoped.row[col.prop]
                          }}
                        </span>
                      </template>
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
    <!-- <his-price ref="hisPriceRef" /> -->
  </basic-container>
</template>
<script>
import unsavedChanges from '@/mixins/unsaved-changes';
import listEditPage from '@/mixins/list-edit-page';
import options from './list';
import { mapGetters } from 'vuex';
// import hisPrice from './cpns/his-price.vue';
import BigNumber from 'bignumber.js';

export default {
  //   components: { hisPrice },
  mixins: [listEditPage, unsavedChanges],
  name: 'outsource-quotation-list',
  data() {
    return {
      mode: 'model',
      modelParams: {
        modelId: '1937686904528375810',
        datasourceId: '1879454467050659841',
      },
      editRow: {},
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    isSubmitErp() {
      return Array.isArray(this.tableData)
        ? !this.tableData.filter(item => item?.$edit).length
        : true;
    },
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.searchConfig.tabConfig = {
        prop: 'label',
        items: [
          { label: '未考核', value: '未考核' },
          { label: '有异议', value: '有异议' },
          { label: '已考核', value: '已考核' },
        ],
      };

      this.queryParams.label = '未考核';
      this.addSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.system.po
        .getAssessmentRecordList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'submitErp') {
        this.handleSubmitErp();
      } else if (action === 'viewBatches') {
        // 这里需要判断当前用户跟考核人id是否一样
        console.log(this.userInfo.user_id, row.assessorId);
        if (this.userInfo.user_id !== row.assessorId) {
          this.$message.error('您不是考核人，不能查看');
          return;
        }

        // console.log(this.userInfo.user_id);
        // return;
        this.$router.push({
          path: '/system/companyUser/index',
          query: {
            templateId: row.templateId,
            department: row.department,
            assessor: row.assessor,
            assessmentPeriod: row.assessmentPeriod,
          },
        });
        // 在目标页面中，可以通过以下方式接收数据：
        // 在目标页面的 created 或 mounted 钩子中使用 this.$route.query 获取
        // 示例代码：
        // created() {
        //   const templateId = this.$route.query.templateId;
        //   const department = this.$route.query.department;
        //   const assessmentPeriod = this.$route.query.assessmentPeriod;
        // }
      } else if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.id));
      } else if (action === 'delete') {
        deleteData([scope.row.id]);
      } else if (action === 'his-price') {
        // this.$refs.hisPriceRef.openDialog(row);
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids,
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.system.OutsourceQuotation.remove
      );
    },
    handleTableItemChange(val, scoped, col) {
      const { row } = scoped;
      row[`$${col.prop}`] = true;
      row.$edit = true;

      this.$nextTick(() => {
        const triggerProps = ['length', 'width', 'height', 'materialShapeId'];
        const materialFeeTriggerProps = ['volume', 'density', 'materialCost'];
        const currentOutsourcePriceFeeTriggerProps = ['materialFee', 'processFee', 'surfaceFee'];

        if (triggerProps.includes(col.prop)) {
          row.volume = this.calculateVolume(row);
        }

        if (triggerProps.includes(col.prop) || materialFeeTriggerProps.includes(col.prop)) {
          row.materialFee = this.calculateMaterialFee(row);
        }

        if (
          triggerProps.includes(col.prop) ||
          materialFeeTriggerProps.includes(col.prop) ||
          currentOutsourcePriceFeeTriggerProps.includes(col.prop)
        ) {
          row.currentOutsourcePrice = this.calculateTotalPrice(row);
        }
        if (col.prop === 'materialShapeId') {
          // 动态调整必填字段 —— 根据 materialShapeId 判断
          // const requiredFieldsMap = {
          //   DC_MATERIAL_SHAPE_BAR_STOCK: ['length', 'height'], // 棒料
          //   DC_MATERIAL_SHAPE_SHEET_METAL: ['length', 'width', 'height'], // 板料
          //   DC_MATERIAL_SHAPE_HEXAGONAL_BAR: ['length', 'height'], // 六角棒
          // };
          // const currentShapeId = row.materialShapeId;
          // const requiredFields = requiredFieldsMap[currentShapeId] || [];
          // 更新 columns 中对应字段的 required 状态
          // this.columns = this.columns.map(colConfig => {
          //   // 只对 length/width/height 三个字段处理必填状态
          //   if (['length', 'width', 'height'].includes(colConfig.prop)) {
          //     colConfig.required = requiredFields.includes(colConfig.prop);
          //   }
          //   return colConfig;
          // });
        }
      });
    },
    calculateVolume(row) {
      const { length, width, height, materialShapeId } = row;

      // 都转为 BigNumber
      const L = new BigNumber(length || 0);
      const W = new BigNumber(width || 0);
      const H = new BigNumber(height || 0);

      switch (materialShapeId) {
        case 'DC_MATERIAL_SHAPE_SHEET_METAL':
          // 板料：长 × 宽 × 高
          if (!L.isZero() && !W.isZero() && !H.isZero()) {
            return L.multipliedBy(W).multipliedBy(H).toFixed(2);
          }
          break;

        case 'DC_MATERIAL_SHAPE_BAR_STOCK':
          // 棒料：π × (直径/2)^2 × 长
          if (!L.isZero() && !H.isZero()) {
            const radius = L.dividedBy(2);
            return radius.pow(2).multipliedBy(H).multipliedBy(Math.PI).toFixed(2);
          }
          break;

        case 'DC_MATERIAL_SHAPE_HEXAGONAL_BAR':
          // 六角棒：(3√3 / 2) × 边长² × 长
          if (!L.isZero() && !H.isZero()) {
            const factor = new BigNumber(3).multipliedBy(Math.sqrt(3)).dividedBy(2);
            return factor.multipliedBy(L.pow(2)).multipliedBy(H).toFixed(2);
          }
          break;
      }

      return '0.00'; // 默认返回两位小数格式字符串
    },
    // 材料费计算
    calculateMaterialFee(row) {
      const { volume, density, materialCost } = row;
      if (volume && density && materialCost) {
        const result = new BigNumber(volume)
          .multipliedBy(density)
          .multipliedBy(materialCost)
          .dividedBy(1_000_000_000);
        return result.toFixed(2); // 保留两位小数，返回字符串
      }
      return '0.00';
    },

    // 计算总价
    calculateTotalPrice(row) {
      const materialFee = new BigNumber(row.materialFee || 0);
      const processFee = new BigNumber(row.processFee || 0);
      const surfaceFee = new BigNumber(row.surfaceFee || 0);

      const total = materialFee.plus(processFee).plus(surfaceFee);
      return total.toFixed(2); // 保留两位小数，返回字符串
    },
    handleSubmitErp() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const formData = this.tableData.filter(item => item.$edit);
          if (!formData.length) return;
          this.getInvalidRows(formData, this.columns).then(() => {
            this.loading = true;
            this.api.system.OutsourceQuotation.saveErp(formData, {
              isPushToErp: true,
            })
              .then(res => {
                const { code, data } = res.data;
                if (code === 200) {
                  this.$message.success('操作成功');
                  this.getData();
                  this.coordinate = {};
                }
                this.loading = false;
              })
              .catch(err => {
                this.loading = false;
                console.log(err);
              });
          });
        }
      });
    },
    tableRowClassName({ row, rowIndex }) {
      // 举例：第3行加高亮
      if (row?.$edit) {
        return 'highlight-row';
      }
      return '';
    },
    addSearchConfig() {
      this.searchConfig.searchItemConfig.paramType = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.page-processing-outsourcing {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
  :deep(.form-main) {
    width: 100%;
    height: 100%;
  }
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 6px;
      padding-bottom: 0;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
:deep(.label-suffix) {
  color: #f56c6c;
}
:deep(.el-table) {
  .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }
}
:deep(.highlight-row) {
  background-color: var(--el-table-row-active-bg-color); /* 浅绿色背景 */
}
</style>
