<template>
  <el-drawer
    class="project-drawer"
    v-model="open"
    destroy-on-close
    append-to-body
    @close="closeDrawer"
  >
    <div class="close-icon" @click="closeDrawer">
      <el-icon><Close /></el-icon>
    </div>
    <div v-if="DC_PMS_PROJECT_PHASE && DC_PMS_PROJECT_PHASE.length > 0" class="layout-process">
      <div class="layout-process-left">
        <div class="left-head" style="padding-bottom: 0">
          <div class="left-head_title">{{ title }}</div>
          <div class="left-head_info">
            <div class="info-value">
              <dc-view v-model="userInfo.user_id" objectName="user" showKey="realName" />
            </div>
            |
            <div class="info-value">
              发起于{{ formData?.createTime || proxy.$dayjs().format('YYYY-MM-DD HH:mm:ss') }}
            </div>
          </div>
        </div>
        <div class="left-body">
          <div class="wrap">
            <el-form
              class="custom-form form-plansheet-add-or-edit"
              ref="ruleFormRef"
              :model="formData"
              label-suffix=":"
              :rules="rules"
              label-width="160px"
              status-icon
              :inline="true"
            >
              <div class="wrap-left-form">
                <div class="form-group-title">基本信息</div>
                <div class="form-item-box-basic">
                  <el-form-item
                    class="form-itme-width_50"
                    label="客户产品"
                    label-width="110px"
                    id="customerProductName"
                    prop="customerProductName"
                  >
                    <el-select
                      v-model="formData.customerProductName"
                      clearable
                      filterable
                      placeholder="请选择客户产品"
                      @change="handleSelect"
                    >
                      <!-- fdatavalue -->
                      <el-option
                        v-for="item in selectList"
                        :key="item.fnumber"
                        :label="item.fdatavalue"
                        :value="item.fdatavalue"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label="计划名称"
                    id="lineCode"
                    label-width="110px"
                    prop="lineCode"
                  >
                    <el-input v-model="formData.lineCode" placeholder="由系统自动生成" disabled />
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label="隶属项目"
                    label-width="110px"
                    prop="projectConfigId"
                  >
                    <dc-select-dialog-v2
                      v-model="formData.projectConfigId"
                      placeholder="请选择关联项目"
                      objectName="pdpProject"
                      type="input"
                      returnType="object"
                      :multiple="false"
                      :multiple-limit="1"
                      :initChangeable="true"
                      :clearable="true"
                      :params="{
                        enabled: true,
                      }"
                      @iptTagDataUpdate="handleProjectChange"
                      @change="hanleProjectConfig"
                    >
                      <template #search-items="{ queryParams }">
                        <div class="dialog-search-box">
                          <el-form-item label-width="100px" label="项目名称">
                            <el-input
                              placeholder="请输入项目名称"
                              clearable
                              v-model="queryParams.projectName"
                            />
                          </el-form-item>
                          <el-form-item label-width="100px" label="项目编码">
                            <el-input
                              placeholder="请输入项目编码"
                              clearable
                              v-model="queryParams.projectCode"
                            />
                          </el-form-item>
                          <!-- <el-form-item label-width="100px" label="station">
                            <el-input
                              v-model="queryParams.station"
                              placeholder="请输入station"
                              clearable
                            />
                          </el-form-item> -->
                        </div>
                      </template>
                    </dc-select-dialog-v2>
                  </el-form-item>
                  <!-- <el-form-item
                    class="form-itme-width_50"
                    label="Station"
                    id="stationConfigId"
                    label-width="110px"
                    prop="stationCode"
                  >
                    <el-input
                      v-model="formData.stationCode"
                      :disabled="true"
                      placeholder="由系统自动生成"
                    />
                
                  </el-form-item> -->
                  <!-- <el-form-item
                  class="form-itme-width_50"
                  label="计划单名称"
                  id="lineName"
                  prop="lineName"
                >
                  <el-input v-model="formData.lineName" placeholder="请输入计划单名称" />
                </el-form-item> -->

                  <el-form-item
                    class="form-itme-width_50"
                    label="客户"
                    id="customerId"
                    label-width="110px"
                    prop="customerId"
                  >
                    <!-- <el-input
                      v-model="formData.customerName"
                      placeholder="选择隶属项目后自动生成"
                    /> -->
                    <dc-select-dialog-v2
                      v-model="formData.customerId"
                      :placeholder="!formData.projectConfigId ? '请先选择隶属项目' : '请选择客户'"
                      objectName="customer"
                      type="input"
                      :disabeld="true"
                      :multiple="false"
                      :multiple-limit="1"
                      :clearable="true"
                      returnType="string"
                      :disabled="!formData.projectConfigId"
                      :params="{
                        isCm: true,
                      }"
                      @change="changeCustomer"
                    />
                  </el-form-item>

                  <el-form-item
                    class="form-itme-width_50"
                    label="客户终端代码"
                    id="customerCode"
                    label-width="110px"
                    prop="customerCode"
                  >
                    <el-select v-model="formData.endCustomerProjectCode" placeholder="请选择">
                      <el-option
                        v-for="(op, j) in endCustomerProjectCodeOption"
                        :key="j"
                        :label="op.label"
                        :value="op.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    class="form-itme-width_50"
                    label="CM厂商"
                    label-width="110px"
                    prop="cmId"
                  >
                    <dc-select-dialog
                      v-model="formData.cmId"
                      placeholder="请选择CM厂商"
                      objectName="cmSelector"
                      type="input"
                      :multiple="false"
                      :multiple-limit="1"
                      :clearable="true"
                      returnType="string"
                      :params="{
                        isCm: true,
                      }"
                      @change="changeCMId"
                    />
                    <!-- <el-input v-model="formData.cmName" placeholder="请输入CM厂商" /> -->
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="CM编码"
                    prop="cmCode"
                  >
                    <el-input
                      v-model="formData.cmCode"
                      :disabled="true"
                      placeholder="请先选择隶属项目"
                    />
                  </el-form-item>

                  <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="CM厂区域"
                    prop="regionId"
                  >
                    <dc-select-dialog
                      v-model="formData.regionId"
                      placeholder="请选择CM厂区域"
                      objectName="pdpCustomerArea"
                      type="input"
                      :disabled="!formData.cmId"
                      :multiple="false"
                      :multiple-limit="1"
                      :clearable="true"
                      :params="{
                        customerId: formData.cmId?.id ? formData.cmId?.id : formData.cmId,
                        isCm: true,
                      }"
                      @change="customerAreaChange"
                    >
                      <template #form-areaName="scoped">
                        <el-cascader
                          :modelValue="scoped.formData.areaCode"
                          @update:modelValue="
                            (val, val2) => {
                              handleAreaChange(val, scoped);
                            }
                          "
                          placeholder="请输入区域"
                          :options="areaOptions"
                          :props="{
                            value: 'id',
                            label: 'title',
                          }"
                          clearable
                        />
                      </template>
                    </dc-select-dialog>
                  </el-form-item>

                  <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="CM厂地址"
                    prop="address"
                  >
                    <el-input v-model="formData.address" placeholder="请输入客户地址" />
                  </el-form-item>
                  <!-- <el-form-item class="form-itme-width_50" label="区域" id="region" prop="region">
                  <el-cascader
                    v-model="formData.region"
                    :options="areaOptions"
                    :props="{
                      label: 'title',
                      value: 'title',
                    }"
                    @change="handleChange"
                    clearable
                    style="width: 100%"
                  />
           
                </el-form-item> -->
                  <dc-member
                    :mode="formData.id ? 'edit' : 'add'"
                    formItemClass="form-itme-width_50"
                    labelWidth="110px"
                    :modelFieldListProp="'dcPdpFuncFieldList'"
                    :templateProp="'funcFieldTemplateId'"
                    v-model:modelTemplate="formData.funcFieldTemplateId"
                    v-model:modelFieldList="formData.dcPdpFuncFieldList"
                    @change="
                      val => {
                        hanldeMemberChange(val, 'main');
                      }
                    "
                  />
                  <!-- <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="FAEDRI"
                    id="chargeUser"
                    prop="chargeUser"
                  >
                    <dc-select-user
                      v-model="formData.chargeUser"
                      placeholder="请选择FAEDRI"
                      returnType="string"
                      :multiple="false"
                      :multiple-limit="1"
                    />
                  </el-form-item>

                  <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="TPMDRI"
                    id="tpmId"
                    prop="tpmId"
                  >
                    <dc-select-user
                      v-model="formData.tpmId"
                      placeholder="请选择TPMDRI"
                      returnType="object"
                      :multiple="false"
                      :multiple-limit="1"
                      @change="handleTpmChange"
                    />
                  </el-form-item> -->
                  <el-form-item
                    class="form-itme-width_50"
                    label="所属部门"
                    label-width="110px"
                    id="deptName"
                    prop="deptName"
                  >
                    <el-select
                      v-model="formData.deptName"
                      clearable
                      placeholder="请选择所属部门"
                      @change="handleSelect"
                    >
                      <el-option
                        v-for="item in deptList"
                        :key="item.productCode"
                        :label="item.produdictKeyctCode"
                        :value="item.productCode"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label="项目类型"
                    id="npiOrMp"
                    label-width="110px"
                    prop="npiOrMp"
                  >
                    <el-cascader
                      class="w-full"
                      v-model="formData.npiOrMp"
                      :options="DC_PMS_PROJECT_PHASE"
                      :props="{
                        checkStrictly: true,
                        value: 'dictKey',
                        label: 'dictValue',
                        emitPath: false,
                      }"
                      placeholder="请选择"
                      clearable
                    />
                    <!-- <el-select
                    v-model="formData.mmrPlanOrderType"
                    clearable
                    placeholder="请选择项目类型"
                    @change="handleSelect"
                  >
                    <el-option
                      v-for="item in DC_MMR_PLAN_TYPE"
                      :key="item.dictKey"
                      :label="item.dictValue"
                      :value="item.dictKey"
                    />
                  </el-select> -->
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="设备种类"
                    prop="quipmentDictId"
                  >
                    <el-select
                      v-model="formData.quipmentDictId"
                      :multiple="true"
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="(op, i) in DC_PMS_PROJECT_QIOPMENT"
                        :key="i"
                        :label="op.label"
                        :value="op.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label-width="110px"
                    label="ETA日期"
                    prop="etaTime"
                  >
                    <el-date-picker
                      v-model="formData.etaTime"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择ETA日期"
                    />
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_100"
                    label-width="110px"
                    label="包含阶段"
                    prop="mmrPlanPhases"
                  >
                    <el-checkbox-group v-model="formData.mmrPlanPhases">
                      <el-checkbox
                        v-for="(item, i) in DC_MMR_PLAN_PHASE"
                        :label="item.dictValue"
                        :value="item.dictKey"
                      />
                      <!-- <el-checkbox label="架线(LBU)" value="LBU" />
                      <el-checkbox label="爬坡(RAMP)" value="RAMP" />
                      <el-checkbox label="守线(SUS)" value="SUS" />
                      <el-checkbox label="改机包(RS)" value="RS" /> -->
                    </el-checkbox-group>
                  </el-form-item>
                </div>

                <div class="form-group-title">数量</div>
                <div class="form-item-box-basic">
                  <el-form-item label="单线模组数量" prop="moduleCount" class="form-itme-width_50">
                    <el-input-number class="w-full" :min="1" v-model="formData.moduleCount" />
                  </el-form-item>
                  <el-form-item label="线体数量" prop="lineCount" class="form-itme-width_50">
                    <el-input-number class="w-full" :min="1" v-model="formData.lineCount" />
                  </el-form-item>
                </div>
                <template v-if="formData.mmrPlanPhases?.includes('DC_MMR_PLAN_PHASE_RS')">
                  <div class="form-group-title">改机包(RS)</div>
                  <div class="form-item-box-basic">
                    <el-form-item
                      class="form-itme-width_50"
                      label="改机包人数"
                      id="singleRsCount"
                      prop="singleRsCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleRsCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="客户FCST人数"
                      id="singleRsPoCount"
                      prop="singleRsPoCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleRsPoCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="包含机台报价内人数"
                      id="singleRsPriceNumber"
                      prop="singleRsPriceNumber"
                    >
                      <el-input-number
                        class="w-full"
                        v-model="formData.singleRsPriceNumber"
                        placeholder="请输入"
                        :precision="2"
                        :min="0"
                        @change="clearRuleError"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="FREE人数"
                      id="singleRsFreeCount"
                      prop="singleRsFreeCount"
                    >
                      <el-input-number
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleRsFreeCount"
                        placeholder="请输入"
                        :min="0"
                      />
                    </el-form-item>

                    <el-form-item
                      class="form-itme-width_50"
                      label="报价开始时间"
                      id="singleRsStartDate"
                      prop="singleRsStartDate"
                    >
                      <el-date-picker
                        v-model="formData.singleRsStartDate"
                        type="date"
                        placeholder="请选择报价开始时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="报价结束时间"
                      id="singleRsEndDate"
                      prop="singleRsEndDate"
                    >
                      <el-date-picker
                        v-model="formData.singleRsEndDate"
                        type="date"
                        placeholder="请选择报价结束时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                  </div>
                </template>
                <template v-if="formData.mmrPlanPhases?.includes('DC_MMR_PLAN_PHASE_LBU')">
                  <div class="form-group-title">架线(LBU)</div>
                  <div class="form-item-box-basic">
                    <el-form-item
                      class="form-itme-width_50"
                      label="单线架线人数"
                      id="singleLbuCount"
                      prop="singleLbuCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleLbuCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="客户FCST人数"
                      id="singleLbuPoCount"
                      prop="singleLbuPoCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleLbuPoCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="包含机台报价内人数"
                      id="singleLbuPriceNumber"
                      prop="singleLbuPriceNumber"
                    >
                      <el-input-number
                        class="w-full"
                        :precision="2"
                        placeholder="请输入"
                        v-model="formData.singleLbuPriceNumber"
                        @change="clearRuleError"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="FREE人数"
                      id="singleLbuFreeCount"
                      prop="singleLbuFreeCount"
                    >
                      <el-input-number
                        class="w-full"
                        placeholder="请输入"
                        :precision="2"
                        v-model="formData.singleLbuFreeCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="报价开始时间"
                      id="singleLbuStartDate"
                      prop="singleLbuStartDate"
                    >
                      <el-date-picker
                        v-model="formData.singleLbuStartDate"
                        type="date"
                        placeholder="请选择报价开始时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="报价结束时间"
                      id="singleLbuEndDate"
                      prop="singleLbuEndDate"
                    >
                      <el-date-picker
                        v-model="formData.singleLbuEndDate"
                        type="date"
                        placeholder="请选择报价结束时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                  </div>
                </template>
                <template v-if="formData.mmrPlanPhases?.includes('DC_MMR_PLAN_PHASE_RAMP')">
                  <div class="form-group-title">爬坡(RAMP)</div>
                  <div class="form-item-box-basic">
                    <el-form-item
                      class="form-itme-width_50"
                      label="单线爬坡人数"
                      id="singleRampCount"
                      prop="singleRampCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleRampCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="客户FCST人数"
                      id="singleRampPoCount"
                      prop="singleRampPoCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleRampPoCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="包含机台报价内人数"
                      id="singleRampPriceNumber"
                      prop="singleRampPriceNumber"
                    >
                      <el-input-number
                        class="w-full"
                        placeholder="请输入"
                        v-model="formData.singleRampPriceNumber"
                        :min="0"
                        :precision="2"
                        @change="clearRuleError"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="FREE人数"
                      id="singleRampFreeCount"
                      prop="singleRampFreeCount"
                    >
                      <el-input-number
                        class="w-full"
                        v-model="formData.singleRampFreeCount"
                        placeholder="请输入"
                        :precision="2"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="报价开始时间"
                      id="singleRampStartDate"
                      prop="singleRampStartDate"
                    >
                      <el-date-picker
                        v-model="formData.singleRampStartDate"
                        type="date"
                        placeholder="请选择报价开始时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="报价结束时间"
                      id="singleRampEndDate"
                      prop="singleRampEndDate"
                    >
                      <el-date-picker
                        v-model="formData.singleRampEndDate"
                        type="date"
                        placeholder="请选择报价结束时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                  </div>
                </template>

                <template v-if="formData.mmrPlanPhases?.includes('DC_MMR_PLAN_PHASE_SUS')">
                  <div class="form-group-title">守线(SUS)</div>
                  <div class="form-item-box-basic">
                    <el-form-item
                      class="form-itme-width_50"
                      label="单线守线人数"
                      id="singleSusCount"
                      prop="singleSusCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleSusCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="客户FCST人数"
                      id="singleSusPoCount"
                      prop="singleSusPoCount"
                    >
                      <el-input-number
                        placeholder="请输入"
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleSusPoCount"
                        :min="0"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="包含机台报价内人数"
                      id="singleSusPriceNumber"
                      prop="singleSusPriceNumber"
                    >
                      <el-input-number
                        class="w-full"
                        v-model="formData.singleSusPriceNumber"
                        placeholder="请输入"
                        :precision="2"
                        :min="0"
                        @change="clearRuleError"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="FREE人数"
                      id="singleSusFreeCount"
                      prop="singleSusFreeCount"
                    >
                      <el-input-number
                        class="w-full"
                        :precision="2"
                        v-model="formData.singleSusFreeCount"
                        placeholder="请输入"
                        :min="0"
                      />
                    </el-form-item>

                    <el-form-item
                      class="form-itme-width_50"
                      label="报价开始时间"
                      id="singleSusStartDate"
                      prop="singleSusStartDate"
                    >
                      <el-date-picker
                        v-model="formData.singleSusStartDate"
                        type="date"
                        placeholder="请选择报价开始时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                    <el-form-item
                      class="form-itme-width_50"
                      label="报价结束时间"
                      id="singleSusEndDate"
                      prop="singleSusEndDate"
                    >
                      <el-date-picker
                        v-model="formData.singleSusEndDate"
                        type="date"
                        placeholder="请选择报价结束时间"
                        format="YYYY/MM/DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                  </div>
                </template>

                <div class="form-group-title">人员占比</div>
                <div class="form-item-box-basic">
                  <el-form-item
                    class="form-itme-width_50"
                    label="L1人占比"
                    id="levelOneRate"
                    prop="levelOneRate"
                  >
                    <el-input-number
                      class="w-full"
                      :precision="2"
                      v-model="formData.levelOneRate"
                      :min="0"
                      :step="1"
                    >
                      <template #suffix>
                        <span>%</span>
                      </template></el-input-number
                    >
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label="L2人占比"
                    id="levelTwoRate"
                    prop="levelTwoRate"
                  >
                    <el-input-number
                      class="w-full"
                      :precision="2"
                      v-model="formData.levelTwoRate"
                      :min="0"
                      :step="1"
                    >
                      <template #suffix>
                        <span>%</span>
                      </template></el-input-number
                    >
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_50"
                    label="L3人占比"
                    id="levelThreeRate"
                    prop="levelThreeRate"
                  >
                    <el-input-number
                      class="w-full"
                      :precision="2"
                      v-model="formData.levelThreeRate"
                      :min="0"
                      :step="1"
                    >
                      <template #suffix>
                        <span>%</span>
                      </template></el-input-number
                    >
                  </el-form-item>
                </div>
                <div class="form-group-title">其他信息</div>
                <div class="form-item-box-basic">
                  <el-form-item
                    class="form-itme-width_100"
                    label="备注说明"
                    id="notes"
                    prop="notes"
                  >
                    <el-input
                      v-model="formData.notes"
                      :rows="4"
                      type="textarea"
                      placeholder="请输入备注说明"
                    />
                  </el-form-item>
                  <el-form-item
                    class="form-itme-width_100"
                    label="上传附件"
                    id="attachment"
                    prop="attachment"
                  >
                    <dc-upload
                      v-model="formData.attachment"
                      :targetType="Const.targetType.MMR_PLAN_ORDER"
                    />
                  </el-form-item>
                </div>
              </div>
            </el-form>
          </div>
        </div>
        <div class="left-footer">
          <el-button type="primary" @click="submitForm" v-loading="loading">提交</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script setup>
