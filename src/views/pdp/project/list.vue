<template>
  <div class="content-warp">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfigProps"
        @reset="handleReset"
        @search="handleSearch"
      ></dc-search>
    </div>
    <div class="operate-container">
      <el-button
        type="primary"
        icon="Plus"
        @click="handleCreateProject"
        v-permission="{ id: 'DC_PDP_PRO_LIST_ADD' }"
        >项目立项</el-button
      >
    </div>
    <!--  @scroll="pageScroll" -->
    <div class="card-container" v-loading="loading">
      <template
        v-if="dictData.DC_PMS_PROJECT_PHASE && dictData.DC_PMS_PROJECT_CREATE_STATUS"
      ></template>
      <div
        class="project-item"
        :style="{
          '--color-remark':
            findById(dictData.DC_PMS_PROJECT_PHASE, item.phaseDictId)?.remark || '#000',
        }"
        v-for="(item, index) in dataList"
        :key="index"
      >
        <div class="project-header" @click="goDetail(item)">
          <span class="status">{{
            item.projectCreateStatusId === '1868943255362002945'
              ? findById(dictData.DC_PMS_PROJECT_PHASE, item.phaseDictId)?.dictValue
              : dictData.DC_PMS_PROJECT_CREATE_STATUS?.find(
                  d => d.id === item.projectCreateStatusId
                )?.dictValue
          }}</span>
          <div class="project-name-box">
            <span class="project-name"
              >{{ item.projectName }}
              <template v-if="item.projectCode"> ({{ item.projectCode }})</template></span
            >
          </div>
          <div class="star-wrap" @click.stop="doMark(item)">
            <el-button :type="item.remarkColor" icon="Star" circle />
          </div>
          <div
            class="star-wrap ml-5"
            @click.stop="handleDelete(item)"
            v-if="queryParams.levelClass == '草稿中'"
          >
            <el-button icon="Delete" circle />
          </div>
        </div>
        <div class="project-content">
          <div class="w-100">
            <div class="w-50 row-item">
              <span class="label">项目类型</span>
              <span v-if="dictData.DC_PMS_PROJECT_TYPE" class="value">
                {{
                  findById(dictData.DC_PMS_PROJECT_TYPE, item.projectDictId, 'id')?.dictValue || '-'
                }}
              </span>
            </div>
            <div class="w-50 row-item">
              <span class="label">行业类型</span>
              <span class="value">
                {{ findById(dictData.DC_CRM_SECTOR, item.industryDictId, 'id')?.dictValue || '-' }}
              </span>
            </div>
          </div>
          <!-- <div class="w-100 row-item">
            <span class="label">项目周期</span>
            <span class="value"> {{ item.projectStartDate }}-{{ item.projectFinishDate }} </span>
          </div> -->
          <div class="w-100 row-item">
            <span class="label">负责人</span>
            <span class="value">
              <dc-view v-model="item.tpmDriId" objectName="user" showKey="realName" />
            </span>
          </div>
          <div class="w-100 row-item">
            <span class="label">项目进度</span>
            <span class="value"> {{ item.projectProgress || 0 }}% </span>
          </div>
          <div class="w-100">
            <el-progress
              class="w-full"
              :percentage="item.projectProgress"
              :show-text="false"
              :color="
                dictData.DC_PMS_PROJECT_PHASE.find(dict => dict?.id === item?.phaseDictId)
                  ?.remark || '#000'
              "
            />
          </div>
          <div class="statistics-group w-full">
            <div class="statistics-item">
              <div class="statistics-item_label">计划总数</div>
              <div class="statistics-item_value value_1">{{ item.planTotalNum || 0 }}</div>
            </div>
            <div class="statistics-item">
              <div class="statistics-item_label">已完成</div>
              <div class="statistics-item_value value_2">
                {{ item.planCompletionsNum || 0 }}
              </div>
            </div>
            <div class="statistics-item">
              <div class="statistics-item_label">未完成</div>
              <div class="statistics-item_value value_3">{{ item.planIncompleteNum || 0 }}</div>
            </div>
            <div class="statistics-item">
              <div class="statistics-item_label">已逾期</div>
              <div class="statistics-item_value value_4">{{ item.planOverdueNum || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
  </div>
</template>
<script setup name="Projects">
import { reactive, toRefs, onMounted, computed } from 'vue';
import Api from '@/api/index';
import dayjs from 'dayjs';

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();

// const { DC_CRM_SECTOR, DC_PMS_PROJECT_TYPE, DC_PMS_PROJECT_PHASE, DC_PMS_PROJECT_CREATE_STATUS } =
//   proxy.useCache([
//     { key: 'DC_CRM_SECTOR' },
//     { key: 'DC_PMS_PROJECT_TYPE' },
//     { key: 'DC_PMS_PROJECT_PHASE' },
//     { key: 'DC_PMS_PROJECT_CREATE_STATUS' },
//   ]);

const data = reactive({
  loading: true,
  pageId: '',
  queryParams: {
    levelClass: '',
    current: 1,
    size: 12,
  },
  total: 0,
  // tabData: [
  //   { label: '全部项目', value: '1' },
  //   { label: '我的创建', value: '2' },
  //   { label: '我参与的', value: '3' },
  //   { label: '个人项目集', value: '4' },
  //   { label: '草稿中', value: '5' },
  // ],
  dataList: [],
  collectViewList: [],
  dictData: {},
});

const {
  loading,
  pageId,
  queryParams,
  total,
  /*  tabData,  */ dataList,
  collectViewList,
  dictData,
} = toRefs(data);

const searchConfigProps = computed(() => {
  return {
    resetExcludeKeys: ['page', 'current', 'levelClass'],
    tabConfig: {
      prop: 'levelClass',
      items: [
        { label: '全部项目', value: '' },
        { label: '我的创建', value: '我的创建' },
        { label: '我参与的', value: '我参与的' },
        { label: '个人项目集', value: '个人项目集' },
        { label: '草稿中', value: '草稿中' },
      ],
    },
    searchItemConfig: {
      paramType: {
        projectDictId: {
          label: '项目类型',
          type: 'select',
          withGroup: false,
          options: dictData.value.DC_PMS_PROJECT_TYPE,
          labelKey: 'label',
          placeholder: `请选择项目类型`,
          valueKey: 'value',
          paramKey: 'projectDictId',
        },
        projectName: {
          label: '项目名称',
          type: 'input',
          paramKey: 'projectName',
          props: {
            placeholder: '请输入项目名称',
          },
        },
        projectCode: {
          label: '项目编码',
          type: 'input',
          paramKey: 'projectCode',
          props: {
            placeholder: '请输入项目编码',
          },
        },
        phaseDictId: {
          label: '阶段',
          type: 'select',
          withGroup: true,
          options: dictData.value.DC_PMS_PROJECT_PHASE,
          labelKey: 'dictValue',
          placeholder: `请选择阶段`,
          valueKey: 'dictKey',
          paramKey: 'phaseDictId',
        },
        industryDictId: {
          label: '行业类别',
          type: 'select',
          withGroup: false,
          options: dictData.value.DC_CRM_SECTOR,
          labelKey: 'dictValue',
          placeholder: `请选择行业类别`,
          valueKey: 'dictKey',
          paramKey: 'industryDictId',
        },
        projectDate: {
          label: '项目周期',
          type: 'dc-date-range',
          paramKey: 'projectDate',
        },
      },
    },
  };
});

const findById = (treeData, id, key = 'dictKey') => {
  let result = null;
  (treeData || []).forEach(item => {
    if (item?.[key] === id) {
      result = item;
    } else if (item.children && item.children.length > 0) {
      return findById(item.children, id);
    }
  });

  return result;
};

const getDictData = async () => {
  const res = await proxy.getMultipleDict(
    'DC_CRM_SECTOR,DC_PMS_PROJECT_TYPE,DC_PMS_PROJECT_PHASE,DC_PMS_PROJECT_CREATE_STATUS'
  );
  dictData.value = {
    ...dictData.value,
    ...(res || {}),
  };
};

onMounted(async () => {
  await getDictData();
  pageId.value = route.params.id;
  if (pageId.value !== 'create') getData();
});
// 获取列表数据
const getData = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams.value,
      startTime: undefined,
      endTime: undefined,
      projectStartDate: queryParams.value.startTime
        ? dayjs(queryParams.value.startTime).format('YYYY-MM-DD 00:00:00')
        : '',
      projectFinishDate: queryParams.value.endTime
        ? dayjs(queryParams.value.endTime).format('YYYY-MM-DD 23:59:59')
        : '',
    };
    const res = await Api.pdp.project.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      if (!data.records?.length > 0) {
        loading.value = false;
        return;
      }
      dataList.value = Array.isArray(data.records)
        ? data.records.map(item => {
            try {
              if (isNumericString(item.phaseDictId)) {
                item.dictType = 'id';
              } else {
                item.dictType = 'code';
              }
            } catch (err) {}
            try {
              if (isNumericString(item.projectCreateStatusId)) {
                item.dictType2 = 'id';
              } else {
                item.dictType2 = 'code';
              }
            } catch (err) {}
            return item;
          })
        : [];
      total.value = data.total;
      await collectViewData();
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

function isNumericString(str) {
  // 使用正则表达式检测字符串是否为数字字符串
  const regex = /^\d+$/;
  return regex.test(str);
}

// 滚动方法
const pageScroll = e => {
  // 滚动条滚动时，距离顶部的距离
  const scrollTop = e.target.scrollTop;
  // 可视区的高度
  const windowHeight = e.target.clientHeight;
  // 滚动条的总高度
  const scrollHeight = e.target.scrollHeight;
  // 当滚动条滚动到底部 并且 当前数据小于总数时进行翻页
  if (
    scrollTop + windowHeight === scrollHeight &&
    dataList.value.length < total.value &&
    !loading.value
  ) {
    queryParams.value.current++;
    // 获取下一页的数据
    getData();
  } else if (scrollTop == 0 && !loading.value && queryParams.value.current > 1) {
    queryParams.value.current--;
    // 获取下一页的数据
    getData();
  }
};

// 点击搜索
const handleSearch = () => {
  queryParams.value.current = 1;
  dataList.value = [];
  getData();
};

//点击重置
const handleReset = () => {
  queryParams.value = {
    current: 1,
    size: 12,
  };
  queryParams.value.current = 1;
  proxy.resetForm('searchFromRef');
  getData();
};

// tab点击
const handleClick = tab => {
  if (tab === '4') {
    queryParams.value = {
      ...queryParams.value,
      current: 1,
      levelClass: tab.props.label,
    };
    getData();
  } else {
    queryParams.value = {
      ...queryParams.value,
      current: 1,
      levelClass: tab.props.label,
    };
    getData();
  }
};

// 处理项目立项
const handleCreateProject = () => {
  router.push({
    path: `/pdp/project/submit/create`,
  });
};

// 查找收藏
const collectViewData = async () => {
  const res = await Api.system.remark.collectView('PROJECT');
  const { code, data } = res.data;
  if (code === 200) {
    collectViewList.value = data;
    // 合并项目数据，初始化项目的remarkColor
    dataList.value.forEach(item => {
      remarkStatus(item);
    });
  }
};

const doMark = project => {
  const compareValue = project.id + ',';
  const collect = collectViewList.value;
  const targetIds = collect ? (collect.targetIds === null ? '' : collect.targetIds) : '';
  if (collect && collect.targetIds && collect.targetIds.includes(compareValue)) {
    // 已收藏
    // 取消收藏
    collect.targetIds = targetIds.replace(compareValue, '');
  } else {
    // 未收藏
    // 收藏
    collect.targetIds = targetIds + compareValue;
  }
  collection(collect, project, compareValue);
};

const remarkStatus = project => {
  const compareValue = project.id + ',';
  project.remarkColor = changeRemarkColor(compareValue);
};

const changeRemarkColor = compareValue => {
  if (
    collectViewList.value &&
    collectViewList.value.targetIds &&
    collectViewList.value.targetIds.includes(compareValue)
  ) {
    return 'warning';
  } else {
    return 'default';
  }
};

// 前往详情
const goDetail = project => {
  // 草稿
  if (
    project.projectCreateStatusId === '1868943322877714433' ||
    project.projectCreateStatusId === '1868943423935275009'
  ) {
    router.push({
      path: `/pdp/project/submit/${project.id}`,
    });
  } else {
    router.push({
      path: `/pdp/project/detail/overview/${project.id}`,
    });
  }
};

// 收藏
const collection = async (collect, project, compareValue) => {
  const res = await Api.system.remark.collectRemark('PROJECT', collect);
  const { code, msg } = res.data;
  if (code === 200) {
    await getData();
    proxy.$message.success(msg);
    collectViewList.value = collect;
    project.remarkColor = changeRemarkColor(compareValue);
  }
};

// 删除
const handleDelete = async item => {
  const ids = item.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.project.delete({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      handleSearch();
    });
};
</script>
<style lang="scss" scoped>
.content-warp {
  display: flex;
  flex-flow: column nowrap;
}

.card-item_head {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
.footer {
  padding-top: 10px;
}
.card-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 0 8px;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;

  .project-item {
    width: 24%;
    min-width: 240px;
    border-radius: 8px;
    background-color: #f6f8fa;
    margin-bottom: 16px;
    height: 266px;
    margin-right: 1%;
  }

  .project-header {
    width: 100%;
    height: 48px;
    border-radius: 8px 8px 0 0;
    background-color: var(--color-remark);
    padding: 8px 16px 0;
    box-sizing: border-box;
    display: flex;
    cursor: pointer;
    flex-flow: row nowrap;

    .project-name-box {
      position: relative;
      flex: 1;
      margin-right: 8px;
    }

    .status {
      transform: translateY(4px);
      background-color: #fff;
      border-radius: 4px;
      color: var(--color-remark);
      font-size: 12px;
      line-height: 24px;
      height: 24px;
      padding: 0 6px;
      text-align: center;
      font-style: normal;
      text-transform: none;
      font-weight: bold;
      white-space: nowrap;
      word-break: break-all;
      margin-right: 8px;
    }
    .project-name {
      width: 100%;
      font-weight: bold;
      transform: translateY(4px);
      font-size: 15px;
      color: #ffffff;
      line-height: 24px;
      height: 24px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      flex: 1;
      white-space: nowrap;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      box-sizing: border-box;
      padding-right: 8px;
      box-sizing: border-box;
      position: absolute;
    }

    &:hover {
      .project-name {
        margin-right: 8px;
        padding: 0 8px 4px 4px;
        position: absolute;
        overflow: auto;
        width: 100%;
        height: auto;
        overflow: auto;
        color: var(--color-remark);
        background-color: #fff;
        white-space: wrap;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .project-content {
    box-sizing: border-box;
    padding: 32px 16px 20px;
    .w-100 {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      margin-bottom: 16px;
    }
    .w-50 {
      width: 50%;
      display: flex;
      flex-flow: row nowrap;
    }
    .label {
      white-space: nowrap;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
      line-height: 14px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      display: inline-block;
      min-width: 70px;
      &::after {
        content: ':';
      }
    }
    .value {
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      flex: 1;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      line-height: 14px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }

  .statistics-group {
    display: flex;

    .statistics-item {
      display: flex;
      flex-direction: column;
      flex: 1;
      text-align: center;

      &_label {
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        line-height: 14px;
        text-align: center;
        font-style: normal;
        text-transform: none;
      }

      &_value {
        margin-top: 8px;
        font-weight: bold;
        &.value {
          font-size: 14px;
          &_1 {
            color: #333;
          }

          &_2 {
            color: #23c69f;
          }

          &_3 {
            color: #f78431;
          }

          &_4 {
            color: #e12137;
          }
        }
      }
    }
  }
}

.operate-container {
  padding-left: 10px;
}
</style>
