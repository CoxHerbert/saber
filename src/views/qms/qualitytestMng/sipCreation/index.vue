<template>
  <basic-container>
    <div class="list-page">
      <div class="header">
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
      </div>
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
                <template v-if="col.label === '专案/物料/标识'">
                  <dc-dict-key
                    v-if="scoped.row.checkType === 'DC_SIP_CHECK_TYPE_BS'"
                    :value="scoped.row.materialNumberCollection"
                    :options="dictMaps.DC_SIP_CHECK_ITEM"
                  />
                  <span v-else-if="scoped.row.checkType === 'DC_SIP_CHECK_TYPE_WL'">
                    {{ scoped.row.materialIdCollection || '-' }}
                  </span>
                  <span v-else-if="scoped.row.checkType === 'DC_SIP_CHECK_TYPE_ZA'">
                    {{ scoped.row.materialIdCollection || '-' }}
                  </span>
                  <span v-else-if="scoped.row.checkType === 'DC_SIP_CHECK_TYPE_MR'">-</span>
                </template>
                <template v-else-if="col.type === 'rowText'">
                  <template v-if="col?.transVal">
                    {{ col?.transVal(scoped, this.dictMaps.DC_SIP_CHECK_ITEM) }}
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
                  <dc-dict-key
                    v-if="dictMaps[col.dictKey]"
                    type="text"
                    :options="dictMaps[col.dictKey]"
                    :value="scoped.row[col.prop]"
                  ></dc-dict-key>
                  <span v-else>-</span>
                </template>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
    <AddEditeDialog ref="addEditeDialogRef" @success="handleReset" />
  </basic-container>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './index.js';
import AddEditeDialog from './addEditeDialog.vue';

export default {
  components: { AddEditeDialog },
  mixins: [listPage],
  name: 'sip-creation-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.dictKeys.push({ key: 'DC_SIP_CHECK_ITEM' });
    this.getDictData().then(() => {
      this.initSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      const params = {
        ...this.queryParams,
        materialNumberCollection: this.queryParams.materialNumberCollection?.id
          ? this.queryParams.materialNumberCollection.id
          : this.queryParams.materialNumberCollection,
      };
      this.api.qms.sn
        .sipOrderList(params)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records.map(record => ({
              ...record,
              isConfig: parseInt(record.isConfig),
            }));
            this.total = data.total;
            this.queryParams.current = data.current;
            this.queryParams.size = data.size;
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
      } else if (action === 'edit') {
        this.$refs.addEditeDialogRef.openDialog(row);
      } else if (action === 'copy') {
        this.$refs.addEditeDialogRef.openDialog(row, true);
      } else if (action === 'row-dbclick') {
        this.$router.push({
          path: '/qms/qualitytestMng/sipCreation/addEditeconfig',
          query: {
            id: row.id,
          },
        });
      } else if (action === 'add') {
        this.$refs.addEditeDialogRef.openDialog();
      } else if (action === 'config') {
        this.$router.push({
          path: '/qms/qualitytestMng/sipCreation/addEditeconfig',
          query: {
            id: row.id,
          },
        });
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.qms.sn.sipOrderRemove
      );
    },
    /** 是否配置 **/
    handleChange(row) {
      let title = row.isConfig == 1 ? '禁用' : '启用';
      this.$confirm(`确定${title}吗?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.api.qms.sn
          .sipOrderSubmit({
            ...row,
            isConfig: row.isConfig == 0 ? 1 : 0,
          })
          .then(res => {
            this.getData();
          });
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