import { computed, onMounted, reactive } from 'vue';
import Api from '@/api/index';
import store from '@/store/index';
import Const from '@/const';
import { useRoute } from 'vue-router';
import { getDetail, getDetailByParams } from '@/api/system/param';
const route = useRoute();
const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();
// 用户信息
const userInfo = computed(() => store.getters.userInfo);

const props = defineProps({
  projectInfo: {
    type: Object,
    default: {},
  },
  isShowChild: {
    type: Boolean,
    default: true,
  },
});

// 数据字典
const {
  // DC_MMR_PLAN_TYPE,
  DC_PMS_PROJECT_QIOPMENT,
  DC_MMR_PLAN_PHASE,
  DC_PMS_PROJECT_PHASE,
} = proxy.useCache([
  {
    // key: 'DC_MMR_PLAN_TYPE',
    key: 'DC_PMS_PROJECT_PHASE',
  },
  {
    key: 'DC_MMR_PLAN_PHASE',
  },
  {
    key: 'DC_PMS_PROJECT_QIOPMENT',
  },
]);

const compData = reactive({
  endCustomerProjectCodeOption: [],
  areaOptions: [],
  loading: false,
  open: false,
  formData: {
    tpmId: null,
    customerProductCode: null,
    moduleCount: 1,
    lineCount: 1,
    levelOneRate: 30,
    levelTwoRate: 60,
    levelThreeRate: 10,
    singleRsPriceNumber: 0,
    singleLbuPriceNumber: 0,
    singleRampPriceNumber: 0,
    singleSusPriceNumber: 0,
    singleRsFreeCount: 0,
    singleLbuFreeCount: 0,
    singleRampFreeCount: 0,
    singleSusFreeCount: 0,
    mmrPlanPhases: ['DC_MMR_PLAN_PHASE_LBU', 'DC_MMR_PLAN_PHASE_RAMP', 'DC_MMR_PLAN_PHASE_SUS'],

    customerProductCode: null,
    projectCode: null,
    stationCode: null,
    cmCode: null,
    country: '',
    province: '',
    city: '',
    etaTime: '',
    tpmDeptId: null,
  },

  detailInfo: null,
  title: null,
  selectList: [],
  selectedItem: null,
  // areaOptions: [],
  projectCode: null,
  stationCode: null,
  deptList: [],
});

