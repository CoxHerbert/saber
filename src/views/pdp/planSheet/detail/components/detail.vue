<template>
  <div class="content-warp">
    <div class="main">
      <div class="main-title">
        <div class="main-title-label">
          {{ detailInfo.lineCode }}
        </div>
        <div>
          <!-- <el-button
            type="primary"
            @click="handleSchedulingPlan"
            v-if="detailInfo.planOrderStatus === 'DC_MMR_PLAN_ORDER_STATUS_IP'"
            >重排</el-button
          > -->
          <!-- <el-button
            type="primary"
            @click="handleSchedulingPlan"
            v-if="detailInfo.planOrderStatus === 'DC_MMR_PLAN_ORDER_STATUS_PP'"
            >排计划</el-button
          > -->
          <el-button class="btn-edit" @click="handleTopEdit" type="primary">编辑</el-button>
        </div>
      </div>
      <div class="main-container">
        <div class="basic-info">
          <el-form label-suffix=":" label-width="100px">
            <el-form-item
              class="detail-form-item-common"
              label="客户产品"
              prop="customerProductName"
            >
              {{ detailInfo.customerProductName || '-' }}
            </el-form-item>
            <el-form-item class="detail-form-item-common" label="隶属项目" prop="projectConfigId">
              <dc-view
                v-model="detailInfo.projectId"
                objectName="pdpProject"
                showKey="projectName"
              />
            </el-form-item>
            <!-- <el-form-item class="detail-form-item-common" label="Station" prop="stationCode">
              {{ detailInfo.stationCode || '-' }}
            </el-form-item> -->
            <el-form-item
              class="detail-form-item-common"
              label="CM厂商"
              id="customerId"
              prop="cmId"
            >
              <dc-view v-model="detailInfo.cmId" objectName="customer"></dc-view>
            </el-form-item>
            <el-form-item class="detail-form-item-common" label="CM厂商编码" prop="cmCode">
              {{ detailInfo.cmCode || '-' }}
            </el-form-item>

            <el-form-item
              class="detail-form-item-common"
              label="所属部门"
              id="deptName"
              prop="deptName"
            >
              {{ detailInfo.deptName }}
            </el-form-item>
            <el-form-item class="detail-form-item-common" label="ETA日期" prop="etaTime">
              {{ detailInfo.etaTime || '-' }}
            </el-form-item>
            <el-form-item
              class="detail-form-item-common"
              label="项目类型"
              id="npiOrMp"
              prop="npiOrMp"
            >
              <dc-dict-key
                :value="detailInfo.npiOrMp"
                :options="DC_PMS_PROJECT_PHASE"
              ></dc-dict-key>
            </el-form-item>
            <el-form-item class="detail-form-item-common"></el-form-item>
            <el-form-item class="detail-form-item-common" label="CM厂商区域" prop="regionId">
              <dc-view-v2
                v-model="detailInfo.regionId"
                objectName="pdpCustomerArea"
                showLabel="areaName"
              />
            </el-form-item>
            <el-form-item class="detail-form-item-common" label="CM厂商地址" prop="adress">
              {{ detailInfo.address || '-' }}
            </el-form-item>
            <el-form-item class="detail-form-item-common w100" label="备注说明" prop="notes">
              {{ detailInfo.notes || '-' }}
            </el-form-item>
            <el-form-item class="detail-form-item-common w100" label="上传附件" prop="attachment">
              <dc-upload
                v-if="detailInfo.attachment"
                v-model="detailInfo.attachment"
                :isUpload="false"
                :isRemove="false"
                :targetType="Const.targetType.MMR_PLAN_ORDER"
              />
              <span v-else>-</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-title">技工人数占比</div>
      <!-- <div class="footer-box"> -->
      <!-- <div class="footer-box-item">
          <div class="tooltip-box">
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单线架线人员:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.lubCountUser }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单独下PO人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleLbuPoCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">包含机台报价内人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleLbuPriceNumber }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">FREE人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleLbuFreeCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价开始时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleLbuStartDate }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价结束时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleLbuEndDate }}</div>
            </div>
          </div>
        </div> -->

      <!-- <div class="footer-box-item">
          <div class="tooltip-box">
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单线守线人员:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.susCountUser }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单独下PO人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleSusPoCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">包含机台报价内人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleSusPriceNumber }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">FREE人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleSusFreeCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价开始时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleSusStartDate }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价结束时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleSusEndDate }}</div>
            </div>
          </div>
        </div> -->
      <!-- <div class="footer-box-item">
          <div class="tooltip-box">
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单线爬坡人员:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.rampCountUser }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单独下PO人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampPoCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">包含机台报价内人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampPriceNumber }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">FREE人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampFreeCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价开始时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampStartDate }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价结束时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampEndDate }}</div>
            </div>
          </div>
        </div> -->
      <!-- <div class="footer-box-item">
          <div class="tooltip-box">
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单线爬坡人员22:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.rampCountUser }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">单独下PO人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampPoCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">包含机台报价内人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampPriceNumber }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">FREE人数:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampFreeCount }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价开始时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampStartDate }}</div>
            </div>
            <div class="tooltip-box-item">
              <div class="tooltip-box-item-label">报价结束时间:</div>
              <div class="tooltip-box-item-value">{{ detailInfo.singleRampEndDate }}</div>
            </div>
          </div>
        </div> -->
      <!-- </div> -->
      <div class="footer-box">
        <el-table :data="tableData" :row-style="{ height: '48px' }">
          <el-table-column
            v-for="(col, i) in subColumns"
            :key="i"
            :label="col.label"
            :prop="col.prop"
          >
            <template #default="{ row }">
              <span
                v-if="col.prop === 'phase'"
                class="col-set"
                :style="{
                  color: row.color ? row.color : 'inherit',
                }"
              >
                {{ col.render ? col.render(row[col.prop], row) : row[col.prop] }}</span
              >
              <span v-else>
                {{ col.render ? col.render(row[col.prop], row) : row[col.prop] }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="footer-box" style="padding-top: 0">
        <div class="footer-box-item">
          <div class="footer-box-item-label">L1人员占比</div>
          <div class="footer-box-item-value">
            {{ Number(detailInfo.levelOneRate * 100).toFixed(2) }}%
          </div>
        </div>
        <div class="footer-box-item">
          <div class="footer-box-item-label">L2人员占比</div>
          <div class="footer-box-item-value">
            {{ Number(detailInfo.levelTwoRate * 100).toFixed(2) }}%
          </div>
        </div>
        <div class="footer-box-item">
          <div class="footer-box-item-label">L3人员占比</div>
          <div class="footer-box-item-value">
            {{ Number(detailInfo.levelThreeRate * 100).toFixed(2) }}%
          </div>
        </div>
      </div>

      <div class="footer-title">各部门DRI</div>
      <div class="footer-box">
        <div class="footer-box-items" v-for="(item, i) in detailInfo.dcPdpFuncFieldList" :key="i">
          <div class="footer-box-items-label">
            <dc-dict-key :value="item.filedKey" :options="DC_PMS_PROJECT_ROLE" />
          </div>
          <div class="footer-box-items-value">
            <dc-view v-model="item.bindUserIds" objectName="user" showKey="realName" />
          </div>
        </div>
        <!-- <div class="footer-box-items">
          <div class="footer-box-items-label">
            <dc-view v-model="detailInfo.chargeUser" objectName="user" showKey="realName" />
          </div>
          <div class="footer-box-items-value">FAEDRI</div>
        </div>
        <div class="footer-box-items">
          <div class="footer-box-items-label">
            <dc-view v-model="detailInfo.tpmId" objectName="user" showKey="realName" />
          </div>
          <div class="footer-box-items-value">TPMDRI</div>
        </div> -->

        <!-- <div class="footer-box-items">
          <div class="footer-box-items-label">
            <dc-view v-model="detailInfo.nowDri" objectName="user" showKey="realName" />
          </div>
          <div class="footer-box-items-value">FAEDRI</div>
        </div> -->
        <!-- <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view
                v-model="filteredData[0].electricalDriId"/pdp/planSheet/index
                objectName="user"
                showKey="realName"
              />
            </div>
            <div class="footer-box-items-value">电控DRI</div>
          </div>
          <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view v-model="filteredData[0].softwareDriId" objectName="user" showKey="realName" />
            </div>
            <div class="footer-box-items-value">软件DRI</div>
          </div>
          <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view v-model="filteredData[0].bdDriId" objectName="user" showKey="realName" />
            </div>
            <div class="footer-box-items-value">BDDRI</div>
          </div> -->
      </div>
      <!-- <div class="footer-box"> -->
      <!-- <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view
                v-model="filteredData[0].institutionsDriId"
                objectName="user"
                showKey="realName"
              />
            </div>
            <div class="footer-box-items-value">机构DRI</div>
          </div> -->
      <!-- <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view v-model="detailInfo.tpmId" objectName="user" showKey="realName" />
            </div>
            <div class="footer-box-items-value">TPMDRI</div>
          </div> -->
      <!-- <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view v-model="filteredData[0].pmDriId" objectName="user" showKey="realName" />
            </div>
            <div class="footer-box-items-value">PMDRI</div>
          </div> -->
      <!-- <div class="footer-box-items">
            <div class="footer-box-items-label">
              <dc-view v-model="filteredData[0].versionDriId" objectName="user" showKey="realName" />
            </div>
            <div class="footer-box-items-value">视觉DRI</div>
          </div> -->
      <!-- </div> -->
    </div>
  </div>

  <!-- 排计划 -->
  <el-drawer
    v-model="SchedulingOpen.drawer"
    size="40%"
    :title="SchedulingOpen.title"
    @close="cancel"
  >
    <el-form
      ref="ruleForm"
      :model="SchedulingPlanForm"
      :rules="rules"
      label-width="auto"
      class="mt-5"
    >
      <div>
        <el-form-item
          v-for="(item, index) in findList"
          :key="index"
          :label="item.phaseName"
          class="form-item"
        >
          <dc-date-range v-model:startDate="item.startDate" v-model:endDate="item.endDate" />
        </el-form-item>
      </div>

      <!-- <el-form-item>
          <el-button @click="handleAdd">添加阶段</el-button>
        </el-form-item> -->
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="schedulingPlanSubmitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-drawer>

  <el-dialog v-model="stageOpen" title="选择阶段" width="500" center class="audit">
    <el-select v-model="stageDate" placeholder="请选择阶段">
      <el-option
        v-for="item in stageList"
        :key="item.mmrPhaseCode"
        :label="item.mmrPhaseName"
        :value="item.mmrPhaseCode"
      />
    </el-select>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="confirmBtn">确定</el-button>
        <el-button @click="stageOpen = false"> 取消 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑 -->
  <Submit ref="planSheetRef" @confirm="getDetail()" />
</template>

<script setup name="ProjectSubmit">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { useRoute } from 'vue-router';
import Const from '@/const';
import Submit from '../../submit.vue';
import { subColumns } from '../../../planOrder/utils';

const route = useRoute(); // 获取当前路由对象
const { proxy } = getCurrentInstance();

const { PROJECT_MAP_CACHE, CRMCUSTOMERAREA_MAP_CACHE, DC_PMS_PROJECT_PHASE, DC_PMS_PROJECT_ROLE } =
  proxy.useCache([
    { key: 'PROJECT_MAP_CACHE', keyName: 'id' },
    { key: 'CRMCUSTOMERAREA_MAP_CACHE', keyName: 'id' },
    { key: 'DC_PMS_PROJECT_PHASE' },
    { key: 'DC_PMS_PROJECT_ROLE' },
  ]);

const pageData = reactive({
  detailInfo: [],
  tableData: [],
  formData: {},
  queryParams: {
    size: 10,
    current: 1,
  },
  open: {
    drawer: false,
    title: '',
  },

  planSheetRef: null,
  SchedulingOpen: {
    drawer: false,
    title: '',
  },
  SchedulingPlanForm: {
    startDate: null,
    endDate: null,
  },
  filteredData: [],
  stageOpen: false,
  stageList: [],
  stageDate: null,
  selectedData: null,
  findList: [],
  customerProductSelectList: [],
  // inited: false,
});

const {
  detailInfo,
  formData,
  queryParams,
  open,
  rules,
  planSheetRef,
  SchedulingOpen,
  SchedulingPlanForm,
  filteredData,
  stageOpen,
  stageList,
  stageDate,
  selectedData,
  findList,
  tableData,
  customerProductSelectList,
  // inited,
} = toRefs(pageData);
onMounted(async () => {
  await getDetail();
  await getOrderDetail();
  // await selectData();
  // inited.value = true;
});

// // 下拉数据
// const selectData = async () => {
//   const params = {
//     current: 1,
//     size: 100,
//     id: detailInfo.customerProductName,
//   };
//   const res = await Api.pdp.mmrPlanOrder.select(params);
//   const { code, data } = res.data;
//   if (code == 200) {
//     customerProductSelectList.value = data.records;
//   }
// };

const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
});

