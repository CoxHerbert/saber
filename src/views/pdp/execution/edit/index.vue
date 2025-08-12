<template>
  <basic-container>
    <div class="content-warp page-execution-edit" :class="pageRenderSize">
      <div v-loading="loading" class="drawer-container">
        <!-- <div class="step-box">
          <el-steps v-if="detailData" :active="step">
            <el-step
              v-for="(item, index) in dictMaps.DC_ERP_ORDER_STATUS.filter((_, i) => i < 4)"
              :key="index"
            >
              <template #icon>
                <div class="step-item" :class="getCalss(index)">
                  <span class="step-num">
                    <span v-if="index >= step">{{ index + 1 }}</span>
                    <el-icon v-else><Check /></el-icon>
                  </span>
                  <span class="step-title"
                    >{{ item.dictValue }} <br />
                    <dc-view
                      v-model="detailData.tpmOperatorId"
                      objectName="user"
                      v-if="index === 0"
                    />
                    <dc-view
                      v-model="detailData.tpmHeaderOperatorId"
                      objectName="user"
                      v-if="index === 1"
                    />
                    <dc-view
                      v-model="detailData.operationOperatorId"
                      objectName="user"
                      v-if="index === 2"
                    />
                  </span>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div> -->
        <div class="step-new">
          <dc-steps v-bind="stepProps" :activeIndex="step"></dc-steps>
        </div>
        <div v-if="detailData" class="content-box">
          <!-- <el-scrollbar ref="scrollbarRef" style="height: calc(100vh - 210px)"> -->
          <div class="form-box">
            <el-form
              ref="formRef"
              :model="detailData"
              label-suffix=":"
              class="form-main"
              :disabled="allDisabled"
              :label-width="'120px'"
            >
              <div
                v-for="(group, i) in columns"
                class="group-box"
                :class="
                  group.classList +
                  `${expand[group.prop] ? ' ' : ' hide-expand'}` +
                  (group.type === talble && isFull ? ' full-screen' : '')
                "
              >
                <div :key="i" class="group-header">
                  {{ group.name }}
                  <el-icon
                    v-if="group.showToggleExpand"
                    @click="toggleExpand(group.prop, !expand[group.prop])"
                    class="toggle-expand-icon"
                    ><CaretRight v-if="!expand[group.prop]" /> <CaretBottom v-else
                  /></el-icon>
                </div>
                <template v-if="group.renderType === 'form'">
                  <template v-for="col in group.items">
                    <el-form-item
                      v-if="
                        !col.showFunc ||
                        (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                      "
                      class="form-item-operation-detail"
                      :class="`form-item-${col.prop}`"
                      :label="col.label"
                      :prop="col.prop"
                      :rules="getColumnRules(col)"
                    >
                      <el-input
                        v-if="col.type === 'input'"
                        :placeholder="col.props?.placholder || `请输入${col.label}`"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                        clearable
                      />
                      <el-select
                        class="param-value"
                        v-else-if="col.type === 'dict'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placholder || `请选择${col.label}`"
                        v-bind="col.props"
                        clearable
                        @change="
                          val => {
                            handleFormItemChange(val, col);
                          }
                        "
                      >
                        <template v-if="col.withGroup">
                          <el-option-group
                            v-for="(opGroup, i) in dictMaps?.[col.dictKey] || []"
                            :key="i"
                            :label="opGroup[col.labelKey]"
                          >
                            <el-option
                              v-for="(option, j) in opGroup.children"
                              :key="j"
                              :label="option[col.labelKey]"
                              :value="option[col.valueKey]"
                            />
                          </el-option-group>
                        </template>
                        <template v-else>
                          <el-option
                            v-for="(option, j) in dictMaps?.[col.dictKey] || []"
                            :key="j"
                            :label="option[col.labelKey]"
                            :value="option[col.valueKey]"
                          />
                        </template>
                      </el-select>
                      <el-date-picker
                        v-else-if="col.type === 'date'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placholder || `请选择${col.label}`"
                        v-bind="col.props"
                        value-format="YYYY-MM-DD"
                        format="YYYY-MM-DD"
                        clearable
                      ></el-date-picker>
                      <el-input-number
                        v-else-if="col.type === 'number'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        :placeholder="col.props?.placholder || `请输入${col.label}`"
                      />
                      <UserRemoteQuery
                        v-else-if="col.type === 'select-user'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                      />
                      <remote-select
                        v-else-if="col.type === 'remote-select'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        @change="
                          val => {
                            handleTableItemChange(val, {}, col);
                          }
                        "
                      />
                      <dc-select-user
                        v-else-if="col.type === 'dc-select-user'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                      />
                      <dc-upload
                        v-else-if="col.type === 'dc-upload'"
                        v-model="detailData[col.prop]"
                        v-bind="col.props"
                        :disabled="allDisabled"
                      />
                    </el-form-item>
                  </template>
                </template>
                <template v-if="group.renderType === 'table'">
                  <div class="group-toolbar">
                    <el-button
                      v-if="detailData?.dcErpOrderStatus === '1876789881673412609'"
                      type="primary"
                      :disabled="loading"
                      @click="bachSumitErp"
                      v-permission="
                        $route.query.list === 'operation'
                          ? { id: 'OPT_ERP_ORDER_BATCH_SUM' }
                          : undefined
                      "
                      >批量提交ERP</el-button
                    >
                    <el-button
                      v-if="detailData?.dcErpOrderStatus === '1876789752111362049'"
                      v-permission="
                        $route.query.list === 'tpm' &&
                        detailData?.dcErpOrderStatus === '1876789752111362049'
                          ? { id: 'TPM_ERP_ORDER_ADD_LINE' }
                          : undefined
                      "
                      @click="addRow"
                      >新增行
                    </el-button>
                    <el-button
                      v-if="detailData?.dcErpOrderStatus === '1876789752111362049'"
                      v-permission="
                        $route.query.list === 'tpm' &&
                        detailData?.dcErpOrderStatus === '1876789752111362049'
                          ? { id: 'TPM_ERP_ORDER_COPY_LINE' }
                          : undefined
                      "
                      @click="copyRow"
                      >复制行</el-button
                    ><el-button
                      v-if="
                        ['1876789881673412609', '1876789752111362049'].includes(
                          detailData?.dcErpOrderStatus
                        )
                      "
                      v-permission="
                        $route.query.list === 'tpm' &&
                        ['1876789881673412609', '1876789752111362049'].includes(
                          detailData?.dcErpOrderStatus
                        )
                          ? { id: 'TPM_ERP_ORDER_DEL_LINE' }
                          : undefined
                      "
                      @click="removeRow"
                      >删除行</el-button
                    >
                    <el-button @click="isFull = !isFull">{{
                      isFull ? '取消全屏' : '全屏展示'
                    }}</el-button>
                  </div>
                  <el-form-item
                    class="form-item-table"
                    :prop="group.prop"
                    :label-width="0"
                    :rules="getTableRule(group.items)"
                  >
                    <el-table
                      border
                      :data="detailData[group.prop]"
                      :row-class-name="tableRowClassName"
                      :style="{
                        height: '100%',
                      }"
                      @row-click="handleRowClick"
                      @selection-change="handleSelectionChange"
                    >
                      <template v-for="(col, i) in group.items">
                        <el-table-column
                          v-if="
                            col.type === 'selection' &&
                            (!col.showFunc ||
                              (col.showFunc && col.showFunc?.call && col.showFunc(detailData)))
                          "
                          type="selection"
                          :fixed="col.fixed"
                          :width="col.width"
                          :min-width="col.minWidth"
                          :key="i"
                        >
                        </el-table-column>
                        <el-table-column
                          :key="'index' + i"
                          v-else-if="col.type === 'dataIndex'"
                          label="序号"
                          fixed="left"
                          align="center"
                          min-width="80px"
                        >
                          <template #default="scoped">{{ scoped.$index + 1 }}</template>
                        </el-table-column>
                        <el-table-column
                          v-else-if="
                            !col.showFunc ||
                            (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                          "
                          :key="`other-${i}`"
                          :fixed="col.fixed"
                          :width="col.width"
                          align="left"
                          :min-width="col.minWidth"
                          :prop="col.prop"
                        >
                          <template #header><span v-html="getLabelCode(col)"> </span></template>
                          <template #default="scoped">
                            <!-- && editColumn === col.prop -->
                            <template v-if="scoped.$index === editIndex">
                              <el-select
                                class="param-value"
                                :class="{
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                v-if="col.type === 'dict'"
                                v-model="scoped.row[col.prop]"
                                :placeholder="col.props?.placholder || `请选择${col.label}`"
                                v-bind="col.props"
                                clearable
                              >
                                <template v-if="col.withGroup">
                                  <el-option-group
                                    v-for="(opGroup, i) in dictMaps?.[col.dictKey] || []"
                                    :key="i"
                                    :label="opGroup[col.labelKey]"
                                  >
                                    <el-option
                                      v-for="(option, j) in opGroup.children"
                                      :key="j"
                                      :label="option[col.labelKey]"
                                      :value="option[col.valueKey]"
                                    />
                                  </el-option-group>
                                </template>
                                <template v-else>
                                  <el-option
                                    v-for="(option, j) in dictMaps?.[col.dictKey] || []"
                                    :key="j"
                                    :label="option[col.labelKey]"
                                    :value="option[col.valueKey]"
                                  />
                                </template>
                              </el-select>

                              <UserRemoteQuery
                                v-else-if="col.type === 'select-user'"
                                :class="{
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                v-model="scoped.row[col.prop]"
                                v-bind="col.props"
                              />
                              <remote-select
                                v-else-if="col.type === 'remote-select'"
                                v-model="scoped.row[col.prop]"
                                v-bind="col.props"
                                :class="{
                                  [col.props.class]: true,
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                @change="
                                  val => {
                                    handleTableItemChange(val, scoped, col);
                                  }
                                "
                              />
                              <component
                                v-else
                                :is="col.is"
                                :class="{
                                  'is-not-required':
                                    col.prop === 'version' && !scoped.row.isMustVersion,
                                  'is-null':
                                    col.required &&
                                    [null, undefined, ''].includes(scoped.row[col.prop]),
                                }"
                                :placeholder="getPlaceholder(col)"
                                v-bind="col.props"
                                v-model="scoped.row[col.prop]"
                              >
                              </component>
                            </template>
                            <span
                              v-else
                              @click="handleClickCeil(scoped.$index, col.prop)"
                              class="ceil-value"
                              >{{ scoped.row[col.prop] || '-' }}</span
                            >
                          </template>
                        </el-table-column>
                      </template>
                    </el-table>
                  </el-form-item>
                </template>
              </div>
            </el-form>
          </div>
          <!-- </el-scrollbar> -->
          <div class="footer">
            <el-button
              v-if="
                !checkIsAuditShow &&
                !['1876789752111362049', '1876789924404981761', '1876789821522898946'].includes(
                  detailData?.dcErpOrderStatus
                )
              "
              type="primary"
              :disabled="loading"
              v-permission="
                !checkIsAuditShow &&
                !['1876789924404981761', '1876789821522898946'].includes(
                  detailData?.dcErpOrderStatus
                ) &&
                $route.query.list === 'operation'
                  ? { id: 'OPT_ERP_ORDER_BATCH_SUM' }
                  : undefined
              "
              @click="
                detailData?.dcErpOrderStatus === '1876789881673412609'
                  ? showOrgSelectDialog('submit')
                  : submit()
              "
              >{{
                detailData?.dcErpOrderStatus === '1876789881673412609' ? '提交全部' : '提交'
              }}</el-button
            >
            <el-button
              v-if="detailData?.dcErpOrderStatus === '1876789752111362049'"
              type="primary"
              v-permission="
                detailData?.dcErpOrderStatus === '1876789752111362049' &&
                $route.query.list === 'tpm'
                  ? { id: 'TPM_ERP_ORDER_AUDIT_HEADER' }
                  : undefined
              "
              @click="handleClickOpenAetAuditUser"
              >指定审核主管</el-button
            >
            <el-button
              v-if="
                !checkIsAuditShow &&
                !['1876789924404981761', '1876789821522898946', '1876789881673412609'].includes(
                  detailData?.dcErpOrderStatus
                )
              "
              v-permission="
                !checkIsAuditShow &&
                !['1876789924404981761', '1876789821522898946', '1876789881673412609'].includes(
                  detailData?.dcErpOrderStatus
                ) &&
                $route.query.list === 'tpm'
                  ? { id: 'TPM_ERP_ORDER_SAVE' }
                  : $route.query.list === 'operation'
                  ? { id: 'OPT_ERP_ORDER_BATCH_SUM' }
                  : undefined
              "
              @click="saveData"
              >保存</el-button
            >
            <el-button
              v-if="detailData?.dcErpOrderStatus === '1876789821522898946'"
              type="primary"
              @click="doAudit"
              v-permission="
                detailData?.dcErpOrderStatus === '1876789821522898946' &&
                $route.query.list === 'tpm'
                  ? { id: 'TPM_ERP_ORDER_AUDIT' }
                  : undefined
              "
              >审核</el-button
            >
            <el-button
              v-if="detailData.dcErpOrderStatus === '1876789881673412609'"
              @click="rejectYybc"
              v-permission="
                detailData.dcErpOrderStatus === '1876789881673412609' &&
                $route.query.list === 'operation'
                  ? { id: 'OPT_ERP_ORDER_BATCH_SUM' }
                  : undefined
              "
              >驳回</el-button
            >
            <el-button @click="close">取消</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="auditDialogVisible"
      :title="mode === 'setAuditUser' ? '提交审核主管' : '执行单审核'"
      :close-on-click-modal="false"
      :width="mode === 'setAuditUser' ? '30%' : '400px'"
      align-center
      class="audit"
    >
      <el-form
        ref="formAudit"
        label-suffix=":"
        :model="mode == 'setAuditUser' ? auditFormData : auditFormData"
        :rules="getFormAuditRules"
      >
        <template v-if="mode == 'setAuditUser'">
          <el-form-item label="选择主管" prop="selectedSupervisor">
            <el-select v-model="auditFormData.selectedSupervisor" placeholder="请选择">
              <el-option
                v-for="item in roleIdOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item prop="isPass" label="审核结果">
            <el-radio-group
              v-model="auditFormData.isPass"
              :disabled="detailData.dcErpOrderStatus === '1876789881673412609'"
              @change="
                val => {
                  if (val === '1') {
                    auditFormData.causeOfRejection = '';
                  }
                }
              "
            >
              <el-radio label="1">通过</el-radio>
              <el-radio label="2">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-show="auditFormData.isPass === '2'"
            prop="causeOfRejection"
            label="审核意见"
          >
            <el-input
              :disabled="auditFormData.isPass === '1'"
              v-model="auditFormData.causeOfRejection"
              placeholder="请输入审核意见"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="setAuditUser">取消</el-button>

        <el-button
          type="primary"
          :disabled="loading"
          @click="
            () => {
              mode === 'audit'
                ? audit(auditFormData)
                : confirmReject(auditFormData.selectedSupervisor);
            }
          "
          >确定</el-button
        >
      </template>
    </el-dialog>
    <el-dialog
      v-model="dialogOrgSelectVisible"
      title="销售组织选择"
      :close-on-click-modal="false"
      width="400px"
      align-center
      class="audit"
    >
      <el-form ref="formOrgSelect" :model="orgSelectFormData" label-suffix=":">
        <el-form-item
          label="销售组织"
          prop="orgId"
          :rules="[
            {
              required: true,
              message: '请选择销售组织',
              trigger: ['blur', 'change'],
            },
          ]"
        >
          <el-select v-model="orgSelectFormData.orgId">
            <el-option
              v-for="(op, i) in orgList"
              :key="i"
              :label="op.orgName"
              :value="op.orgId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          label="库存组织"
          prop="stockOrgId"
          :rules="[
            {
              required: true,
              message: '请选择库存组织',
              trigger: ['blur', 'change'],
            },
          ]"
        >
          <el-select v-model="orgSelectFormData.stockOrgId">
            <el-option
              v-for="(op, i) in orgList"
              :key="i"
              :label="op.orgName"
              :value="op.orgId"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="primary"
          :disabled="loading"
          @click="submitOrgSelectDialog(orgSelectFormData)"
          >确定</el-button
        >
        <el-button @click="dialogOrgSelectVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </basic-container>