const {
  loading,
  open,
  formData,
  detailInfo,
  title,
  selectList,
  selectedItem,
  // areaOptions,
  projectCode,
  deptList,
  areaOptions,
  endCustomerProjectCodeOption,
} = toRefs(compData);

const rules = computed(() => {
  return {
    // lineCode: [{ required: true, message: '请输入', trigger: 'change' }],
    npiOrMp: [{ required: true, message: '请选择', trigger: 'change' }],
    customerId: [{ required: true, message: '请输入', trigger: 'change' }],
    quipmentDictId: [{ required: true, message: '请选择', trigger: 'change' }],
    mmrPlanPhases: [{ required: true, message: '请选择', trigger: 'change' }],
    cmId: [{ required: true, message: '请选择', trigger: 'change' }],
    manMachineWiringRatio: [{ required: true, message: '请输入', trigger: 'change' }],
    humanMachineLineDefenseRatio: [{ required: true, message: '请选择', trigger: 'change' }],
    humanRobotClimbingRatio: [{ required: true, message: '请选择', trigger: 'change' }],
    chargeUser: [{ required: true, message: '请选择', trigger: 'change' }],
    levelOneRate: [{ required: true, message: '请选择', trigger: 'change' }],
    levelTwoRate: [{ required: true, message: '请选择', trigger: 'change' }],
    levelThreeRate: [{ required: true, message: '请选择', trigger: 'change' }],
    moduleCount: [{ required: true, message: '请选择', trigger: 'change' }],
    lineCount: [{ required: true, message: '请选择', trigger: 'change' }],
    regionId: [{ required: true, message: '请选择', trigger: 'change' }],
    cmCode: [
      {
        required: true,
        message: '客户编码不能为空,请到客户管理中添加对应的客户编码',
        trigger: 'change',
      },
    ],
    // customerProductName: [{ required: true, message: '请选择', trigger: 'change' }],
    tpmId: [{ required: true, message: '请选择', trigger: 'change' }],
    etaTime: [{ required: true, message: '请选择', trigger: 'change' }],
    // region: [{ required: true, message: '请选择', trigger: 'change' }],
    projectConfigId: [{ required: true, message: '请选择', trigger: 'change' }],
    stationConfigId: [{ required: true, message: '请选择', trigger: 'change' }],
    deptName: [{ required: true, message: '请选择', trigger: 'change' }],
    singleRsCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleRsPoCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleRsPriceNumber: [{ required: true, message: '请输入', trigger: 'change' }],

    singleLbuCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleLbuPoCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleLbuPriceNumber: [{ required: true, message: '请输入', trigger: 'change' }],
    // singleLbuFreeCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleRampCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleRampPoCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleRampPriceNumber: [{ required: true, message: '请输入', trigger: 'change' }],
    // singleRampFreeCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleSusCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleSusPoCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleSusPriceNumber: [{ required: true, message: '请输入', trigger: 'change' }],
    // singleSusFreeCount: [{ required: true, message: '请输入', trigger: 'change' }],
    singleLbuStartDate: [
      { required: formData.value.singleLbuPriceNumber > 0, message: '请选择', trigger: 'change' },
    ],
    singleLbuEndDate: [
      { required: formData.value.singleLbuPriceNumber > 0, message: '请选择', trigger: 'change' },
    ],
    singleRampStartDate: [
      { required: formData.value.singleRampPriceNumber > 0, message: '请选择', trigger: 'change' },
    ],
    singleRampEndDate: [
      { required: formData.value.singleRampPriceNumber > 0, message: '请选择', trigger: 'change' },
    ],
    singleSusStartDate: [
      { required: formData.value.singleSusPriceNumber > 0, message: '请选择', trigger: 'change' },
    ],
    singleSusEndDate: [
      { required: formData.value.singleSusPriceNumber > 0, message: '请选择', trigger: 'change' },
    ],
  };
});

