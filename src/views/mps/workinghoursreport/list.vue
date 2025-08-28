<template>
  <div class="app-container" v-loading="loading">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="专案号" prop="mtoNo">
        <el-input v-model="queryParams.mtoNo" placeholder="请输入专案号" />
      </el-form-item>
      <el-form-item label="计划名称" prop="billNumber">
        <el-input v-model="queryParams.billNumber" placeholder="请输入计划名称" />
      </el-form-item>
      <el-form-item label="创建人" prop="createUser">
        <dc-select-user
          v-model="queryParams.createUser"
          placeholder="请选择创建人"
          :multiple="false"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'DC_WORKING_HOUR_SERPORT_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>

      <div class="table-container">
        <el-table
          :data="dataList"
          row-key="id"
          lazy
          :load="load"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column
            label="专案号"
            prop="mtoNo"
            align="center"
            show-overflow-tooltip
            width="150"
          >
            <template #default="scoped">
              <span>{{ scoped.row.mtoNo || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="计划名称" prop="billNumber" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.billNumber || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="创建人" prop="name" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
            </template>
          </el-table-column>

          <el-table-column label="创建时间" prop="name" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.createTime || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="总工时" prop="processTime" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ secondToHour(scoped.row.processTime) || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="总数量" prop="processTime" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.qty || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="已汇报工时"
            prop="reportTotal"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ secondToHour(scoped.row.reportTotal) || '0' }}时</span>
            </template>
          </el-table-column>

          <el-table-column
            label="已汇报数量"
            prop="reportQtyTotal"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.reportQtyTotal || '0' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="ERP汇报工时"
            prop="erpReportWorkingHours"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.erpReportWorkingHours || '0' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="汇报工时"
            prop="mpsReportWorkingHours"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.mpsReportWorkingHours || '0' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="本次汇报工时"
            prop="reportWorkingHours"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ secondToHour(scoped.row.reportWorkingHours) || '0' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="本次汇报数量"
            prop="reportQty"
            align="center"
            width="120"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.reportQty || '-' }} 个</span>
            </template>
          </el-table-column>

          <el-table-column min-width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="hanleDetail(scoped.row)"
                v-if="scoped.row.parentId == null"
                v-permission="{ id: 'DC_WORKING_HOUR_SERPORT_DETAIL', row: scoped.row }"
                >查看</el-button
              >

              <el-button
                type="danger"
                text
                v-permission="{ id: 'DC_WORKING_HOUR_SERPORT_DEL', row: scoped.row }"
                @click="handleRemove(scoped.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>

  <!-- 新增抽屉 -->
  <el-drawer
    size="1400"
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    @close="closeAdd"
  >
    <el-form
      class="form-container"
      ref="formRef"
      :model="formData"
      label-width="90px"
      :rules="rules"
    >
      <el-form-item class="mt-5" label="选择计划" prop="planId">
        <el-select
          class="select"
          v-model="formData.planId"
          placeholder="请选择排程计划"
          @change="handleChange"
          :remote-method="remoteMethod"
          reserve-keyword
          filterable
          remote
          clearable
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="`${item.mtono}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.moPlanCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.materialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.materialName}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <div class="table-container">
        <el-table :data="formData.planDetail" :span-method="objectSpanMethod" height="100%" border>
          <el-table-column prop="produceRouteName" label="工艺" align="center" width="100" />
          <el-table-column prop="billNumber" label="MO" align="center" width="200" />
          <el-table-column prop="materialName" label="物料" align="center" />
          <el-table-column prop="processTime" label="总工时" align="center" width="100">
            <template #default="scoped"> {{ secondToHour(scoped.row.processTime) }}时 </template>
          </el-table-column>
          <el-table-column prop="reportWorkingHours" label="已汇报工时" align="center" width="100">
            <template #default="scoped">
              {{ secondToHour(scoped.row.reportWorkingHours) || '0' }}时
            </template>
          </el-table-column>
          <el-table-column prop="number" label="总数量" align="center" width="80">
            <template #default="scoped"> {{ scoped.row.number }}个 </template>
          </el-table-column>
          <el-table-column prop="reportNumber" label="已汇报数量" align="center" width="100">
            <template #default="scoped"> {{ scoped.row.reportNumber }}个 </template>
          </el-table-column>
          <el-table-column prop="reportHour" label="本次汇报工时" align="center" width="140">
            <template #default="scoped">
              <el-input-number
                class="w-full"
                v-model="scoped.row.reportHour"
                controls-position="right"
                :min="0"
              >
                <template #suffix><span>时</span></template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column
            label="本次汇报数量"
            prop="reportQty"
            align="center"
            width="160"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <el-input-number
                class="w-full"
                v-model="scoped.row.reportQty"
                controls-position="right"
                :min="0"
                :max="scoped.row.number - scoped.row.reportNumber"
              >
                <template #suffix>
                  <span>Max {{ scoped.row.number - scoped.row.reportNumber }} 个</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="isComplete" label="是否标记完成" align="center" width="200">
            <template #default="scoped">
              <el-switch
                v-model="formData.isComplete[scoped.row.produceRouteName]"
                size="large"
                active-text="完成"
                inactive-text="未完成"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="submitFormProgress">确 定</el-button>
        <el-button :loading="loading" @click="closeAdd">关闭</el-button>
      </span>
    </template>
  </el-drawer>

  <!-- 查看 -->
  <el-drawer
    size="1300"
    v-model="checkOpen"
    :title="title"
    destroy-on-close
    append-to-body
    @close="closeProgress"
  >
    <el-descriptions class="mt-3 mb-3" :column="4" v-for="(item, index) in detailErp" :key="index">
      <el-descriptions-item label="汇报单号">{{ item.billNo }}</el-descriptions-item>
      <el-descriptions-item label="汇报时间">{{ item.createTime }}</el-descriptions-item>
      <el-descriptions-item label="本次汇报工时">{{ item.workHours }}</el-descriptions-item>
    </el-descriptions>

    <div class="table-container">
      <el-table :data="planInfo" height="100%" border>
        <el-table-column prop="produceRouteName" label="工艺" align="center" width="100" />
        <el-table-column prop="billNumber" label="MO" align="center" width="200" />
        <el-table-column prop="materialName" label="物料" align="center" />
        <el-table-column prop="processTime" label="总工时" align="center" width="100">
          <template #default="scoped"> {{ secondToHour(scoped.row.processTime) }}时 </template>
        </el-table-column>
        <el-table-column prop="qty" label="总数量" align="center" width="100">
          <template #default="scoped"> {{ scoped.row.qty }}个 </template>
        </el-table-column>
        <el-table-column prop="reportHour" label="本次汇报工时" align="center" width="200">
          <template #default="scoped">
            {{ secondToHour(scoped.row.reportWorkingHours) }}时
          </template>
        </el-table-column>
        <el-table-column
          label="本次汇报数量"
          prop="reportQty"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <span>{{ scoped.row.reportQty || '-' }} 个</span>
          </template>
        </el-table-column>
        <el-table-column
          label="是否标记完成"
          prop="isComplete"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <span>{{ isCompleteEnum[scoped.row.isComplete] || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeProgress">关闭</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script>
import Api from '@/api/index';

export default {
  name: 'WorkingHoursReport',
  data() {
    return {
      loading: false,
      queryParams: {
        current: 1,
        size: 10,
        // mtoNo: undefined,
        // billNumber: undefined,
        // createUser: undefined,
      },
      dataList: [],
      total: 0,

      open: false,
      title: '新增汇报工时',
      selectValue: '',
      planInfo: [],
      options: [],
      checkOpen: false,
      detailErp: [],

      // 新增表单
      formData: {
        planId: null,
        isComplete: {},
        planDetail: [],
      },

      // 校验
      rules: {
        planId: [{ required: true, message: '请选择计划', trigger: 'blur' }],
        isComplete: [{ required: true, message: '请选择是否标记完成', trigger: 'blur' }],
      },

      isCompleteEnum: {
        false: '未完成',
        true: '已完成',
      },
    };
  },

  mounted() {
    this.getData();
    this.remoteMethod('init');
  },

  methods: {
    // 工具：秒转小时（保留与原用法一致）
    secondToHour(sec) {
      if (sec == null || isNaN(sec)) return 0;
      return (sec / 3600).toFixed(2);
    },

    // 主列表
    async getData() {
      try {
        this.loading = true;
        const res = await Api.mps.workinghoursreport.list(this.queryParams);
        const { code, data } = res.data;
        if (code === 200) {
          this.dataList = data.records;
          this.total = data.total;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    // 新增
    handleSubmit() {
      this.open = true;
      this.title = '新增';
    },

    // 删除
    handleRemove(row) {
      const ids = row.id;
      this.$confirm(`确认是否删除"${ids}"为的数据项？`)
        .then(() => {
          this.loading = true;
          return Api.mps.workinghoursreport.remove({ ids });
        })
        .then(() => {
          this.$message.success('删除成功');
          this.getData();
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    // 选择计划变化
    async handleChange() {
      const res = await Api.mps.workinghoursreport.planDetail({ planId: this.formData.planId });
      const { code, data } = res.data;
      if (code === 200) {
        this.formData.planDetail = data;
        data.forEach(item => {
          this.formData.isComplete[item.produceRouteName] = item.isComplete;
        });
      }
    },

    // 远程搜索
    async remoteMethod(query) {
      if (query === 'init') {
        const res = await Api.mps.workinghoursreport.planList();
        const { code, data } = res.data;
        if (code === 200) this.options = data;
      } else if (query) {
        const params = { mtoNo: query };
        const res = await Api.mps.workinghoursreport.planList(params);
        const { code, data } = res.data;
        if (code === 200) this.options = data;
      }
    },

    // 抽屉确定
    submitFormProgress() {
      this.$refs['formRef'].validate(async valid => {
        if (!valid) return;
        try {
          this.loading = true;
          const payload = this.formData.planDetail.map(item => ({
            ...item,
            reportHour: (item.reportHour || 0) * 3600,
            isComplete: this.formData.isComplete[item.produceRouteName] || false,
          }));
          const res = await Api.mps.workinghoursreport.reporSavetSubmit(payload);
          const { code, msg } = res.data;
          if (code === 200) {
            this.closeAdd();
            this.getData();
            this.$message.success(msg);
          }
          this.loading = false;
          this.open = false;
        } catch (e) {
          this.loading = false;
        }
      });
    },

    // 详情数据
    async detail(id) {
      const res = await Api.mps.workinghoursreport.list({ parentId: id });
      const { code, data } = res.data;
      if (code === 200) {
        this.planInfo = data.records;
      }
    },

    // 查看
    async hanleDetail(row) {
      this.title = '查看';
      this.checkOpen = true;
      await this.detail(row.id);

      const params = { moCode: row.billNumber, mtoNo: row.mtoNo };
      const res = await Api.mps.workinghoursreport.queryDetailErp(params);
      const { code, data } = res.data;
      if (code === 200) {
        this.detailErp = data;
      }
    },

    // 关闭新增
    closeAdd() {
      this.open = false;
      this.formData = {
        planId: null,
        isComplete: {},
        planDetail: [],
      };
      // 如果你项目里有全局 resetForm 工具，保留如下（可选）
      // this.resetForm && this.resetForm('formRef');
    },

    // 关闭查看
    closeProgress() {
      this.checkOpen = false;
      this.selectValue = null;
      this.planInfo = [];
    },

    // 懒加载树
    async load(row, treeNode, resolve) {
      const params = { ...this.queryParams, parentId: row.id };
      const res = await Api.mps.workinghoursreport.list(params);
      const { code, data } = res.data;
      if (code === 200) resolve(data.records);
    },

    handleQuery() {
      this.queryParams.current = 1;
      this.getData();
    },

    resetQuery() {
      this.queryParams = { current: 1, size: 10 };
      // 若有全局 resetForm，请保留
      this.resetForm && this.resetForm('queryRef');
      this.getData();
    },

    // 合并行
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex === 9) {
        const list = this.formData?.planDetail || [];
        const currentId = list[rowIndex]?.produceRouteId;
        const prevId = rowIndex > 0 ? list[rowIndex - 1]?.produceRouteId : null;

        if (rowIndex === 0 || currentId !== prevId) {
          const count = list.filter(item => item.produceRouteId === currentId).length;
          return { rowspan: count, colspan: 1 };
        } else {
          return { rowspan: 0, colspan: 0 };
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.description {
  margin-bottom: 20px;
}
:deep(.el-descriptions__body) {
  background: #f5f5f5 !important;
}
.select {
  margin-bottom: 20px;
}
:deep(.el-descriptions__cell) {
  padding: 12px 0 !important;
}
.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .table-container {
    flex: 1;
    overflow: hidden;
  }
}
</style>