// 获取阶段详情信息
const getOrderDetail = async () => {
  const params = {
    id: props.id ? props.id : route.params.id,
  };

  const res = await Api.pdp.mmrPlanCount.detailByOrderId(params);
  const { code, data } = res.data;
  if (code == 200) {
    tableData.value = data?.children || [];
  }
};

const getDetail = async () => {
  const params = {
    id: props.id ? props.id : route.params.id,
  };

  const res = await Api.pdp.mmrPlanOrder.detail(params);
  const { code, data } = res.data;
  if (code == 200) {
    detailInfo.value = data;
    setTimeout(() => {
      filteredData.value = Object.values(PROJECT_MAP_CACHE.value).filter(
        item => item.id === detailInfo.value.projectId
      );
    }, 100);
  }
};

const getFindScheduling = async () => {
  const params = {
    planOrderId: props.id ? props.id : route.params.id,
    planOrderStatus: detailInfo.value.planOrderStatus,
  };

  const res = await Api.pdp.mmrPlanOrder.findScheduling(params);
  const { code, data } = res.data;
  if (code == 200) {
    findList.value = data;
  }
};

// 编辑
const handleTopEdit = () => {
  planSheetRef.value.openDrawer();
};

// 排计划
const handleSchedulingPlan = () => {
  if (detailInfo.value.planOrderStatus === 'DC_MMR_PLAN_ORDER_STATUS_IP') {
    getFindScheduling();
    SchedulingOpen.value.drawer = true;
    SchedulingOpen.value.title = '重排';
  } else {
    getFindScheduling();
    SchedulingOpen.value.drawer = true;
    SchedulingOpen.value.title = '排计划';
  }
};
// 确定提交
const schedulingPlanSubmitForm = async () => {
  proxy.$refs['ruleForm'].validate(async valid => {
    if (valid) {
      const params = {
        planOrderId: props.id ? props.id : route.params.id,
      };
      const res = await Api.pdp.mmrPlanOrderItem.SchedulingPlanSubmit(findList.value, params);
      const { code, msg } = res.data;
      if (code === 200) {
        SchedulingOpen.value.drawer = false;
        proxy.$message.success(msg);
        getDetail();
        getOrderDetail();
      }
    }
  });
};