const getAreaOptions = async () => {
  const res = await Api.system.region.getLazyTreegetList();
  const { code, data } = res.data;
  if (code === 200) {
    areaOptions.value = data;
  }
};

const initColumn = async () => {
  const res = await getDetailByParams({
    paramKey: 'DC_MMR_PLAN_USER_TEMPLATE_ID',
  });
  const { code } = res.data;
  if (code === 200) {
    formData.value.funcFieldTemplateId = res.data.data.paramValue;
  }
};

onMounted(async () => {
  if (route.params.id) {
    title.value = '编辑现场计划单';
  } else {
    title.value = '创建现场计划单';
  }
  await getAreaOptions();
  await selectData();
  await getDeptData();
});

// 根据TPMId匹配所属部门
const matchDeptName = async (userId, hideMsg = false) => {
  // const res = await key是  deptName
  const res = await Api.pdp.mmrPlanOrder.findUserDept({
    userId,
  });
  const { code, data } = res.data;
  if (code === 200) {
    if (!data) {
      if (!hideMsg) proxy.$message.info('未自动匹配到TPMDRI所属部门');
      return;
    } else {
      formData.value.deptName = data?.productCode;
    }
  }
};

// 获取数据
const getDeptData = async () => {
  try {
    loading.value = true;
    const params = { current: 1, size: 100 };
    const res = await Api.pdp.productDepartment.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      deptList.value = data.records;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
// 保存提交
const submitForm = async () => {
  proxy.$refs['ruleFormRef']
    .validate()
    .then(async valid => {
      if (valid) {
        loading.value = true;
        // 检查三个输入框的总和是否超过 1
        const sum =
          Number(formData.value.levelOneRate) +
          Number(formData.value.levelTwoRate) +
          Number(formData.value.levelThreeRate);
        if (sum !== 100) {
          proxy.$message({
            type: 'error',
            message: 'L1、L2、L3人占比总和要等于百分之百，请调整后重新提交！',
          });
          return; // 阻止提交
        }
        const idString = proxy.arrayToIdsString({
          array: formData.value.attachment,
        });
        const form = {
          ...formData.value,
          attachment: idString,
          cmId: formData.value.cmId?.id ? formData.value.cmId?.id : formData.value.cmId,
          // stationConfigId: formData.value.stationConfigId?.id
          //   ? formData.value.stationConfigId.id
          //   : formData.value.stationConfigId,
          projectConfigId: undefined,
          quipmentDictId: formData.value.quipmentDictId
            ? formData.value.quipmentDictId?.join(',')
            : undefined,
          customerId: formData.value.customerId?.id
            ? formData.value.customerId.id
            : formData.value.customerId,
          regionId: formData.value.regionId?.areaName
            ? formData.value.regionId?.areaName
            : formData.value.regionId,
          projectId: formData.value.projectId || projectCode.value?.id,
          levelTwoRate: formData.value.levelTwoRate / 100,
          levelThreeRate: formData.value.levelThreeRate / 100,
          levelOneRate: formData.value.levelOneRate / 100,
          mmrPlanPhases: formData.value.mmrPlanPhases.join(','),
          funcFieldTemplateId:
            formData.value.funcFieldTemplateId?.id || formData.value.funcFieldTemplateId,
        };
        try {
          const res = await Api.pdp.mmrPlanOrder.submit(form);
          const { code } = res.data;
          loading.value = false;
          if (code === 200) {
            proxy.$message({ type: 'success', message: '保存成功' });
            closeDrawer();
          }
        } catch (error) {
          loading.value = false;
        }
      }
    })
    .catch(errors => {
      const firstErrorField = Object.keys(errors)[0];
      proxy.$refs['ruleFormRef'].scrollToField(firstErrorField);
    });
};

// 下拉数据
const selectData = async () => {
  const params = {
    current: 1,
    size: 1000,
  };
  const res = await Api.pdp.mmrPlanOrder.select(params);
  const { code, data } = res.data;
  if (code == 200) {
    selectList.value = data.records;
  }
};

const hanldeMemberChange = val => {
  console.info('hanldeMemberChange', val);
};

const handleProjectChange = projectObj => {
  if (projectObj?.[0]) {
    endCustomerProjectCodeOption.value = projectObj?.[0].customerCode?.split(',')?.map(op => {
      return {
        label: op,
        value: op,
      };
    });
  }
};

const changeCustomer = customer => {
  formData.value.customerId = customer?.id;
  formData.value.customerName = customer?.fullname;
};

const changeCMId = customer => {
  formData.value.cmId = customer?.id;
  formData.value.cmCode = customer?.cmCode;
  formData.value.cmCode = customer?.cmCode;
  formData.value.address = customer?.address;
  formData.value.areaCode = customer?.areaCode;
};

// 选择地址后带入这些
const customerAreaChange = areaData => {
  const keys = ['factoryCode', 'country', 'province', 'city', 'address'];
  keys.forEach(k => {
    formData.value[k] = areaData?.[k];
  });
  formData.value.regionId = areaData?.id;
  formData.value.distinguish = areaData?.area;
};

function findRegionName(ids, regions) {
  const result = [];
  function search(tree) {
    for (const node of tree) {
      if (ids.includes(node.id)) {
        result.push(node.title);
      }
      if (node.children) {
        search(node.children);
      }
    }
  }
  search(regions);
  return result;
}

const handleAreaChange = (val, scoped) => {
  scoped.formData.areaCode = val ? val.join(',') : null;
  scoped.formData.customerId = formData.value.customerId;
  scoped.formData.areaName = findRegionName(val || [], areaOptions.value).join(',');
};

const inited = ref(false);

const hanleProjectConfig = row => {
  // 编辑模式下首次触发不做联动效果
  if (formData.value.id && !inited.value) {
    inited.value = true;
    return;
  }
  projectCode.value = row;
  formData.value.projectCode = row?.projectCode;
  formData.value.projectId = row?.id;
  // formData.value.cmCode = row?.cmCode;
  formData.value.stationCode = row?.station;
  formData.value.customerId = row?.customerId;
  formData.value.customerName = row?.customerName;
  formData.value.chargeUser = row?.tpmDriId;
  formData.value.tpmId = row?.tpmDriId;
  formData.value.quipmentDictId = row.quipmentDictId ? row.quipmentDictId.split(',') : undefined;

  // formData.value.npiOrMp = row?.phaseDictId;
  if (row?.tpmDriId) {
    matchDeptName(formData.value.tpmId, false);
  }
};

// 处理选择变化
const handleSelect = selectedValue => {
  selectedItem.value = selectList.value.find(item => item.fnumber === selectedValue);
};
// 取消
const closeDrawer = () => {
  emit('confirm');
  formData.value = {
    tpmId: null,
    customerProductCode: null,
    moduleCount: 1,
    lineCount: 1,
    levelOneRate: 30,
    levelTwoRate: 60,
    levelThreeRate: 10,
  };
  open.value = false;
  // areaOptions.value = [];
};

// 打开抽屉
const openDrawer = async () => {
  open.value = true;
  // await getRegion();
  if (route.params.id) {
    const params = {
      id: route.params.id,
    };

    const res = await Api.pdp.mmrPlanOrder.detail(params);
    // const res = await Api.pdp.mmrPlanOrder.findProjectVo(params);
    const { code, data } = res.data;
    if (code == 200) {
      detailInfo.value = data;
      formData.value = { ...detailInfo.value, projectConfigId: data.projectId };
      formData.value.levelOneRate = data.levelOneRate * 100;
      formData.value.levelTwoRate = data.levelTwoRate * 100;
      formData.value.quipmentDictId = data.quipmentDictId ? data.quipmentDictId.split(',') : [];
      formData.value.levelThreeRate = data.levelThreeRate * 100;
      formData.value.mmrPlanPhases = data.mmrPlanPhases ? data.mmrPlanPhases.split(',') : [];
    }
  } else {
    formData.value.tpmId = userInfo.value.user_id;
    formData.value.chargeUser = userInfo.value.user_id;
    initColumn();
    matchDeptName(formData.value.tpmId, true);
  }
};

const clearRuleError = () => {
  proxy.$refs['ruleFormRef'].clearValidate();
};

// // 级联选择器
// const handleChange = value => {
//   formData.value.region = [];
//   formData.value.country = value ? value[0] : '';
//   formData.value.province = value ? value[1] : '';
//   formData.value.city = value && value.length > 2 ? value[2] : ''; // 如果 city 有值，则赋值，否则为空字符串
//   formData.value.region = value ? value : null;
// };

const handleTpmChange = row => {
  formData.value.tpmId = row.id;
  // 联动
  formData.value.tpmDeptId = row.deptId;
  matchDeptName(row.id, false);
};

defineExpose({
  openDrawer,
});
</script>
<style lang="scss" scoped>
.wrap {
  .custom-form {
    display: flex;
    flex-wrap: wrap;

    .form-item-info {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }

    .form-itme-width {
      &_50 {
        width: 50%;
        margin-right: 0;
      }
      &_25 {
        width: 33%;
        margin-right: 0;
      }

      &_100 {
        width: 100%;
        margin-right: 0;
      }
    }

    .tag-group {
      padding: 0 12px;
      width: 100%;
      overflow: auto;

      .placeholder {
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

// @media (max-width: 1360px) {
//   .form-itme-width_50 {
//     width: 100% !important;
//     margin-right: 0;
//   }
// }
</style>
<style lang="scss" scoped>
@use '@/styles/projectDrawer';
</style>
<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .form-item-box-basic {
    padding-left: 16px;
  }
  :deep(.form-itme-width_50),
  .form-itme-width_50 {
    width: 50%;
    margin-right: 0;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }

  .wrap-left-form {
    width: 95%;
  }

  .custom-form {
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .form-center {
    display: flex;
    flex-wrap: wrap;
  }

  .form-group-title {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 28px 0 32px 0;
    font-weight: 600;
    font-size: 16px;
    color: #333;

    &::before {
      margin-right: 4px;
      display: block;
      content: '';
      width: 4px;
      height: 13px;
      background-color: #f78431;
    }

    .add-box {
      display: flex;
      align-items: center;
      margin-left: 40px;
      font-weight: 400;
      font-size: 14px;
      color: #f78431;
      cursor: pointer;
    }
  }

  .form-item-row {
    width: 93% !important;
  }

  .form-item-width {
    width: 100%;
  }
}

.dialog-search-box {
  width: 900px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 30%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 100px);
    }
  }
}
</style>