</template>
<script setup>
import {
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Api from '@/api/index';
import detailConfig from './utils';
import UserRemoteQuery from '@/components/dc/components/dc-select-user/remote-query.vue';
import remoteSelect from '../cpns/remote-select.vue';
import useUnsavedChanges from '@/mixins/unsaved-changes-guard';
import prefixTextMaps from '@/const/modules/prefixTextMaps';

const { markAsUnsaved, markAsSaved, bindEventCallback, unBindEventCallback } = useUnsavedChanges();

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const pageData = reactive({
  editIndex: -1,
  editColumn: '',
  boxWidth: 0,
  loading: false,
  detailId: '',
  step: 0,
  detailData: null,
  roleIdOptions: [],
  mode: 'setAuditUser',
  auditDialogVisible: false,
  auditFormData: {
    isPass: '',
    selectedSupervisor: '',
  },

  dictMaps: {
    DC_BILL_TYPE: [],
    DC_PMS_PROJECT_ORDER: [],
    DC_ERP_ORDER_STATUS: [],
    DC_WMS_IN_TYPE_SCM: [],
    DC_WMS_IN_STATUS: [],
  },
  selectionRows: [],
  orgList: [],
  orgSelectFormData: {},
  dialogOrgSelectVisible: false,
  isFull: false,
});

const { columns } = detailConfig;

const {
  detailId,
  step,
  detailData,
  loading,
  dictMaps,
  boxWidth,
  roleIdOptions,
  mode,
  auditDialogVisible,
  auditFormData,
  selectionRows,
  orgList,
  dialogOrgSelectVisible,
  orgSelectFormData,
  editIndex,
  editColumn,
  isFull,
} = toRefs(pageData);

const formOrgSelect = ref(null);

const getFormAuditRules = computed(() => {
  return mode.value === 'setAuditUser'
    ? {
        selectedSupervisor: [
          {
            required: true,
            validator(rule, value, callback) {
              if ([null, '', undefined].includes(value)) {
                callback(new Error('请选择主管'));
              } else callback();
            },
            trigger: ['blur', 'change'],
          },
        ],
      }
    : {
        isPass: [
          {
            required: true,
            message: '请选择审核结果',
            trigger: ['blur', 'change'],
          },
        ],
        causeOfRejection: [
          {
            required: auditFormData.value.isPass === '2',
            message: '请输入审核意见',
            trigger: ['blur', 'change'],
          },
        ],
      };
});

const checkIsAuditShow = computed(() => {
  if (detailData.value?.dcErpOrderStatus !== '1876789821522898946') {
    return false;
  }
  if (roleIdOptions.value?.length < 1) {
    return false;
  }

  const userInfo = proxy.$store.getters.userInfo;
  const isAdmin = userInfo?.role_id?.split(',').includes('1123598816738675201');
  const find = roleIdOptions.value.find(u => u.id === userInfo?.user_id);
  return isAdmin || !!find;
});

const handleClickOpenAetAuditUser = () => {
  formRef.value?.validate().then(() => {
    mode.value = 'setAuditUser';
    auditFormData.value.selectedSupervisor = detailData.value?.tpmHeaderOperatorId || '';
    auditDialogVisible.value = true;
  });
};

const doAudit = () => {
  mode.value = 'audit';
  auditDialogVisible.value = true;
};

const rejectYybc = () => {
  auditFormData.value.isPass = '2';
  mode.value = 'audit';
  auditDialogVisible.value = true;
};

const changeTimes = ref(0);

watch(
  () => detailData.value,
  () => {
    changeTimes.value = changeTimes.value + 1;
    if (changeTimes.value > 1) {
      markAsUnsaved();
    }
  },
  { deep: true }
);

const getColumnRules = col => {
  if (col.required) {
    return [
      {
        required: true,
        message: `${prefixTextMaps[col.type]}${col.label}`,
        trigger: ['blur', 'input', 'change'],
      },
    ];
  }
  return undefined;
};

const getPlaceholder = col => {
  if (col.is === 'el-input') {
    return `请输入${col.label}`;
  }
  return '';
};

const handleClickCeil = (index, prop) => {
  editIndex.value = index;
  // editColumn.value = prop;
};

const handleRowClick = row => {
  const index = detailData.value.dcErpOrderNeList.findIndex(item => item === row);
  editIndex.value = index;
};

const pageRenderSize = computed(() => {
  if (boxWidth.value < 800) {
    return 'render-small';
  } else if (boxWidth.value >= 800 && boxWidth.value < 1200) {
    return 'render-middle';
  } else {
    return 'render-large';
  }
});

const getLabelCode = col => {
  const result =
    col.required || (detailData.value.billType !== '服务订单' && col.prop === 'insidePmName')
      ? `<span class="label-suffix">*</span>${col.label}`
      : col.label;
  return result;
};

const getStep = () => {
  if (detailData.value?.dcErpOrderStatus === '1876789821522898946') {
    step.value = 1;
  } else if (detailData.value?.dcErpOrderStatus === '1876789881673412609') {
    step.value = 2;
  } else if (detailData.value?.dcErpOrderStatus === '1876789924404981761') {
    step.value = 3;
  } else {
    step.value = 0;
  }
};

const handleFormItemChange = (val, col) => {
  if (col.prop === 'billType') {
    const keys = ['freeReasonName', 'costProjectNumber', 'deviceName'];
    const findGroup = columns.find(group => group.renderType === 'table');
    findGroup.items.forEach(col => {
      if (keys.some(key => col.prop === key)) {
        if (val === '优化订单') {
          col.required = true;
        } else {
          col.required = false;
        }
      }
    });
  }
};

const handleTableItemChange = (val, scoped, col) => {
  if (col.prop === 'materialNumber') {
    scoped.row.materialName = val?.fname || '';
    scoped.row.inventoryCategoryName = val?.fcategoryName;
    scoped.row.isMustVersion = !!val?.isMustVersion;
  }
};

const formAudit = ref(null);
const audit = formData => {
  formAudit.value.validate(async valid => {
    if (valid) {
      const formDataSend = {
        ...JSON.parse(JSON.stringify(detailData.value)),
        causeOfRejection: formData.isPass === '2' ? formData.causeOfRejection : '',
        attachmentId: Array.isArray(detailData.value.attachmentId)
          ? detailData.value.attachmentId?.join(',')
          : detailData.value.attachmentId,
      };

      const action =
        formData.isPass === '2' ? Api.pdp.dcErporder.neReject : Api.pdp.dcErporder.nePass;
      const res = await action(formDataSend);
      const { code } = res.data;
      if (code === 200) {
        formAudit.value.resetFields();
        auditDialogVisible.value = false;
        markAsSaved();
        // window.location.reload();
        router.go('-1');
      }
    }
  });
};
const confirmReject = uId => {
  formAudit.value.validate(async valid => {
    if (valid) {
      detailData.value.tpmHeaderOperatorId = uId;
      auditDialogVisible.value = false;
      submit();
    }
  });
};

const show = async id => {
  // title.value = id ? '编辑执行单' : '新增执行单';
  loading.value = true;
  if (id) {
    detailId.value = id;
    // visible.value = true;
    const res = await Api.pdp.dcErporder.neGetDetail({
      id: detailId.value,
    });
    const { code, data } = res.data;
    if (code === 200) {
      const dataSet = {
        ...data,
        dcErpOrderNeList: (data.dcErpOrderNeList || []).map(row => {
          return {
            ...row,
            // 加个临时id用来标记数据，因为新增的数据没有id
            ___tempId: Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6),
          };
        }),
      };
      detailData.value = {
        ...dataSet,
        // attachmentId: dataSet.attachmentId ? dataSet.attachmentId?.split(',') : [],
      };
      getStep();
      if (
        ['1876789821522898946', '1876789752111362049'].includes(detailData.value?.dcErpOrderStatus)
      ) {
        getAuditUsers();
      }
    }
  }
  loading.value = false;
};