const cancel = () => {
  formData.value = {};
  SchedulingPlanForm.value = {};
  SchedulingOpen.value.drawer = false;
  open.value.drawer = false;
};
</script>

<style lang="scss" scoped>
.content-warp {
  background-color: #f5f5f5;
  padding: 0 !important;
}

.btn-edit {
  margin-right: 10px;
}
.basic-info {
  padding-top: 20px;
  display: flex;
  flex-flow: row wrap;
  .detail-form-item-common {
    display: inline-flex;
    width: 33%;

    &.w100 {
      width: 100%;
    }

    :deep(.el-form-item__label) {
      font-size: 14px;
    }
    :deep(.el-form-item__content) {
      font-size: 14px;
      line-height: 1.5;
      padding-top: 4px;
      white-space: wrap;
      word-break: break-all;
    }
  }
}
.footer-title {
  padding-left: 16px;
}
.footer-box {
  margin-top: 20px;
  width: 100%;
  height: auto;
  padding: 20px;
  border-radius: 10px;
  background-color: #fff;
  .footer-box-item {
    justify-content: left;
  }
}

.main {
  background: #fff;
  border-radius: 8px;
  padding: 16px 0 0 16px;
  &-title {
    display: flex;
    font-weight: bold;
    font-size: 32px;
    color: #333333;
    line-height: 32px;
    justify-content: space-between;

    &-label {
      flex: 1;
      display: flex;
    }
    img {
      margin-left: 8px;
    }
  }

  &-container {
    display: flex;
    gap: 80px;

    &-item {
      display: flex;
      margin-top: 20px;

      &-label {
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        line-height: 14px;
      }

      &-value {
        flex: 1;
        font-weight: 500;
        font-size: 14px;
        color: #333333;
        line-height: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &-remark {
        display: flex;
        margin-top: 20px;

        &-label {
          font-weight: 400;
          font-size: 14px;
          color: #666666;
          line-height: 14px;
        }

        &-value {
          flex: 1;
          font-weight: 500;
          font-size: 14px;
          color: #333333;
          line-height: 16px;
        }
      }
    }
  }
}

.attachment {
  display: flex;
  align-items: center;
}

.footer {
  margin-top: 20px;

  &-title {
    display: flex;
    flex-wrap: wrap;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    margin-top: 20px;
    &::before {
      margin-right: 4px;
      display: block;
      content: '';
      width: 4px;
      height: 13px;
      background-color: #f78431;
    }
  }

  &-btn {
    margin-top: 20px;
  }

  &-table {
    margin-top: 20px;
  }

  &-box {
    display: flex;
    align-items: center;
    &-item {
      margin-right: 16px;
      margin-top: 20px;
      padding: 25px;
      width: 25%;
      display: flex;
      text-align: center;
      align-items: center;
      border-radius: 5px;
      background: #ffffff;
      justify-content: center;

      &-label {
        padding-right: 24px;
        font-size: 18px;
        color: #666666;
      }
      &-value {
        font-weight: bold;
        font-size: 36px;
        color: #333333;
      }
    }
  }

  &-box {
    display: flex;
    align-items: center;
    &-items {
      margin-right: 16px;
      margin-top: 20px;
      padding: 25px;
      width: 25%;
      border-radius: 5px;
      background: #ffffff;
      justify-content: center;

      &-label {
        font-weight: bold;
        font-size: 24px;
        color: #333333;
      }
      &-value {
        font-weight: 400;
        font-size: 20px;
        color: #666666;
      }
    }
  }
}

.footer-box-items-label {
  :deep(.dict.dict-text) {
    font-size: 18px;
    color: #666666;
    text-align: center;
  }
}

.footer-box-items-value {
  :deep(.dc-view) {
    font-size: 16px;
    text-align: center;
    font-weight: bold;
    color: #333;
  }
}

.tooltip-box {
  &-item {
    margin-right: 16px;
    padding: 15px;
    display: flex;
    text-align: center;
    align-items: center;
    border-radius: 5px;
    background: #ffffff;
    justify-content: center;

    &-label {
      padding-right: 24px;
      font-size: 18px;
      color: #666666;
    }
    &-value {
      font-weight: bold;
      font-size: 24px;
      color: #333333;
    }
  }
}
</style>
