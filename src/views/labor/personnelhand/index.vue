<template>
  <basic-container>
    <el-tabs v-model="applyStatus" @tab-click="handleClick">
      <el-tab-pane
        :label="item"
        :name="item"
        v-for="(item, index) in activeNameList"
        :key="index"
      ></el-tab-pane>
    </el-tabs>
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <el-form-item label="人员姓名" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="岗位" prop="jobGradeDictCode">
            <el-select v-model="queryParams.jobGradeDictCode" placeholder="请选择岗位" clearable>
              <el-option
                v-for="(item, index) in DC_LABOR_POSITION"
                :key="index"
                :value="item.dictKey"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="劳务公司" prop="companyId">
            <el-select v-model="queryParams.companyId" placeholder="请选择劳务公司" clearable>
              <el-option
                v-for="(item, index) in companyList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="queryParams.mobile" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="日期" class="el-form-item-timer">
            <el-date-picker
              v-model="queryParams.timers"
              type="daterange"
              range-separator="-"
              start-placeholder="请选择开始时间"
              end-placeholder="请选择结束时间"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="operate-container">
      <el-button
        plain
        icon="el-icon-download"
        v-permission="{ id: 'PERSONNAL_HANDING_IMP' }"
        @click="download('queryResult')"
        >导出全部
      </el-button>
      <el-button
        plain
        icon="el-icon-download"
        v-permission="{ id: 'PERSONNAL_HANDING_IMP' }"
        @click="download('currentPage')"
        >导出当前页
      </el-button>
      <el-button
        icon="el-icon-delete"
        plain
        @click="handleDelete"
        v-permission="{ id: 'PERSONNAL_HANDING_BATCH_DEL' }"
        :disabled="multipleSelection.length == 0"
        >批量删除</el-button
      >
      <el-button
        type="primary"
        @click="doAction('BatchRecruitmentJudgment')"
        :disabled="multipleSelection.length == 0"
        v-permission="{ id: 'PERSONNAL_HANDING_BATCH_COM' }"
        >批量入职</el-button
      >
      <el-button
        type="primary"
        @click="refusalToOnboard"
        :disabled="multipleSelection.length == 0"
        v-permission="{ id: 'PERSONNAL_HANDING_BATCH_REFUSE' }"
        >批量拒绝入职</el-button
      >
    </div>

    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="dataList"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="80" prop="avatarId" align="center">
          <template #default="scoped">
            <span style="display: flex; align-items: center; justify-content: center"
              ><el-image
                :src="scoped.row.avatarId"
                style="width: 30px; height: 30px; border-radius: 5px"
              >
                <template #error>
                  <div class="image-slot">-</div>
                </template>
              </el-image>
            </span>
          </template>
        </el-table-column>
        <el-table-column width="100px" label="人员姓名" align="center" prop="name" />
        <el-table-column
          min-width="130px"
          label="登记时间"
          align="center"
          prop="createTime"
          show-overflow-tooltip
        />
        <el-table-column label="劳务公司" min-width="100px" align="center" prop="companyId">
          <template #default="scoped">
            <dc-view v-model="scoped.row.companyId" objectName="company" showKey="id" />
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="100px" align="center" prop="deptId">
          <template #default="scoped">
            <dc-view v-model="scoped.row.deptId" objectName="dept" showKey="id" />
          </template>
        </el-table-column>
        <el-table-column label="岗位" min-width="100px" align="center" prop="jobGradeDict">
        </el-table-column>
        <el-table-column label="岗位等级" min-width="90px" align="center" prop="positionDictCode">
        </el-table-column>

        <el-table-column min-width="120" label="状态" align="center">
          <template #default="scoped">
            <el-tag :type="colorMap[scoped.row.applyStatus]">
              {{
                scoped.row.applyStatus === '复试已通过'
                  ? '待确认入职'
                  : scoped.row.applyStatus === '确认入职'
                  ? '待入职'
                  : scoped.row.applyStatus
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" label="初试时间" align="center" prop="preliminaryDate" />
        <el-table-column
          min-width="100px"
          label="初试结论"
          align="center"
          prop="preliminaryConclusion"
        >
          <template #default="scoped">
            <span :class="scoped.row.preliminaryConclusion === '通过' ? 'pass' : 'notpass'">
              {{ scoped.row.preliminaryConclusion }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100px"
          label="初试说明"
          align="center"
          prop="preliminaryDescription"
        />
        <el-table-column min-width="100px" label="复试时间" align="center" prop="finalDate" />
        <el-table-column
          min-width="100px"
          label="复试说明"
          align="center"
          prop="finalDescription"
        />
        <el-table-column min-width="100px" label="复试结论" align="center" prop="finalConclusion">
          <template #default="scoped">
            <span :class="scoped.row.finalConclusion === '通过' ? 'pass' : 'notpass'">
              {{ scoped.row.finalConclusion }}
            </span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" label="联系电话" align="center" prop="mobile" />
        <el-table-column min-width="100" label="是否住宿" align="center" prop="isAccommodation">
        </el-table-column>
        <el-table-column min-width="130" label="入职时间" align="center" prop="joinedDate">
        </el-table-column>

        <el-table-column
          min-width="130"
          v-if="applyStatus == '已离职' || applyStatus == '全部'"
          label="离职时间"
          align="center"
          prop="leavingDate"
        >
          <template #default="scoped"> {{ scoped.row.leavingDate || '-' }}</template>
        </el-table-column>

        <el-table-column
          v-if="applyStatus == '已离职' || applyStatus == '全部'"
          min-width="100px"
          label="是否退租"
          align="center"
          prop="isCheckOut"
        >
          <template #default="scoped">
            <span :class="scoped.row.isCheckOut === '是' ? 'pass' : 'notpass'">
              {{
                scoped.row.isAccommodation == '是'
                  ? scoped.row.isCheckOut === '是'
                    ? '是'
                    : '否'
                  : '-'
              }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              v-if="scoped.row.applyStatus == '复试已通过' || scoped.row.applyStatus == '确认入职'"
              v-permission="{ id: 'PERSONNAL_HANDING_OP', row: scoped.row }"
              @click="handleOnboarding(scoped.row)"
              >入职办理</el-button
            >
            <el-button
              link
              type="primary"
              v-if="scoped.row.applyStatus == '已入职'"
              @click="handleResign(scoped.row)"
              >离职办理</el-button
            >
            <el-button
              link
              type="primary"
              v-permission="{ id: 'PERSONNAL_HANDING_EDIT', row: scoped.row }"
              @click="editeClick(scoped.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              v-permission="{ id: 'PERSONNAL_HANDING_DETAIL', row: scoped.row }"
              @click="lookDetail(scoped.row)"
              >详情</el-button
            >
            <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scoped.row)"
              >删除</el-button
            > -->
          </template>
        </el-table-column>
      </el-table>
    </div>

    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </basic-container>
  <!-- 入职办理 -->
  <EntryDialog ref="EntryDialogRef" @success="getData()" />
  <!-- 离职办理 -->
  <ResignDialog ref="ResignDialogRef" @success="getData()" />
  <!-- 详情 -->
  <DetailDialog ref="detailDialogRef" />
  <!-- 编辑 -->
  <EditeDialog ref="editeDialogRef" />

  <JudgmentDialog ref="JudgmentDialogRef" :mode="mode" @submit="handleJudgmentDialogRefSubmit" />
</template>
<script setup name="Productiongroup">
import { nextTick, onMounted } from 'vue';
import Api from '@/api/index';
import { getList, remove, getLaborCompanyList } from '@/api/system/labor';
import DetailDialog from './detailDialog.vue';
import EntryDialog from './entryDialog.vue';
import ResignDialog from './resignDialog.vue';
import dayjs from 'dayjs';
import { downloadXls } from '@/utils/util';
import { exportBlob } from '@/api/common';
import NProgress from 'nprogress';
import EditeDialog from '../registration/editeDialog.vue';
import { deepClone, removeEmptyValues } from '@/utils/util';
import JudgmentDialog from './judgment-dialog/index.vue';

const { proxy } = getCurrentInstance();
const EntryDialogRef = ref(null);
const ResignDialogRef = ref(null);
const detailDialogRef = ref(null);
const editeDialogRef = ref(null);
const applyStatus = ref('全部');
const data = reactive({
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  companyList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  multipleSelection: [],
  activeNameList: ['全部', '待入职', '已入职', '已离职'],
  colorMap: {
    复试已通过: 'warning',
    待初试: 'warning',
    初试已取消: 'info',
    初试不通过: 'danger',
    待复试: 'warning',
    复试不通过: 'danger',
    拒绝入职: 'danger',
    确认入职: 'success',
    已入职: 'success',
    已离职: 'danger',
  },
});

const {
  multipleSelection,
  companyList,
  queryParams,
  dataList,
  loading,
  total,
  activeNameList,
  colorMap,
} = toRefs(data);

// 数据字典
const { DC_LABOR_POSITION } = proxy.useCache([{ key: 'DC_LABOR_POSITION' }]);

onMounted(() => {
  getData();
  getLaborCompanyListFn();
});

// 导出
const download = mode => {
  proxy
    .$confirm('是否导出劳务数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      const query = {
        ...queryParams.value,
        current: mode === 'queryResult' ? 1 : queryParams.value.current,
        size: mode === 'queryResult' ? 100000 : queryParams.value.size,
      };
      const queryStr = Object.keys(query)
        .reduce((rec, item) => {
          if (![null, undefined, ''].includes(query[item])) {
            rec.push(`${item}=${query[item]}`);
          }
          return rec;
        }, [])
        .join('&');
      NProgress.start();
      exportBlob(`/blade-bip/laborRegister/download?${queryStr}`).then(res => {
        downloadXls(res.data, `劳务数据表${dayjs().format('YYYY-MM-DD')}.xlsx`);
        NProgress.done();
      });
    });
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dates = {};
  if (queryParams.value.timers) {
    let startDate = dayjs(queryParams.value.timers[0]).format('YYYY-MM-DD');
    let endDate = dayjs(queryParams.value.timers[1]).format('YYYY-MM-DD');
    if (applyStatus.value == '待入职') {
      dates = {
        finalStartDate: startDate,
        finalEndDate: endDate,
      };
    } else if (applyStatus.value == '已入职') {
      dates = {
        joinedStartDate: startDate,
        joinedEndDate: endDate,
      };
    } else if (applyStatus.value == '已离职') {
      dates = {
        leavingStartDate: startDate,
        leavingEndDate: endDate,
      };
    } else if (applyStatus.value == '全部') {
      dates = {
        createStartDate: startDate,
        createEndDate: endDate,
      };
    }
  }

  let dataparam = removeEmptyValues(
    deepClone(Object.assign(queryParams.value, { applyStatusClass: applyStatus.value }, dates))
  );
  delete dataparam.timers;
  const res = await getList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
      jobGradeDict: returnPositionDict(record.jobGradeDictCode),
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

// 入职办理
const handleOnboarding = async row => {
  EntryDialogRef.value.openDialog(row);
};

// 离职办理
const handleResign = async row => {
  ResignDialogRef.value.openDialog(row);
};

// 编辑
const editeClick = row => {
  editeDialogRef.value.openDialog(row);
};

// 详情
const lookDetail = row => {
  detailDialogRef.value.openDialog(row);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};

// 返回岗位名称
const returnPositionDict = code => {
  if (!code) return;
  let name = DC_LABOR_POSITION.value.find(item => item.dictKey == code)?.dictValue || '-';
  return name;
};
const tableSelectRows = ref([]);
// 多选
const handleSelectionChange = val => {
  data.multipleSelection = Array.from(val, ({ id }) => id);
  tableSelectRows.value = val;
};

/** 删除按钮操作 */
const handleDelete = () => {
  proxy
    .$confirm('是否确认删除参数编号为"' + data.multipleSelection + '"的数据项？')
    .then(async () => {
      return remove(data.multipleSelection);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

const mode = ref('');
const JudgmentDialogRef = ref(null);

const handleJudgmentDialogRefSubmit = data => {
  resetQuery();
};

const showJudgmentDialog = () => {
  if (!(tableSelectRows.value?.length > 0)) {
    proxy.$message.error('请先选择相关人员');
    return;
  }
  if (
    mode.value === 'BatchRecruitmentJudgment' &&
    !tableSelectRows.value.every(
      row => row.applyStatus === '复试已通过' || row.applyStatus === '确认入职'
    )
  ) {
    proxy.$message.error('请确保所选人员状态均为“待入职”或者“待确认入职”');
    return;
  }
  JudgmentDialogRef.value.show(JSON.parse(JSON.stringify(tableSelectRows.value)));
};

const doAction = action => {
  switch (action) {
    case 'BatchRecruitmentJudgment':
      mode.value = action;
      showJudgmentDialog();
      break;
    default:
      console.error('not initial action: ', action);
  }
};

// 点击tab
const handleClick = e => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  nextTick(() => {
    getData();
  });
};
const getLaborCompanyListFn = () => {
  getLaborCompanyList({ current: 1, size: 10000 }).then(res => {
    data.companyList = res.data.data.records.map(item => {
      return {
        value: item.id,
        label: item.name,
      };
    });
  });
};

const refusalToOnboard = () => {
  if (
    !tableSelectRows.value.every(
      row => row.applyStatus === '复试已通过' || row.applyStatus === '确认入职'
    )
  ) {
    proxy.$message.error('请确保所选人员状态均为“待入职”或者“待确认入职”');
    return;
  }
  proxy
    .$confirm('确认是否拒绝入职参数编号为"' + data.multipleSelection + '"的数据项？')
    .then(async () => {
      return Api.labor.laborRegister.refusalToOnboard(data.multipleSelection);
    })
    .then(() => {
      proxy.$message.success('拒绝入职成功');
      getData();
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}
</style>