const uesrIdMaps = {
  '1876789752111362049': 'createUserId',
  '1876789821522898946': 'auditUserId',
  '1876789881673412609': 'operationOperatorId',
};
const AuditTimeMaps = {
  '1876789752111362049': 'createTime',
  '1876789821522898946': 'auditTime',
  '1876789881673412609': 'operationOperatorDate',
};

const getUserId = item => {
  return detailData.value?.[uesrIdMaps[item.id]];
};

const getTime = item => {
  return detailData.value?.[AuditTimeMaps[item.id]];
};

const stepProps = computed(() => {
  return {
    options: dictMaps.value.DC_ERP_ORDER_STATUS.filter((_, i) => i < 4).map(item => {
      return {
        ...item,
        userId: getUserId(item),
        time: getTime(item),
      };
    }),
    activeIndex: getStep(),
    labelKey: 'dictValue',
    timeKey: 'time',
    nameKey: 'userId',
    nameType: 'userId',
  };
});

/** 获取组织信息 */
const getOrgList = async () => {
  //
  const res = await Api.pdp.execution.orgList({
    // current: 1,
    // size: 1000,
  });
  const { code, data } = res.data;
  if (code === 200) {
    orgList.value = data;
  }
};

/** 获取审核主管列表 */
const getAuditUsers = async () => {
  const res = await Api.pdp.dcErporder.getAuditUsers({
    roleId: '1877174804015386626',
  });
  const { code, data } = res.data;
  if (code === 200) {
    roleIdOptions.value = data;
  }
};

