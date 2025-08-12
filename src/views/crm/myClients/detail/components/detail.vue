<template>
  <div class="comp-customer-detail">
    <div v-for="(group, i) in DetailOption.groups" :key="i" class="group-box">
      <div class="group-title">
        {{ group.label }}
      </div>
      <template v-if="group">
        <div v-if="group.renderType === 'form'" class="form-box">
          <div v-for="(item, j) in group.columns" :key="j" class="data-item">
            <div class="label">{{ item.label }}</div>
            <div class="value">
              <div class="value-set">
                <template v-if="item.type === 'dict'">
                  {{
                    dictMaps.value[item.options]?.find(d => d.id === infoDetail[item.prop])
                      ?.dictValue || '-'
                  }}
                </template>
                <dc-view
                  v-else-if="item.type === 'dc-view'"
                  v-model="infoDetail[item.prop]"
                  :objectName="item.objectName"
                ></dc-view>
                <template v-else>{{ infoDetail[item.prop] || '-' }}</template>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="group.renderType === 'table-form' && infoDetail.isCm" class="form-box">
          <template v-for="(row, k) in infoDetail.crmCustomerAreas || []">
            <div v-for="(item, j) in group.columns" :key="j" class="data-item">
              <div class="label">{{ item.label }}</div>
              <div class="value">
                <div class="value-set">{{ row[item.prop] }}</div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
    <!-- {{ infoDetail.crmCustomerAreas }} -->
    <!-- {{ DetailOption.groups }} -->
  </div>
  <!-- <div class="page-customer-box">
    <div class="desc-title">基本信息</div>
    <el-descriptions :column="4">
      <el-descriptions-item label="客户全称" :width="descItemWidth"
        >{{ infoDetail.fullname || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="客户编码" :width="descItemWidth"
        >{{ infoDetail.customerCode || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="法定代表人" :width="descItemWidth">
        {{ infoDetail.legalPerson || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="注册资本" :width="descItemWidth">
        {{ infoDetail.regCap || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="企业类型" :width="descItemWidth">
        {{ infoDetail.regType || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="社会信用代码" :width="descItemWidth">
        {{ infoDetail.taxNo || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="经营状态" :width="descItemWidth">
        {{ infoDetail.runningStatus || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="企业注册号" :width="descItemWidth">
        {{ infoDetail.regCode || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="成立日期" :width="descItemWidth">
        {{ infoDetail.regDate || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="注销日期" :width="descItemWidth"
        >{{ infoDetail.oppsBackground || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="所属工商局" :width="descItemWidth50">
        {{ infoDetail.govBelong || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions>
      <el-descriptions-item label="注册地址" :width="descItemWidth50">
        <el-tooltip effect="light" :content="infoDetail.regAddress" placement="bottom">
          {{ infoDetail.regAddress || '-' }}
        </el-tooltip>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions :column="1">
      <el-descriptions-item label="经营范围">
        <div class="descriptions">
          <div class="descriptions">
            <div class="descriptions-companyScope">
              {{ infoDetail.companyScope || '-' }}
            </div>
            <span
              @mouseover="e => (buttonRef = e.currentTarget)"
              @click="visible = !visible"
              class="descriptions-companyScope-look"
              >查看全部</span
            >
          </div>

          <el-tooltip
            ref="tooltipRef"
            :visible="visible"
            :virtual-ref="buttonRef"
            virtual-triggering
            popper-class="el-tooltip__popper-myclients-detail"
          >
            <template #content>
              <span> {{ infoDetail.companyScope || '-' }} </span>
            </template>
          </el-tooltip>
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <el-divider />
    <div class="desc-title">厂区信息</div>
    <div class="factoryCode-info">
      <el-descriptions>
        <el-descriptions-item label="是否是CM厂商" :width="descItemWidth100">
          <span>{{ infoDetail.isCm ? '是' : '否' }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="infoDetail.isCm" :width="descItemWidth100">
          <el-table :border="true" :data="infoDetail.crmCustomerAreas" row-key="=id">
            <el-table-column prop="factoryCode" label="厂区编码" align="left" />
            <el-table-column prop="areaName" label="区域" align="center" />
            <el-table-column prop="address" label="详细地址" align="center" />
          </el-table>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider />
    <div class="desc-title">客户联系</div>
    <el-descriptions :column="4">
      <el-descriptions-item label="客户分类" :width="descItemWidth">
        <dc-dict type="text" :options="DC_CRM_CUS_CATEGORY" :value="infoDetail.cusCategory" />
      </el-descriptions-item>
      <el-descriptions-item label="人员规模" :width="descItemWidth">
        <dc-dict type="text" :options="DC_CRM_CUS_STAFF_SIZE" :value="infoDetail.staffSize" />
      </el-descriptions-item>
      <el-descriptions-item label="客户级别" :width="descItemWidth">
        <dc-dict type="text" :options="DC_CRM_CUS_LEVEL" :value="infoDetail.cusLevel" />
      </el-descriptions-item>
      <el-descriptions-item label="负责人" :width="descItemWidth">
        <dc-view v-model="infoDetail.personInChargeUser" objectName="user" showKey="realName" />
      </el-descriptions-item>
      <el-descriptions-item label="共享方式" :width="descItemWidth">
        <dc-dict type="text" :options="DC_CRM_CUS_SHARE_TYPE" :value="infoDetail.cusShareType" />
      </el-descriptions-item>
      <el-descriptions-item label="共享人" :width="descItemWidth">
        <dc-view v-model="infoDetail.sharerUser" objectName="user" showKey="realName" />
      </el-descriptions-item>

      <el-descriptions-item label="行业类别" :width="descItemWidth">
        <dc-dict type="text" :options="DC_CRM_SECTOR" :value="infoDetail.sector" />
      </el-descriptions-item>
      <el-descriptions-item label="客户描述" :width="descItemWidth100">
        {{ infoDetail.customerDesc || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-divider />
    <div class="desc-title">相关附件</div>
    <el-descriptions :column="1">
      <el-descriptions-item label="相关附件" :width="descItemWidth100">
        <dc-upload
          v-model="infoDetail.attachments"
          :limit="10"
          :isUpload="false"
          :isRemove="false"
          :targetType="Const.targetType.CUSTOMER"
        />
      </el-descriptions-item>
    </el-descriptions>
    <el-divider />
    <div class="desc-title">系统信息</div>
    <el-descriptions :column="4">
      <el-descriptions-item label="登记人" :width="descItemWidth">
        <dc-view v-model="infoDetail.createUser" objectName="user" showKey="realName" />
      </el-descriptions-item>
      <el-descriptions-item label="修改人" :width="descItemWidth">
        <dc-view v-model="infoDetail.updateUser" objectName="user" showKey="realName" />
      </el-descriptions-item>
      <el-descriptions-item label="登记时间" :width="descItemWidth">
        {{ infoDetail.createTime || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="修改时间" :width="descItemWidth">
        {{ infoDetail.updateTime || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="登记人部门" :width="descItemWidth">
        <dc-view v-model="infoDetail.createDept" objectName="dept" />
      </el-descriptions-item>
      <el-descriptions-item label="修改人部门" :width="descItemWidth">
        <dc-view v-model="infoDetail.updateDept" objectName="dept" />
      </el-descriptions-item>
      <el-descriptions-item label="行业类别" :width="descItemWidth">
        <dc-dict type="text" :options="DC_CRM_SECTOR" :value="infoDetail.sector" />
      </el-descriptions-item>
    </el-descriptions>
  </div> -->
</template>
<script setup name="ClientDetail">
import { onMounted, reactive, ref, watch } from 'vue';
import Const from '@/const';
import DetailOption from '../utils/detail';
import api from '@/api';

const buttonRef = ref();
const tooltipRef = ref();

const visible = ref(false);

const props = defineProps({
  infoDetail: {},
});

const { proxy } = getCurrentInstance();

const data = reactive({
  descItemWidth: '25%',
  descItemWidth50: '50%',
  descItemWidth100: '100%',
});

// 数据字典
// const dictMaps = proxy.useCache([
//   { key: 'DC_CRM_CUS_CATEGORY' },
//   { key: 'DC_CRM_CUS_STAFF_SIZE' },
//   { key: 'DC_CRM_CUS_LEVEL' },
//   { key: 'DC_CRM_CUS_SHARE_TYPE' },
//   { key: 'DC_CRM_SECTOR' },
// ]);

const dictMaps = ref({
  DC_CRM_CUS_CATEGORY: [],
  DC_CRM_CUS_STAFF_SIZE: [],
  DC_CRM_CUS_LEVEL: [],
  DC_CRM_CUS_SHARE_TYPE: [],
  DC_CRM_SECTOR: [],
});

const getDicts = async () => {
  const res = await proxy.useAsyncCache([
    { key: 'DC_CRM_CUS_CATEGORY' },
    { key: 'DC_CRM_CUS_STAFF_SIZE' },
    { key: 'DC_CRM_CUS_LEVEL' },
    { key: 'DC_CRM_CUS_SHARE_TYPE' },
    { key: 'DC_CRM_SECTOR' },
  ]);
  dictMaps.value = res;
};

const { descItemWidth, descItemWidth50, descItemWidth100 } = toRefs(data);

onMounted(async () => {
  await getDicts();
});
</script>
<style lang="scss" scoped>
.comp-customer-detail {
  display: block;
  width: 100%;
  min-height: 100px;
}
.group-box {
  margin-top: 16px;
  width: 100%;
  margin-bottom: 24px;
  .group-title {
    margin-bottom: 16px;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    border-left: 4px solid #f78431;
    padding-left: 8px;
  }

  .form-box {
    border: 1px solid #dadbe0;
    border-bottom: none;
    border-left: none;
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    .data-item {
      height: 40px;
      overflow: hidden;
      width: 33.333%;
      display: inline-flex;
      .label {
        padding: 0 12px;
        height: 40px;
        line-height: 40px;
        box-sizing: border-box;
        background: #f7f6f5;
        color: #666666;
        font-size: 14px;
        border-bottom: 1px solid #dadbe0;
        border-right: 1px solid #dadbe0;
        border-left: 1px solid #dadbe0;
        width: 130px;
      }
      .value {
        position: relative;
        display: flex;
        width: calc(100% - 130px);
        box-sizing: border-box;
        border-bottom: 1px solid #dadbe0;
        .value-set {
          position: absolute;
          width: 100%;
          padding: 0 12px;
          height: 40px;
          left: 0;
          top: 0;
          color: #333;
          font-size: 14px;
          line-height: 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
          border-left: none;
        }
      }
    }
  }
}

:deep(.el-popper .is-dark .el-tooltip__popper) {
  width: 60% !important; /* 设置宽度 */
}

.page-customer-box {
  :deep(.el-descriptions__label) {
    &::after {
      content: ':';
    }
  }
}
.desc-title {
  margin: 20px 0;
  font-weight: 600;
  font-size: 16px;
  color: #333;
  line-height: 16px;
  text-align: left;
  font-style: normal;
  text-transform: none;

  &::before {
    margin-right: 4px;
    display: inline-block;
    content: '';
    background: #f78431;
    width: 4px;
    height: 13px;
  }
}

.factoryCode-info {
  width: 100%;
  max-width: 1200px;
  :deep(.el-table) {
    max-width: 1200px;
  }
  :deep(.el-descriptions__cell:nth-child(2n)) {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    .el-descriptions__content {
      padding-left: 16px;
    }

    // .el-descriptions__label {
    //   text-align: left;
    //   margin-bottom: 10px;
    // }
  }
}

.descriptions {
  display: flex;

  .descriptions-companyScope {
    width: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .descriptions-companyScope-look {
    font-weight: 400;
    font-size: 14px;
    color: #f78431;
  }
}
</style>
