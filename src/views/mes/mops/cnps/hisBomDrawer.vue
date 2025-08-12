<template>
  <el-drawer
    class="his-drawer"
    v-model="dialogVisible"
    size="800"
    :title="title"
    @close="doAction('close')"
    v-loading="loading"
  >
    <el-radio-group v-model="radio">
      <el-radio v-for="(item, index) in detailData" :value="item" :key="index">
        <div class="create-time">{{ item.createTime }}创建</div>
        <el-table
          border
          :data="item?.dcHistoryMaterialBomList || []"
          style="height: 100%"
          size="small"
        >
          <template v-for="(col, i) in columns">
            <el-table-column
              v-if="
                col.type === 'selection' &&
                (!col.showFunc || (col.showFunc && col.showFunc?.call && col.showFunc(detailData)))
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
                !col.showFunc || (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
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
                <template v-if="editIndex === scoped.$index">
                  <dc-widget
                    v-model="scoped.row[col.prop]"
                    :data="{
                      ...col,
                      props: {
                        ...col.props,
                        disabled: handleTableItemDisabled(col, scoped),
                      },
                    }"
                    :dictMaps="dictMaps"
                    @change="
                      val => {
                        handleTableItemChange(val, scoped, col);
                      }
                    "
                  >
                  </dc-widget>
                </template>
                <span v-else @click="handleClickCeil(scoped.$index, col.prop)" class="ceil-value">
                  <dc-field-view
                    :value="col?.transVal ? col?.transVal(scoped) : scoped.row[col.prop]"
                    :data="col"
                    :dictMaps="dictMaps"
                  />
                </span>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </el-radio>
    </el-radio-group>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="doAction('submit')">提交</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script>
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import options from './hisBbomUtils';
export default {
  emits: ['success'],
  name: 'his-bom-drawer',
  mixins: [editDialog],
  data() {
    return {
      loading: true,
      columns: options().columns,
      dialogVisible: false,
      title: '历史BOM',
      detailData: [],
      radio: null,
    };
  },
  methods: {
    /** 打开添加弹窗 **/
    openDialog(materialNumber) {
      this.dialogVisible = true;
      this.getData(materialNumber);
    },
    getData(materialNumber) {
      this.loading = true;
      Api.mes.mops
        .getHisBom({ materialNumber })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.detailData = data || [];
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    /** 页面操作 **/
    doAction(action) {
      if (action === 'close') {
        this.dialogVisible = false;
        this.radio = null;
        this.detailData = [];
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    /** 处理提交 **/
    handleSubmit() {
      this.$emit('confirm', this.radio.dcHistoryMaterialBomList);
      this.doAction('close');
    },
  },
};
</script>

<style lang="scss">
.his-drawer {
  .el-drawer__body {
    padding: 10px;
  }
  .el-radio-group {
    width: 100%;
    height: 100%;
    display: block;
    overflow: auto;
  }
  .el-radio {
    display: flex;
    height: unset;
  }
  .el-radio__label {
    width: calc(100% - 30px);
  }
  .create-time {
    margin-bottom: 5px;
    font-size: 14px;
  }
}
</style>