const close = () => {
  if (route.query.from === 'add') {
    router.push({
      path: '/pdp/execution/tpm-list',
    });
  } else {
    router.go(-1);
  }
};

const formRef = ref(null);
const scrollbarRef = ref(null);

/** 选择变更 */
const handleSelectionChange = val => {
  selectionRows.value = val;
};

const tableRowClassName = ({ row }) => {
  if (detailData.value?.dcErpOrderStatus === '1876789752111362049' && !row.id) {
    return 'new-row';
  }
  return undefined;
};

// 展示组织选择弹框，清空数据，标记来源
const showOrgSelectDialog = from => {
  orgSelectFormData.value.orgId = '';
  orgSelectFormData.value.from = from;
  dialogOrgSelectVisible.value = true;
};

const bachSumitErp = () => {
  if (selectionRows.value?.length < 1) {
    proxy.$message.error('请先选择指定的数据');
  } else {
    showOrgSelectDialog('bachSumitErp');
    // submit(true);
  }
};

const submitOrgSelectDialog = formData => {
  formOrgSelect.value.validate(valid => {
    if (valid) {
      // 根据来源传参
      submit(formData.from === 'submit' ? false : true, formData);
    }
  });
};

const removeRow = () => {
  if (selectionRows.value?.length < 1) {
    proxy.$message.error('请先选中要删除的行');
    return;
  }
  if (detailData.value.dcErpOrderNeList?.length == selectionRows.value?.length) {
    proxy.$message.error('明细信息至少应保留1条数据');
    return;
  }

  // if (selectionRows.value.find(row => row.id)) {
  //   proxy.$message.error('仅支持删除复制或新建(蓝色角标)的行');
  //   return;
  // }
  detailData.value.dcErpOrderNeList = detailData.value.dcErpOrderNeList.filter(row => {
    return !selectionRows.value.find(r => row.___tempId === r.___tempId);
  });
  setTimeout(() => {
    formRef.value?.validateField(['dcErpOrderNeList']);
  }, 30);
};
const addRow = () => {
  detailData.value.dcErpOrderNeList.push({
    ___tempId: Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6),
  });
};

