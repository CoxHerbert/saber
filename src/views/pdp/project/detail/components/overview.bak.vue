<template>
  <div class="content-wrap comp-project-overview">
    <div class="left-group">
      <div class="row-box card-box">
        <div class="card-box-head">{{ info.projectName || '-' }}</div>
        <div class="card-box-content">
          <div class="info-group">
            <div class="info-item">
              <div class="info-item_label">客户：</div>
              <div class="info-item_value">
                <dc-view v-model="info.customerId" objectName="customer" />
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">终端客户：</div>
              <div class="info-item_value">
                {{ info.endCustomerId || '-' }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">订单类型：</div>
              <div class="info-item_value">
                <dc-dict
                  type="text"
                  :options="DC_PMS_PROJECT_ORDER"
                  :value="info.orderTypeDictId"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">项目阶段：</div>
              <div class="info-item_value">
                <dc-dict-key
                  type="text"
                  valueKey="dictKey"
                  :options="DC_PMS_PROJECT_PHASE"
                  :value="info.phaseDictId"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">项目类型：</div>
              <div class="info-item_value">
                <dc-dict type="text" :options="DC_PMS_PROJECT_TYPE" :value="info.projectDictId" />
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">行业类别：</div>
              <div class="info-item_value">
                <dc-dict type="text" :options="DC_CRM_SECTOR" :value="info.industryDictId" />
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">时间：</div>
              <div class="info-item_value">{{ info.updateTime }}</div>
            </div>
          </div>
          <div class="project-info">
            <div class="info-item_label">相关附件：</div>
            <div class="info-item_value">
              <dc-upload
                v-model="info.fileId"
                :isUpload="false"
                :isRemove="false"
                pain
                v-if="info.fileId"
              />
              <span v-else>-</span>
            </div>
          </div>
          <div class="project-info-btn">
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
      </div>
      <div class="row-box">
        <div class="card-box">
          <div class="card-box-title">项目计划 <span class="title-btn">查看详情</span></div>
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
        <div class="card-box">
          <div class="card-box-title">计划进度</div>
          <div class="card-box-content">
            <tastkProgress :items="taskItems" />
          </div>
        </div>
      </div>
      <div class="row-box card-box">
        <div class="card-box-title">
          在制专案
          <span class="title-btn">查看详情</span>
        </div>
        <div class="card-box-content">
          <el-table :data="info.list" height="100%">
            <el-table-column prop="date" label="专案号" width="180" />
            <el-table-column prop="name" label="专案名称" width="180" />
            <el-table-column prop="address" label="处理人" />
            <el-table-column prop="address" label="计划达成日" width="140" />
            <el-table-column prop="address" label="工期" />
          </el-table>
        </div>
      </div>
    </div>
    <div class="right-group">
      <div class="row-box card-box">
        <div class="card-box-title">里程碑</div>
        <div class="card-box-content">
          <div v-if="info?.milestoneList?.length > 0">
            <el-timeline class="timeline">
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
            </el-timeline>
            <!-- <el-timeline class="timeline">
              <el-timeline-item
                v-for="(item, index) in activities"
                :key="index"
                :color="item.timestamp ? '#F78431' : ''"
              >
                <div class="activity">
                  <div class="activity-title">
                    {{ item.content }}
                  </div>
                  <div class="activity-timer" v-if="item.timestamp">
                    完成时间：
                    <span>{{ item.timestamp }}</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline> -->
          </div>
          <div v-else>
            <div class="no-data">暂无数据</div>
          </div>
        </div>
      </div>
      <div class="row-box card-box">
        <div class="card-box-title">项目部门DRI</div>
        <div class="card-box-content right-bottom">
          <div class="user-group">
            <div class="info-item-header">
              <div class="info-item-header_label">所属组织</div>
              <div class="info-item-header_value">
                <dc-view v-model="info.orgId" objectName="org" />
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">机构DRI</div>
              <div class="info-item_value">{{ info.institutionsDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">电气DRI</div>
              <div class="info-item_value">
                {{ info.electricalDriName || '-' }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-item_label">软件DRI</div>
              <div class="info-item_value">{{ info.softwareDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">BDDRI</div>
              <div class="info-item_value">{{ info.bdDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">TPMDRI</div>
              <div class="info-item_value">{{ info.tpmDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">PMCDRI</div>
              <div class="info-item_value">{{ info.pmDriName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">视觉DRI</div>
              <div class="info-item_value">
                {{ info.versionDriName || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-drawer v-model="open" size="600px" title="编辑项目部门DRI" @close="doAction('closeDrawer')">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        class="form-itme-width_50"
        label="机构DRI"
        id="institutionsDriId"
        prop="institutionsDriId"
      >
        <dc-select-user
          v-model="formData.institutionsDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
      <el-form-item
        class="form-itme-width_50"
        label="电气DRI"
        id="electricalDriId"
        prop="electricalDriId"
      >
        <dc-select-user
          v-model="formData.electricalDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
      <el-form-item
        class="form-itme-width_50"
        label="软件DRI"
        id="softwareDriId"
        prop="softwareDriId"
      >
        <dc-select-user
          v-model="formData.softwareDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
      <el-form-item class="form-itme-width_50" label="BDDRI" id="bdDriId" prop="bdDriId">
        <dc-select-user
          v-model="formData.bdDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
      <el-form-item class="form-itme-width_50" label="TPMDRI" id="tpmDriId" prop="tpmDriId">
        <dc-select-user
          v-model="formData.tpmDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
      <el-form-item class="form-itme-width_50" label="PMDRI" id="pmDriId" prop="pmDriId">
        <dc-select-user
          v-model="formData.pmDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
      <el-form-item
        class="form-itme-width_50"
        label="视觉DRI"
        id="versionDriId"
        prop="versionDriId"
      >
        <dc-select-user
          v-model="formData.versionDriId"
          :width="'500px'"
          :multiple="true"
          :multiple-limit="1"
          :max-collapse-tags="10"
          :clearable="true"
          returnType="string"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="doAction('submitProject')">提交</el-button>
        <el-button @click="doAction('closeDrawer')">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup name="Overview">
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
const { DC_PMS_PROJECT_ORDER, DC_PMS_PROJECT_PHASE, DC_PMS_PROJECT_TYPE, DC_CRM_SECTOR } =
  proxy.useCache([
    // 订单类型
    { key: 'DC_PMS_PROJECT_ORDER' },
    // 项目阶段
    { key: 'DC_PMS_PROJECT_PHASE' },
    // 项目类型
    { key: 'DC_PMS_PROJECT_TYPE' },
    // 行业类别
    { key: 'DC_CRM_SECTOR' },
  ]);
const compData = reactive({
  loading: false,
  info: {
    list: [],
  },
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

const { loading, info, activities, open, formData, rules } = toRefs(compData);

onMounted(async () => {
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
      info.value = data;
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
  open.value = true;
  formData.value = {
    institutionsDriId: info.value.institutionsDriId,
    electricalDriId: info.value.electricalDriId,
    softwareDriId: info.value.softwareDriId,
    bdDriId: info.value.bdDriId,
    tpmDriId: info.value.tpmDriId,
    pmDriId: info.value.pmDriId,
    versionDriId: info.value.versionDriId,
  };
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
  const params = {
    projectId,
  };
  const res = await Api.pdp.deliverystart.createDelivered(params);
  const { code, data } = res.data;
  if (code == 200) {
    router.push({
      path: '/pdp/deliverystart/addorEdite',
      query: {
        type: 'edit',
        id: data.id,
      },
    });
  }
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
</script>
<style lang="scss" scoped>
:deep(.el-timeline-item) {
  padding-bottom: 20px !important;
}
.content-wrap {
  display: flex;
  height: 100%;
  gap: 8px;
  .left-group {
    flex: 1;
    .row-box:nth-child(1) {
      .card-box-content {
        display: inline-flex;
        flex-direction: column;
        gap: 10px;
        .info-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px 48px;
          font-weight: 400;
          font-size: 16px;
          .info-item {
            display: flex;
            align-items: center;
            &_label {
              color: #666;
            }
            &_value {
              color: #333;
              font-weight: 600;
            }
          }
        }
        .project-info-btn {
          padding: 0 24px;
          flex: auto 1;
          display: inline-flex;
          max-height: 70px;
          align-items: center;
          border: 1px dashed #333;
          background-color: #f6f8fa;
          border-radius: 4px;
        }
      }
    }
    .row-box:nth-child(2) {
      flex: 0.8;
      gap: 8px;
    }
    .row-box:nth-child(3) {
      flex: 0.8;
    }
  }
  .right-group {
    width: 460px;
  }
  .left-group,
  .right-group {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
    .row-box {
      display: flex;
      flex: 1;
      gap: 10px;
    }
    .card-box {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 24px;
      flex: 1;
      background-color: #fff;
      border-radius: 8px;
      &-head {
        height: 32px;
        font-weight: bold;
        font-size: 32px;
        color: #333;
        line-height: 32px;
      }
      &-title {
        display: flex;
        justify-content: space-between;
        height: 16px;
        font-weight: bold;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
        .title-btn {
          font-size: 14px;
          color: #848488;
          line-height: 14px;
          cursor: pointer;
        }
      }
      &-content {
        flex: 1;
        overflow: auto;

        .project-info {
          display: flex;
          align-items: center;
          font-size: 14px;
          .info-item_label {
            margin-right: 16px;
            font-weight: 500;
            color: #333;
          }
          .info-item_value {
            flex: 1;
          }
        }

        .statistics {
          height: 100%;
          display: flex;
          align-items: center;
          &-item {
            display: flex;
            flex-direction: column;
            flex: 1;
            text-align: center;
            gap: 16px;
            &_label {
              font-weight: 400;
              font-size: 14px;
              color: #666;
              line-height: 14px;
            }
            &_value {
              font-weight: bold;
              font-size: 24px;
              color: #333;
              line-height: 24px;
            }
            &:nth-child(1),
            &:nth-child(3) {
              .statistics-item_value {
                color: #333333;
              }
            }
            &:nth-child(2) {
              .statistics-item_value {
                color: #23c69f;
              }
            }
            &:nth-child(4) {
              .statistics-item_value {
                color: #e12137;
              }
            }
          }
        }
        .timeline {
          padding: 5px;
          width: 100%;
          .activity {
            display: flex;
            text-align: center;
            justify-content: space-between;
            &-title {
              font-weight: 600;
              font-size: 16px;
              color: #333333;
            }
            &-timer {
              font-weight: 400;
              font-size: 14px;
              color: #666666;
              span {
                font-weight: 400;
                font-size: 14px;
                color: #333333;
              }
            }
          }
        }
        .user-group {
          display: flex;
          flex-wrap: wrap;
          height: 100%;
          gap: 20px;
          .info-item-header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 400;
            font-size: 16px;
            background-color: #f6f8fa;
            &_label {
              margin-right: 10px;
              color: #666;
            }
            &_value {
              color: #333;
            }
          }
          .info-item {
            width: calc((100% - 40px) / 3);
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #f6f8fa;
            &_label {
              color: #666;
            }
            &_value {
              color: #333;
            }
          }
        }
      }
    }
  }
}
.no-data {
  color: #666;
  margin-top: 100px;
}
.comp-project-overview {
  :deep(.el-timeline-item__node.el-timeline-item__node--normal) {
    border: 3px solid #ffe6d4;
  }
  :deep(.el-timeline-item__tail) {
    border-left: 1px dashed #dadbe0;
  }
  :deep(.el-timeline-item__content) {
    .activity-title {
      font-size: 16px;
      color: #333333;
      line-height: 16px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }
}

.right-bottom {
  .info-item_value {
    margin-top: 4px;
    display: block;
    max-width: 100%;
    box-sizing: border-box;
    padding: 0 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: center;
    font-style: normal;
    text-transform: none;
  }
}
</style>
