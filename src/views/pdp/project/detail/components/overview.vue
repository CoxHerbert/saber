<template>
  <div v-loading="loading" class="page-project-overview">
    <div class="top-box">
      <div class="row">
        <div class="logo"></div>
        <div class="right">
          <div v-if="info" class="row">
            <div class="title">{{ info.projectName }}({{ info.projectCode }})</div>
            <div class="button-box">
              <el-button
                @click="doAction('createDeliveryStart')"
                type="primary"
                v-if="!info.deliveryStartState"
                >创建交付启动会</el-button
              >
              <el-button @click="doAction('editProject')">编辑</el-button>
              <el-button
                @click="doAction('deleteProject')"
                :title="
                  info.projectCreateStatusId !== '1868943322877714433' ? '草稿状态才可以删除' : ''
                "
                :disabled="info.projectCreateStatusId !== '1868943322877714433'"
                >删除</el-button
              >
            </div>
          </div>
          <div class="top-content">
            <div v-for="(item, i) in topContentItems" :key="i" class="top-field-item">
              <div class="label">{{ item.label }}</div>
              <div class="value">
                <dc-dict
                  v-if="item.type === 'dc-dict'"
                  type="text"
                  :options="dictMaps[item.dictKey]"
                  :value="info[item.prop]"
                ></dc-dict>
                <span v-else-if="item.type === 'text'">{{ info[item.prop] || '-' }}</span>
                <dc-view
                  v-else-if="item.type === 'dc-view'"
                  v-model="info[item.prop]"
                  :objectName="item.objectName"
                ></dc-view>
                <dc-dict-key
                  type="text"
                  v-else-if="item.type === 'dc-dict-key'"
                  valueKey="dictKey"
                  :options="dictMaps[item.dictKey]"
                  :value="info.phaseDictId"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row-4-1">
      <div class="left">
        <div class="title">里程碑</div>
        <div class="step-box">
          <el-scrollbar width="100%">
            <div class="time-line-box" v-if="info?.milestoneList?.length > 0">
              <div class="time-line">
                <template v-for="(item, index) in info?.milestoneList || []">
                  <el-popover class="box-item" width="240px" :title="item.planName" placement="top">
                    <template #reference>
                      <div
                        :key="index"
                        class="time-line-item"
                        :style="{
                          '--color-item':
                            dictMaps.DC_PMS_PLAN_STATUS?.find(s => s.id === item.planStatusId)
                              ?.remark || 'rgba(187, 187, 187, 1)',
                          '--color-item-alpha': hex2Rgba(
                            dictMaps.DC_PMS_PLAN_STATUS?.find(s => s.id === item.planStatusId)
                              ?.remark,
                            0.3
                          ),
                        }"
                      >
                        <div
                          class="icon"
                          :class="{
                            actived: item.status === 'actived',
                            doing: item.status === 'doing',
                            waiting: item.status === 'doing',
                            disabled: item.status === 'disabled',
                          }"
                        ></div>

                        <div class="info">
                          <div class="item-title">{{ item.planName }}</div>
                          <div class="item-charge-person">
                            <span class="label">负责人</span>
                            <dc-view
                              v-model="item.handlePersonId"
                              objectName="user"
                              showKey="realName"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                    <template #default>
                      <div class="popover-content-box">
                        <div class="row">
                          <div class="label">负责人</div>
                          <div class="value">
                            <dc-view
                              v-model="item.handlePersonId"
                              objectName="user"
                              showKey="realName"
                            />
                          </div>
                        </div>
                        <div class="row">
                          <div class="label">状态</div>
                          <div
                            class="value"
                            :style="{
                              color: dictMaps.DC_PMS_PLAN_STATUS?.find(
                                s => s.id === item.planStatusId
                              )?.remark,
                            }"
                          >
                            {{
                              dictMaps.DC_PMS_PLAN_STATUS?.find(s => s.id === item.planStatusId)
                                ?.dictValue
                            }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="label">接收时间</div>
                          <div class="value">{{ item.releaseTime || '-' }}</div>
                        </div>
                        <div class="row">
                          <div class="label">完成时间</div>
                          <div class="value">{{ item.completedTime || '-' }}</div>
                        </div>
                      </div>
                    </template>
                  </el-popover>
                </template>
              </div>
            </div>
            <div v-else class="no-data">暂无数据</div>
          </el-scrollbar>
          <!-- <el-timeline>
            <el-timeline-item
              v-for="(item, index) in info?.milestoneList || []"
              :key="index"
              :color="item.endDate ? '#F78431' : ''"
            >
              <div class="activity">
                <div class="activity-title">
                  {{ item.planName }}
                </div>
                <div class="activity-timer" v-if="item.endDate">
                  预计完成时间：
                  <span>{{ item.endDate }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline> -->
        </div>
      </div>
      <div class="right">
        <div class="title">
          项目计划 <span class="title-btn" @click="activeTab('plan')">查看详情</span>
        </div>
        <div class="card-box-content">
          <div class="statistics">
            <div class="statistics-item">
              <div class="statistics-item_label">计划总数</div>
              <div class="statistics-item_value">{{ info?.planTotalNum || '0' }}</div>
            </div>
            <div class="statistics-item">
              <div class="statistics-item_label">已完成</div>
              <div class="statistics-item_value">{{ info?.planCompletionsNum || '0' }}</div>
            </div>
            <div class="statistics-item">
              <div class="statistics-item_label">未完成</div>
              <div class="statistics-item_value">{{ info?.planIncompleteNum || '0' }}</div>
            </div>
            <div class="statistics-item">
              <div class="statistics-item_label">已逾期</div>
              <div class="statistics-item_value">{{ info?.planOverdueNum || '0' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row-4-1">
      <div class="left flex-column">
        <div class="title">
          在制专案 <span class="title-btn" @click="activeTab('case')">查看详情</span>
        </div>
        <div class="za-box">
          <el-table :data="info.list" height="100%">
            <el-table-column prop="date" label="专案号" />
            <el-table-column prop="date" label="品名" />
            <el-table-column prop="date" label="数量" />
            <el-table-column prop="date" label="阶段" />
            <el-table-column prop="date" label="齐套日" width="180" />
            <el-table-column prop="date" label="ETD" width="180" />
            <el-table-column prop="date" label="齐套率" width="180" />
          </el-table>
        </div>
      </div>
      <div class="right no-bg">
        <div class="top">
          <div class="title">项目成员</div>
          <div class="member-box">
            <div v-for="(item, i) in info.dcPdpFuncFieldList" :key="i" class="info-item">
              <div class="label">
                <dc-dict-key
                  valueKey="dictKey"
                  :options="dictMaps.DC_PMS_PROJECT_ROLE"
                  :value="item.fieldCode"
                />
              </div>
              <div v-if="item.bindUserIds" class="value">
                <dc-view
                  v-for="(u, k) in item.bindUserIds?.split(',')"
                  :key="k"
                  :modelValue="u"
                  objectName="user"
                  showKey="realName"
                />
              </div>
              <div class="value" v-else>-</div>
            </div>
            <!-- <div class="info-item">
              <div class="label">电气DRI</div>
              <div class="value">
                {{ info.electricalDriName || '-' }}
              </div>
            </div>
            <div class="info-item">
              <div class="label">软件DRI</div>
              <div class="value">{{ info.softwareDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="label">BDDRI</div>
              <div class="value">{{ info.bdDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="label">TPMDRI</div>
              <div class="value">{{ info.tpmDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="label">PMCDRI</div>
              <div class="value">{{ info.pmDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="label">视觉DRI</div>
              <div class="value">
                {{ info.versionDriName || '-' }}
              </div>
            </div> -->
          </div>
        </div>
        <div class="bottom">
          <div class="title">暂定模块</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, toRefs, onMounted, computed } from 'vue';
import Api from '@/api/index';
import { useRoute, useRouter } from 'vue-router';
import tastkProgress from './task-progress.vue';
import { getPlanTypeNameColor } from '@/utils/util';

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();

const { projectId } = route.params;
const deliveryStartState = ref(false);

const hex2Rgba = (hex, opacity = 0.1) => {
  if (hex) {
    return (
      'rgba(' +
      parseInt('0x' + hex.slice(1, 3)) +
      ',' +
      parseInt('0x' + hex.slice(3, 5)) +
      ',' +
      parseInt('0x' + hex.slice(5, 7)) +
      ',' +
      opacity +
      ')'
    );
  } else {
    return 'rgba(0,0,0,0.1)';
  }
};

const dictMaps = ref({});

const getDictData = async () => {
  const res = await proxy.useAsyncCache([
    { key: 'DC_PMS_PROJECT_ROLE' },
    // 订单类型
    { key: 'DC_PMS_PROJECT_ORDER' },
    // 项目阶段
    { key: 'DC_PMS_PROJECT_PHASE' },
    // 项目类型
    { key: 'DC_PMS_PROJECT_TYPE' },
    // 计划状态
    { key: 'DC_PMS_PLAN_STATUS' },
    // 行业类别
    { key: 'DC_CRM_SECTOR' },
  ]);
  dictMaps.value = res?.value;
  return true;
};

const compData = reactive({
  loading: false,
  info: {
    list: [],
  },
  topContentItems: [
    {
      label: '需求单',
      prop: 'demandCode',
      type: 'text',
    },

    {
      label: '客户',
      prop: 'customerId',
      type: 'dc-view',
      objectName: 'customer',
    },
    {
      label: '终端客户代码',
      prop: 'customerCode',
      type: 'text',
    },
    {
      label: '订单类型',
      prop: 'orderTypeDictId',
      type: 'dc-dict',
      dictKey: 'DC_PMS_PROJECT_ORDER',
    },
    {
      label: '项目类型',
      prop: 'projectDictId',
      type: 'dc-dict',
      dictKey: 'DC_PMS_PROJECT_TYPE',
    },
    {
      label: '项目阶段',
      prop: 'phaseDictId',
      type: 'dc-dict-key',
      dictKey: 'DC_PMS_PROJECT_PHASE',
    },
    {
      label: '行业类别',
      prop: 'industryDictId',
      type: 'dc-dict',
      dictKey: 'DC_CRM_SECTOR',
    },
    {
      label: '创建时间',
      prop: 'createTime',
      type: 'text',
    },
    {
      label: '所属组织',
      prop: 'orgId',
      type: 'dc-view',
      objectName: 'org',
    },
  ],
  activities: [
    {
      content: '方案设计',
      timestamp: '2018-04-15',
    },
    {
      content: '概念评审',
      timestamp: '2018-04-13',
    },
    {
      content: '方案确认',
      timestamp: '2018-04-11',
    },
    {
      content: 'xxx计划',
      timestamp: '2018-04-11',
    },
    {
      content: 'xxx计划',
    },
    {
      content: 'xxx计划',
    },
  ],
  open: false,
  formData: {
    institutionsDriId: null,
    electricalDriId: null,
    softwareDriId: null,
    bdDriId: null,
    tpmDriId: null,
    pmDriId: null,
    versionDriId: null,
  },
  rules: {
    institutionsDriId: [{ required: true, message: '请选择机构DRI', trigger: 'blur' }],
    // electricalDriId: [{ required: true, message: '请选择电气DRI', trigger: 'blur' }],
    // softwareDriId: [{ required: true, message: '请选择软件DRI', trigger: 'blur' }],
    bdDriId: [{ required: true, message: '请选择BDDRI', trigger: 'blur' }],
    tpmDriId: [{ required: true, message: '请选择TPMDRI', trigger: 'blur' }],
    // pmDriId: [{ required: true, message: '请选择PMDRI', trigger: 'blur' }],
    // versionDriId: [{ required: true, message: '请选择视觉DRI', trigger: 'blur' }],
  },
});

const { loading, info, activities, open, formData, rules, topContentItems } = toRefs(compData);

onMounted(async () => {
  await getDictData();
  await getDetail();
  // await getDeliveryStartState();
});

const taskItems = computed(() => {
  if (info.value?.plannedProgressChart) {
    return (info.value.plannedProgressChart || []).map(item => {
      return {
        ...item,
        progress: parseFloat(item.value),
        color: getPlanTypeNameColor(item.name) || '#11AFA7',
      };
    });
  }
  return [];
});
/** 详情 **/
const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.project.detail({ id: projectId });
    const { code, data } = res.data;
    if (code === 200) {
      info.value = { ...data, orgId: data.orgId ? `${data.orgId}` : null };
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

// /** 获取交付启动会状态 **/
// const getDeliveryStartState = async () => {
//   const res = await Api.pdp.deliverystart.list({
//     projectId,
//   });
//   const { code, data } = res.data;
//   if (code === 200) {
//     deliveryStartState.value = Array.isArray(data.records) && !data.records.length;
//   }
// };

/** 提交项目编辑 **/
const submitProject = async () => {
  loading.value = true;
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const from = {
        ...formData.value,
        id: route.params.projectId,
      };
      const res = await Api.pdp.project.submit(from);
      const { code, msg } = res.data;
      if (code === 200) {
        open.value = false;
        getDetail();
        proxy.$message.success(msg);
      }
    }
  });
  loading.value = false;
};

/** 编辑项目 **/
const editProject = () => {
  router.push({
    path: `/pdp/project/submit/${info.value.id}`,
  });
  // open.value = true;
  // formData.value = {
  //   institutionsDriId: info.value.institutionsDriId,
  //   electricalDriId: info.value.electricalDriId,
  //   softwareDriId: info.value.softwareDriId,
  //   bdDriId: info.value.bdDriId,
  //   tpmDriId: info.value.tpmDriId,
  //   pmDriId: info.value.pmDriId,
  //   versionDriId: info.value.versionDriId,
  // };
};

/** 删除项目 **/
const deleteProject = async () => {
  const res = await Api.pdp.project.delete({ ids: projectId });
  const { code, msg } = res.data;
  if (code == 200) {
    router.push({
      path: `/pdp/project/list`,
    });
    proxy.$message.success(msg);
  }
};

/** 创建交付启动会 **/
const createDeliveryStart = async () => {
  const fields = [
    'projectCode',
    'projectName',
    'industryDictId',
    'projectDictId',
    // 'institutionsDriId',
    // 'electricalDriId',
    // 'softwareDriId',
    // 'bdDriId',
    // 'tpmDriId',
    // 'pmDriId',
    // 'versionDriId',
    'opportunitiyId',
  ];

  let query = {
    projectId: info.value.id,
    quipmentDictId: info.value.quipmentDictId,
  };
  info.value.dcPdpFuncFieldList.forEach(row => {
    if (row.bindUserIds) {
      query[row.filedKey] = row.bindUserIds;
    }
  });
  fields.forEach(f => {
    query[f] = info.value[f];
  });

  router.push({
    path: '/pdp/deliverystart/addorEdite',
    query: {
      type: 'add',
      ...query,
    },
  });
};

const doAction = action => {
  switch (action) {
    case 'createDeliveryStart':
      createDeliveryStart();
      break;
    case 'editProject':
      editProject();
      break;
    case 'submitProject':
      submitProject();
      break;
    case 'deleteProject':
      deleteProject();
      break;
    case 'closeDrawer':
      open.value = false;
      break;

    default:
      break;
  }
};

const activeTab = name => {
  router.push({
    path: `/pdp/project/detail/${name}/${projectId}`,
  });
};
</script>
<style lang="scss" scoped>
.popover-content-box {
  min-width: 200px;
  .row {
    display: flex;
    flex-flow: row nowrap;

    .label {
      white-space: nowrap;
      &::after {
        content: '：';
      }
    }
  }
}
.page-project-overview {
  width: 100%;
  height: 100%;

  .top-box {
    padding: 32px 24px;
    background-color: #fff;

    .logo {
      width: 178px;
      height: 178px;
      border-radius: 9px;
      background: linear-gradient(to bottom, #f7f7f7 0%, #efefef 100%);
    }

    .right {
      margin-left: 10px;
      flex: 1;
      .row {
        justify-content: space-between;
      }
      .title {
        font-weight: bold;
        font-size: 32px;
        color: #333333;
        line-height: 32px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        margin-bottom: 16px;
      }

      .button-box {
        justify-self: flex-end;
      }
    }

    .top-content {
      display: flex;
      min-height: 130px;
      flex-flow: row wrap;
      justify-content: flex-start;
      background-color: rgba(246, 248, 250, 1);
      box-sizing: border-box;
      padding: 24px 16px 0 24px;
    }

    .top-field-item {
      display: flex;
      width: 19%;
      margin-right: 1%;
      overflow: hidden;
      margin-bottom: 24px;
      .label {
        font-weight: 400;
        font-size: 16px;
        color: #666666;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        white-space: nowrap;
        &::after {
          content: ':';
          margin-right: 4px;
        }
      }

      .value {
        display: block;
        flex: 1;
        overflow: hidden;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        white-space: nowrap;
        word-break: break-all;
        text-overflow: ellipsis;
      }

      :deep(.dc-view) {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .row,
  .row-4-1 {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }

  .row-4-1 {
    margin-top: 20px;
    .title {
      width: 100%;
      font-weight: bold;
      font-size: 16px;
      color: #333333;
      line-height: 16px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      display: flex;
      justify-content: space-between;

      .title-btn {
        justify-self: flex-end;
        font-weight: 400;
        font-size: 14px;
        color: #848488;
        line-height: 14px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        cursor: pointer;
      }
    }

    .left {
      padding: 20px;
      background-color: #fff;
      width: calc(75% - 16px);
      margin-right: 16px;
    }

    .right {
      background-color: #fff;
      padding: 20px;
      width: 25%;

      &.no-bg {
        padding: 0;
        background-color: transparent;
      }

      .top,
      .bottom {
        padding: 24px;
        background-color: #fff;
      }
      .top {
        margin-bottom: 16px;
      }
    }

    .statistics {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;

      .statistics-item {
        margin-top: 16px;
        flex: 1;
        & + .statistics-item {
          margin-left: 16px;
        }

        &:nth-child(4n + 2) {
          .statistics-item_value {
            color: #23c69f;
          }
        }
        &:nth-child(4n + 4) {
          .statistics-item_value {
            color: #e12137;
          }
        }
      }

      .statistics-item_label {
        font-weight: 400;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        line-height: 14px;
        text-align: center;
        font-style: normal;
        text-transform: none;
        white-space: nowrap;
      }
      .statistics-item_value {
        font-weight: bold;
        font-size: 24px;
        color: #333333;
        line-height: 24px;
        text-align: center;
        font-style: normal;
        text-align: center;
        margin-top: 16px;
      }
    }
  }

  .step-box {
    width: 100%;
    overflow: hidden;
  }
  .time-line-box {
    text-align: center;
  }
  .time-line {
    min-width: 60%;
    width: auto;
    display: inline-flex;
    flex-flow: row nowrap;
    margin-top: 14px;
    box-sizing: border-box;
    justify-content: center;
    .time-line-item {
      padding-bottom: 20px;
      min-width: 140px;
      &:not(:last-child) {
        flex: 1;
      }
      &:last-child {
        width: auto;
      }
      position: relative;
      &:last-child {
        &::after {
          display: none;
        }
      }
      &::after {
        content: ' ';
        position: absolute;
        width: calc(100% - 16px);
        height: 1px;
        background-color: var(--color-item);
        top: 8px;
        left: 16px;
        z-index: 1;
      }
    }
    .icon {
      z-index: 10;
      border-radius: 50%;
      width: 10px;
      height: 10px;
      box-sizing: content-box;
      border: 3px solid var(--color-item-alpha);
      position: relative;
      &::after {
        content: ' ';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: var(--color-item);
      }
    }

    .info {
      padding-top: 8px;
      padding-left: 8px;
      .item-title {
        font-weight: 600;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        white-space: nowrap;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 40px;
        box-sizing: border-box;
      }
      .item-charge-person {
        font-size: 14px;
        line-height: 14px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        margin-top: 12px;
        .label {
          color: #666666;
          &::after {
            content: '：';
          }
        }
      }
    }
  }

  .member-box {
    display: flex;
    flex-flow: row wrap;

    .info-item {
      text-align: center;
      background: #f6f8fa;
      width: calc(33% - 16px);
      margin-top: 16px;
      &:nth-child(3n + 1),
      &:nth-child(3n + 2) {
        margin-right: 16px;
      }

      .label {
        padding-top: 8px;
        padding-bottom: 8px;
        font-size: 14px;
        color: #666666;
        line-height: 14px;
        text-align: center;
        font-style: normal;
        text-transform: none;
      }

      .value {
        padding-bottom: 8px;
        :deep(.dc-view) {
          width: 100%;
          padding: 0 8px;
          word-break: break-all;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }

  .flex-column {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    .title {
      padding-bottom: 16px;
    }
    .za-box {
      flex: 1;
    }
  }

  .no-data {
    width: 100%;
    height: 100%;
    color: #999;
    font-size: 14px;
    min-height: 80px;
    display: flex;
    align-items: center;
    align-content: center;
    line-height: 80px;
  }
}
</style>