const copyRow = () => {
  if (selectionRows.value?.length < 1) {
    proxy.$message.error('请先选中要复制的行');
    return;
  } else {
    selectionRows.value.forEach(row => {
      detailData.value.dcErpOrderNeList.push({
        ...row,
        id: undefined,
        ___tempId: Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6),
      });
    });
  }
};

const submit = (onlySelectRows = false, query = null) => {
  // if (!checkSelectedSupervisor() && detailData.value?.dcErpOrderStatus !== '1876789881673412609') {
  //   proxy.$message.error('请先指定审核主管');
  //   return;
  // }
  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      const formDataSend = {
        ...JSON.parse(JSON.stringify(detailData.value)),
        attachmentId: detailData.value?.attachmentId?.map(at => at.id)?.join(','),
      };
      formDataSend.dcErpOrderNeList = onlySelectRows
        ? JSON.parse(JSON.stringify(selectionRows.value))
        : formDataSend.dcErpOrderNeList;
      Api.pdp.dcErporder
        .nePass(formDataSend, query)
        .then(res => {
          const { code, msg } = res.data;
          if (code === 200) {
            markAsSaved();
            proxy.$message.success(msg);
            if (route.query.from === 'add') {
              router.go(-2);
            } else {
              router.go('-1');
            }
            // window.location.reload();
          } else {
            proxy.$message.error(msg);
          }
          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(errors => {
      console.error(errors);
      const firstKey = Object.keys(errors)?.[0];
      formRef.value.scrollToField(firstKey);
    });
};

const expand = ref({
  basic: true,
  dcErpOrderNeList: true,
});

const toggleExpand = (key, status) => {
  expand.value[key] = !!status;
};

const saveData = () => {
  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      const formDataSend = {
        ...JSON.parse(JSON.stringify(detailData.value)),
        attachmentId: detailData.value?.attachmentId?.map(at => at.id)?.join(','),
      };
      Api.pdp.dcErporder
        .saveItem(formDataSend)
        .then(res => {
          const { code, msg } = res.data;
          if (code === 200) {
            markAsSaved();
            proxy.$message.success(msg);
            // window.location.reload();
            // router.go('-1');
          } else {
            proxy.$message.error(msg);
          }
          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(errors => {
      console.error(errors);
      const firstKey = Object.keys(errors)?.[0];
      formRef.value.scrollToField(firstKey);
    });
};

const setAuditUser = () => {
  auditDialogVisible.value = false;
};

const addResize = () => {
  const box = proxy.$el;
  if (box) {
    proxy.$erd.listenTo(box, element => {
      boxWidth.value = element.scrollWidth;
    });
  }
};

const removeResize = () => {
  const box = proxy.$el;
  proxy.$erd.uninstall(box);
};

// 字典或缓存数据
const getDictData = async () => {
  const res = await proxy.useAsyncCache([
    { key: 'DC_BILL_TYPE' },
    { key: 'DC_PMS_PROJECT_ORDER' },
    { key: 'DC_ERP_ORDER_STATUS' },
    // { key: 'DC_WMS_IN_TYPE_SCM' },
    // { key: 'DC_WMS_IN_STATUS' },
  ]);
  dictMaps.value = res?.value;
  return true;
};

const allDisabled = computed(() => {
  return !['1876789752111362049', '1876789881673412609'].includes(
    detailData.value?.dcErpOrderStatus
  );
});

const getTableRule = columns => {
  return [
    {
      required: true,
      validator(_, value, callback) {
        if (value.length === 0) {
          callback(new Error('明细信息不能为空'));
        } else {
          let findCol = null;
          const findIndex = detailData.value.dcErpOrderNeList.findIndex(row => {
            findCol = columns.find(col => {
              if (col.prop === 'version' && !row.isMustVersion) {
                return false;
              }
              if (detailData.value.billType !== '服务订单' && col.prop === 'insidePmName') {
                return [null, undefined, ''].includes(row[col.prop]) ? true : false;
              }
              return col.required && [null, undefined, ''].includes(row[col.prop]);
            });
            return !!findCol;
          });
          if (findIndex > -1) {
            callback(new Error(`第${findIndex + 1}行${findCol.label}不能为空`));
          } else {
            callback();
          }
        }
      },
      trigger: 'change',
    },
  ];
};

const getOptions = async () => {
  const res = await Api.pdp.execution.optionTypeMap();
  const { code, data } = res.data;
  if (code === 200) {
    Object.keys(data || {}).forEach(key => (dictMaps.value[key] = data[key]));
  }
};

onBeforeMount(async () => {
  await getDictData();
  await getOptions();
  await getOrgList();
  const { id } = route.query;
  show(id);
});
onMounted(() => {
  bindEventCallback();
  addResize();
});
onBeforeUnmount(() => {
  unBindEventCallback();
  removeResize();
});
</script>
<style lang="scss" scoped>
.page-execution-edit {
  .group-toolbar {
    padding: 4px 0 10px;
  }
  .ceil-value {
    word-break: break-all;
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .form-item-attachmentId {
    width: 100% !important;
  }
  :deep(.el-table__row.new-row) {
    position: relative;
    td:first-child .cell::before {
      content: ' ';
      position: absolute;
      left: -6px;
      top: -6px;
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-left-color: rgb(21, 96, 243);
      transform: rotate(-135deg);
    }
  }
  .form-item-table {
    &.is-error {
      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper) {
        box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
      }

      .is-null {
        :deep(.el-input__wrapper),
        :deep(.el-select__wrapper) {
          box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }
        &.is-not-required {
          :deep(.el-input__wrapper),
          :deep(.el-select__wrapper) {
            box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
          }
        }
      }
    }
  }
  .step-new {
    display: block;
    width: 100%;
    margin: 0 auto;
    padding-left: 0;
    margin-bottom: 20px;
  }
  &.render-small {
    .form-basic-group {
      .form-item-operation-detail {
        width: 100%;
        margin-right: 0 !important;
      }
    }
  }
  &.render-middle {
    .form-basic-group {
      .form-item-operation-detail {
        width: 49%;
        &:nth-child(2n + 1) {
          margin-right: 2%;
        }
      }
    }
  }
  &.render-large {
    .form-basic-group {
      .form-item-operation-detail {
        width: 32%;
        &:nth-child(3n) {
          margin-right: 1%;
        }
        &:nth-child(3n + 1) {
          margin-right: 1%;
        }
        &:nth-child(3n + 2) {
          margin-right: 1%;
        }
      }
    }
  }

  :deep(.form-item-table) {
    flex: 1;
    position: relative;
    .el-form-item__content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: calc(100% - 20px);
      margin-left: 0 !important;
    }
    .el-input-number .el-input__inner {
      text-align: left;
    }
  }
}
:deep(.label-suffix) {
  color: #f56c6c;
}
.drawer-container {
  display: flex;
  flex-flow: column nowrap;
  min-height: calc(100vh - 200px);
  box-sizing: border-box;

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  .step-box {
    padding: 0 60px 20px;
    height: 48px;
    box-sizing: border-box;
  }

  .content-box {
    display: flex;
    flex-flow: column nowrap;
    min-height: calc(100vh - 200px);
  }

  .footer {
    padding-top: 8px;
    border-top: 1px solid #eaeaeb;
    padding-left: 20px;
    height: 34px;
  }

  .form-box {
    padding: 0 20px 0 0;
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
  }

  .group-box:last-child {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    min-height: 300px;
  }
  .group-box {
    &.hide-expand {
      height: 40px;
      overflow: hidden !important;
    }
    &.full-screen {
      padding: 10px 24px 24px;
      background-color: #fff;
      position: fixed;
      z-index: 100;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
  .form-main {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
  }

  .group-header {
    font-weight: bold;
    box-sizing: border-box;
    padding-left: 4px;
    border-left: 3px solid #f78431;
    line-height: 16px;
    font-size: 16px;
    margin: 10px 0;
  }

  .form-item-operation-detail {
    width: 49%;
    display: inline-flex;
    margin-bottom: 16px;
    &:nth-child(2n + 1) {
      margin-right: 2%;
    }

    .detail-column-value {
      width: 100%;
      display: block;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
      line-height: 20px;
      padding-top: 6px;
    }
  }
}
</style>
