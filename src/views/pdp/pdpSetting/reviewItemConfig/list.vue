<template>
  <div class="list-page review-item-config-list-page">
    <!-- <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button
          type="primary"
          icon="CirclePlus"
          v-permission="{ id: 'SIP_CREATION_ADD' }"
          @click="doAction('add')"
          >新建</el-button
        >
      </div> -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @row-dblclick="
          row => {
            doAction('row-dblclick', row);
          }
        "
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
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
                v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
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
            <template #default="scoped">
              <template v-if="col.type === 'rowText'">
                <template v-if="col?.transVal">
                  {{ col?.transVal(scoped) }}
                </template>
                <template v-else>
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
                  }}
                </template>
              </template>
              <dc-view
                v-else-if="col.type === 'dc-view'"
                v-model="scoped.row[col.prop]"
                :objectName="col.objectName"
                :showKey="col.showKey"
              />
              <template v-else-if="col.type === 'dict'">
                <dc-dict
                  v-if="dictMaps[col.dictKey]"
                  type="text"
                  :options="dictMaps[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict>
                <span v-else>-</span>
              </template>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <el-dialog v-model="dialog.open" :title="dialog.title" @close="doAction('close')">
      <el-form :model="dialog.formData" ref="formRef" :rules="dialog.rules">
        <el-form-item label="评审说明" prop="dimensionDesc">
          <el-input
            v-model="dialog.formData.dimensionDesc"
            placeholder="请输入评审说明"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="doAction('submit')">提交</el-button>
        <el-button @click="doAction('close')">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list.js';
import Api from '@/api/index';

export default {
  mixins: [listPage],
  name: 'process-technology-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
      dialog: {
        open: false,
        title: '',
        formData: {},
        rules: {
          dimensionDesc: [
            {
              required: true,
              message: '请选择数据源',
              trigger: 'blur',
            },
          ],
        },
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      //   this.initSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.pdp.projectSetting
        .getReviewDimensionTemplate(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data;
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
      if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.id));
      } else if (action === 'delete') {
        this.deleteData([scope.row.id]);
      } else if (action === 'row-edit') {
        this.handleEdit(row);
      } else if (action === 'row-config') {
        this.$router.push({
          path: '/pdp/pdpSetting/reviewItemConfig/config',
          query: {
            type: action,
            id: row.id,
            parentMenuId: '1948194888883167234',
          },
        });
      } else if (action === 'close') {
        this.handleClose();
      } else if (action === 'submit') {
        this.handleSubmit();
      }
    },
    handleSubmit() {
      this.$refs.formRef.validate().then(valid => {
        if (valid) {
          this.loading = true;
          Api.pdp.projectSetting
            .submitReviewDimension(this.dialog.formData)
            .then(res => {
              const { code } = res.data;
              if (code === 200) {
                this.handleClose();
                this.handleReset();
                this.$message.success('编辑成功');
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              console.log(err);
            });
        }
      });
    },
    handleEdit(row) {
      this.dialog = {
        ...this.dialog,
        open: true,
        title: '编辑',
        formData: {
          ...row,
        },
      };
    },
    handleClose() {
      this.dialog = {
        ...this.dialog,
        open: false,
        title: '编辑',
        formData: {},
      };
    },
    /** 处理删除 **/
    deleteData(ids) {
      console.log(ids);
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        Api.mes.basicConfig.technologyConfigRemove
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.list-page {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
}
</style>
