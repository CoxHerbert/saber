<template>
  <!-- 新增、修改交付启动会 -->
  <basic-container class="business-container page-delivery-start-add-or-edit" v-loading="loading">
    <div class="wrap">
      <h4 class="title-box">
        <span class="title-text"> {{ title }} </span>
        <div class="right-btn-box">
          <el-button v-if="!pageDisabled" type="primary" @click="doAction('submit')" icon="position"
            >提交</el-button
          >
          <el-button v-else-if="pageDisabled" type="primary" @click="doAction('edit')" icon="Edit"
            >编辑</el-button
          >
          <el-button @click="doAction('cancel')" icon="circleClose">取消</el-button>
        </div>
      </h4>

      <div class="form-content">
        <el-form
          ref="formMainRef"
          :model="form"
          inline
          :disabled="pageDisabled"
          label-width="100px"
          label-suffix=":"
          :rules="formRules"
        >
          <template v-for="(group, groupIndex) in formConfig">
            <div
              v-if="!group.showFunc || (group.showFunc && group.showFunc())"
              class="group"
              :key="groupIndex"
            >
              <div class="group-title">{{ group.label }}</div>
              <template v-if="group.type === 'formItemGroup'">
                <template v-for="(item, i) in group.children">
                  <template v-if="item.type === 'dc-member'" class="dc-member">
                    <dc-member
                      :key="item.type + i"
                      :mode="form.id ? 'edit' : 'add'"
                      formItemClass="w30"
                      :modelFieldListProp="'dcPdpFuncFieldList'"
                      :templateProp="'funcFieldTemplateId'"
                      :show="false"
                      v-model:modelTemplate="form.funcFieldTemplateId"
                      v-model:modelFieldList="form.dcPdpFuncFieldList"
                      @change="
                        val => {
                          hanldeMemberChange(val, 'main');
                        }
                      "
                    />
                  </template>
                  <el-form-item
                    v-else-if="!item.showFunc || item.showFunc(form)"
                    :label="item.label"
                    :prop="item.prop"
                    :class="item.class"
                    :key="item.prop + i"
                  >
                    <el-select
                      v-if="item.type === 'el-select'"
                      v-bind="item.props"
                      :key="item.type + i"
                      v-model="form[item.prop]"
                      @change="
                        (...args) => {
                          handleFormItemChange(item, ...args);
                        }
                      "
                    >
                      <template v-if="dictCache[item.dictKey]">
                        <el-option
                          v-for="(op, m) in dictCache[item.dictKey]"
                          :label="item.labelKey ? op[item.labelKey] : op.dictValue"
                          :value="item.valueKey ? op[item.valueKey] : op.dictKey"
                          :key="m"
                        ></el-option>
                      </template>
                    </el-select>
                    <span v-else-if="item.type === 'text'">{{
                      [null, undefined, ''].includes(form[item.prop]) ? '-' : form[item.prop]
                    }}</span>
                    <dc-dict
                      v-else-if="item.type === 'dc-dict'"
                      v-bind="item.props"
                      :key="i"
                      :value="form[item.prop]"
                    >
                    </dc-dict>
                    <component
                      v-else
                      v-bind="item.props"
                      :is="item.type"
                      v-model="form[item.prop]"
                      @change="
                        (...args) => {
                          handleFormItemChange(item, ...args);
                        }
                      "
                      :key="item.type + i"
                    >
                    </component>
                  </el-form-item>
                </template>
              </template>
              <template v-else-if="group.type === 'tableGroup'">
                <template v-for="(item, i) in group.children">
                  <!-- 操作 -->
                  <div v-if="item.type === 'actions'" class="actions" :key="i">
                    <template v-for="(btn, k) in item.children">
                      <template v-if="!btn.showFunc || (btn.showFunc && btn.showFunc())">
                        <dc-select-dialog-v2
                          v-if="btn.type === 'dc-select-btn'"
                          v-bind="btn.selectProps.props"
                          @change="selectListChange"
                          :params="{
                            supplierId: form.supplierId,
                            sourceType: form.inType,
                          }"
                          :key="btn.type + k"
                        >
                          <template #default>
                            <el-button v-bind="btn.props" :disabled="btn.disabled()">
                              {{ btn.label }}
                            </el-button>
                          </template>
                        </dc-select-dialog-v2>
                        <el-button
                          v-else
                          v-bind="btn.props"
                          :disabled="btn.disabled()"
                          @click="doAction(btn.action, btn)"
                          >{{ btn.label }}</el-button
                        >
                      </template>
                    </template>
                  </div>
                  <!-- 表格数据 -->
                  <template v-else-if="item.type === 'table'">
                    <el-form-item style="width: 100%" :label-width="0" :prop="item.prop">
                      <el-table
                        v-bind="item.props"
                        ref="detailTable"
                        :data="form[item.prop]"
                        @selection-change="handleSelectionChange"
                      >
                        <template v-for="(col, x) in item.children" :key="x">
                          <el-table-column
                            v-if="col.type === 'rowText'"
                            :type="col.type === 'rowText' ? '' : col.type"
                            :label="col.label"
                            :prop="col.prop"
                            :min-width="col.width"
                          >
                            <template v-if="col.type === 'rowText'" #default="scoped">
                              <el-form-item label-width="0" :rule="null" style="margin-right: 0">
                                <el-select
                                  v-if="col.formType === 'el-select'"
                                  v-bind="col.props"
                                  :remote-method="
                                    query => {
                                      handleRemoteQuery(query, col, scoped.$index);
                                    }
                                  "
                                  @change="
                                    val => {
                                      handleDrawerFormItemChange(col, val, scoped.$index);
                                    }
                                  "
                                  v-model="form.detailList[scoped.$index][col.prop]"
                                >
                                  <template v-if="form.detailList[scoped.$index][col.options]">
                                    <el-option
                                      v-for="(op, m) in form.detailList[scoped.$index][col.options]"
                                      :key="m"
                                      :label="col.labelKey ? op[col.labelKey] : op.dictValue"
                                      :value="col.valueKey ? op[col.valueKey] : op.dictKey"
                                    >
                                    </el-option>
                                  </template>
                                </el-select>
                                <component
                                  v-else
                                  v-bind="col.props"
                                  :disabled="col.props?.disabled"
                                  :placeholder="col.props?.placeholder"
                                  :params="col.props?.params || undefined"
                                  :max="
                                    col.prop === 'productQty' && scoped.row.max
                                      ? scoped.row.max
                                      : undefined
                                  "
                                  v-model="form.detailList[scoped.$index][col.prop]"
                                  :is="col.formType"
                                  @change="
                                    val => {
                                      handleDrawerFormItemChange(col, val, scoped.$index);
                                    }
                                  "
                                ></component>
                              </el-form-item>
                            </template>
                          </el-table-column>
                          <el-table-column
                            v-else-if="col.type === 'text'"
                            :type="col.type === 'text' ? '' : col.type"
                            :label="col.label"
                            :prop="col.prop"
                            :min-width="col.width"
                            show-overflow-tooltip
                          >
                            <template v-if="col.type === 'text'" #default="scoped">
                              <template v-if="!!col?.transVal">
                                {{ col?.transVal(scoped) }}
                              </template>
                              <template v-else>
                                {{
                                  [undefined, null, '', ' '].includes(scoped.row[col.prop])
                                    ? '-'
                                    : scoped.row[col.prop]
                                }}
                              </template>
                            </template>
                          </el-table-column>
                          <el-table-column
                            v-else-if="col.type === 'dc-view'"
                            :type="col.type === 'dc-view' ? '' : col.type"
                            :label="col.label"
                            :prop="col.prop"
                            :min-width="col.width"
                            show-overflow-tooltip
                          >
                            <template v-if="col.type === 'dc-view'" #default="scoped">
                              <dc-view
                                v-model="scoped.row[col.prop]"
                                :objectName="col.props.objectName"
                                :showKey="col.props.showKey"
                              />
                            </template>
                          </el-table-column>
                          <template v-else-if="col.type === 'dc-member'">
                            <template v-for="(c, j) in getDynamicsColumns" :key="j">
                              <template v-if="c.remark">
                                <el-table-column
                                  :label="`${c.label}组`"
                                  show-overflow-tooltip
                                  min-width="120px"
                                >
                                  <template #default="scoped">
                                    <dc-view
                                      :modelValue="
                                        scoped.row.dcPdpFuncFieldList.find(
                                          f => f.filedKey === c.prop
                                        )?.remark
                                      "
                                      objectName="workGroup"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column
                                  :label="c.label || c.prop"
                                  show-overflow-tooltip
                                  min-width="120px"
                                >
                                  <template #default="scoped">
                                    <dc-view
                                      :modelValue="
                                        scoped.row.dcPdpFuncFieldList.find(
                                          f => f.filedKey === c.prop
                                        )?.bindUserIds
                                      "
                                      objectName="user"
                                      showKey="realName"
                                    />
                                  </template>
                                </el-table-column>
                              </template>
                              <template v-else>
                                <el-table-column
                                  :label="c.label || c.prop"
                                  show-overflow-tooltip
                                  min-width="120px"
                                >
                                  <template #default="scoped">
                                    <dc-view
                                      :modelValue="
                                        scoped.row.dcPdpFuncFieldList.find(
                                          f => f.filedKey === c.prop
                                        )?.bindUserIds
                                      "
                                      objectName="user"
                                      showKey="realName"
                                    />
                                  </template>
                                </el-table-column>
                              </template>
                            </template>
                          </template>
                          <el-table-column
                            v-else-if="col.type === 'actions' && col.showFunc()"
                            :key="'option' + i"
                            :fixed="col.fixed"
                            :label="col.label"
                            :min-width="col.width ? col.width : 120"
                            :align="col.align ? col.align : 'center'"
                          >
                            <template #default="scoped">
                              <el-button
                                v-for="(btn, j) in col.children"
                                :key="j"
                                link
                                type="primary"
                                v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))"
                                @click="doAction(btn.action, scoped)"
                                >{{ btn.label }}</el-button
                              >
                            </template>
                          </el-table-column>
                        </template>
                      </el-table>
                    </el-form-item>
                  </template>
                </template>
              </template>
            </div>
          </template>
        </el-form>
      </div>
    </div>
    <el-drawer
      v-model="drawerDatas.open"
      size="800px"
      :title="drawerDatas.title"
      @close="doAction('closeDrawer')"
    >
      <el-form
        ref="submitFormRef"
        :model="drawerDatas.form"
        label-suffix=":"
        v-if="drawerDatas.open"
        :rules="formRules"
        label-width="auto"
      >
        <el-form-item label="专案号" prop="mtoNo">
          <wf-select-single
            v-model="drawerDatas.form.mtoNo"
            objectName="CompleteMtoNo"
            @change="
              val => {
                handleDrawerFormItemChange2(val);
              }
            "
          />
        </el-form-item>
        <template v-for="(col, i) in tableColumns" :key="col.type + i">
          <el-form-item
            v-if="
              !['selection', 'selection', 'dc-member', 'actions'].includes(col.type) &&
              col.prop !== 'mtoNo'
            "
            :label="col.label"
            :prop="col.prop"
          >
            <el-select
              v-if="col.formType === 'el-select'"
              v-bind="col.props"
              :disabled="col.props?.disabled"
              :placeholder="col.props?.placeholder"
              v-model="drawerDatas.form[col.prop]"
            >
              <template v-if="dictCache[col.dictKey]">
                <el-option
                  v-for="(op, m) in dictCache[col.dictKey]"
                  :label="col.labelKey ? op[col.labelKey] : op.dictValue"
                  :value="col.valueKey ? op[col.valueKey] : op.dictKey"
                  :key="m"
                ></el-option>
              </template>
            </el-select>
            <component
              v-else
              v-bind="col.props"
              :disabled="col.props?.disabled"
              :placeholder="col.props?.placeholder"
              :show="false"
              :params="col.props?.params || undefined"
              v-model="drawerDatas.form[col.prop]"
              :is="col.formType"
              @change="
                val => {
                  handleDrawerFormItemChange(col, val);
                }
              "
            ></component>
          </el-form-item>

          <dc-member
            v-else-if="col.type === 'dc-member'"
            :mode="drawerDatas.mode"
            formItemClass="w100"
            :modelFieldListProp="'dcPdpFuncFieldList'"
            :templateProp="'funcFieldTemplateId'"
            :show="false"
            v-model:modelTemplate="drawerDatas.form.funcFieldTemplateId"
            v-model:modelFieldList="drawerDatas.form.dcPdpFuncFieldList"
            @change="
              val => {
                hanldeMemberChange(val, 'drawer');
              }
            "
          ></dc-member>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="doAction('drawerSubmit')">确定</el-button>
          <el-button @click="doAction('closeDrawer')">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>
<script>
import Api from '@/api/index';
import Const from '@/const';
import { getDetailByParams } from '@/api/system/param';

export default {
  data() {
    return {
      loading: false,
      disabled: false,
      titleMaps: {
        add: '新增交付启动会',
        edit: '编辑交付启动会',
        look: '交付启动会详情',
      },
      detailList: {
        selectData: [],
        selectRows: [],
      },
      drawerDatas: {
        open: false,
        title: '',
        form: {},
        mode: '',
        options: [],
      },
      detailTable: null,
      form: {
        detailList: [],
      },
      dictCache: {},
      timer: null,
    };
  },
  computed: {
    routeQueryParams() {
      return this.$route.query;
    },
    title: {
      get() {
        return this.titleMaps[this.routeQueryParams?.type];
      },
      set(value) {
        this.titleMaps[this.routeQueryParams.type] = value;
      },
    },
    formRules() {
      const result = {};
      this.tableColumns.forEach(item => {
        if (item.required) {
          result[item.prop] = [
            {
              required: true,
              trigger: ['blur', 'change'],
              validator(_, value, callback) {
                if ([null, '', undefined].includes(value)) {
                  callback(new Error(item.props.placeholder));
                } else {
                  callback();
                }
              },
            },
          ];
        }
      });
      this.formConfig[0].children.forEach(item => {
        if (item.required) {
          result[item.prop] = [
            {
              required: true,
              trigger: ['blur', 'change'],
              validator(_, value, callback) {
                if ([null, '', undefined].includes(value)) {
                  callback(new Error(item.props.placeholder));
                } else {
                  callback();
                }
              },
            },
          ];
        }
      });

      return result;
    },
    getDynamicsColumns() {
      const mapSet = {};
      this.form.detailList?.forEach(col => {
        col.dcPdpFuncFieldList?.forEach(r => {
          if (!Array.isArray(this.dictCache.DC_PMS_PROJECT_ROLE)) return;
          const find = this.dictCache.DC_PMS_PROJECT_ROLE?.find(dict => {
            return dict.dictKey === r.filedKey;
          });
          try {
            if (!!find?.remark) {
              console.log(find.remark);
              find['remark'] = JSON.parse(find.remark);
            }
          } catch (error) {
            console.log(error);
          }
          mapSet[r.filedKey] = {
            label: find?.dictValue,
            prop: r.filedKey,
            remark: find?.remark,
          };
        });
      });
      return Object.values(mapSet);
    },
    tableColumns() {
      return [
        {
          type: 'selection',
          width: 55,
        },
        {
          prop: 'mtoNo',
          label: '专案号',
          type: 'text',
          width: 140,
          formType: 'el-input',
          required: true,
          props: {
            clearable: true,
            placeholder: '请选择专案',
          },
        },
        {
          prop: 'name',
          label: '成品名称',
          type: 'text',
          width: 140,
          formType: 'el-input',
          required: true,
          props: {
            clearable: true,
            placeholder: '<选择专案后系统自动带入>',
            disabled: true,
          },
        },
        {
          prop: 'number',
          label: '成品码',
          type: 'text',
          width: 140,
          formType: 'el-input',
          required: true,

          props: {
            clearable: true,
            placeholder: '<选择专案后系统自动带入>',
            disabled: true,
          },
        },
        {
          type: 'dc-member',
          props: {
            show: false,
            listProp: 'dcPdpFuncFieldList',
            tempProp: 'funcFieldTemplateId',
          },
        },
        {
          prop: 'productionLocation',
          label: '生产位置',
          type: 'text',
          width: 120,
          type: 'el-select',
          formType: 'el-select',
          dictKey: 'PRODUCE_LOCATION',
          labelKey: 'dictValue',
          valueKey: 'dictKey',
          required: true,
          props: {
            placeholder: '请选择生产位置',
            clearable: false,
          },
        },
        {
          prop: 'completeSetDate',
          label: '齐套日',
          type: 'text',
          width: 120,
          formType: 'el-date-picker',
          required: true,
          props: {
            type: 'date',
            placeholder: '请选择齐套日',
            format: 'YYYY-MM-DD',
            'value-format': 'YYYY-MM-DD',
            clearable: false,
          },
        },
        {
          prop: 'etd',
          label: '客户ETD',
          type: 'text',
          width: 120,
          formType: 'el-date-picker',
          required: true,

          props: {
            type: 'date',
            placeholder: '请选择客户ETD时间',
            format: 'YYYY-MM-DD',
            'value-format': 'YYYY-MM-DD',
            clearable: false,
          },
        },
        {
          prop: 'lastest ETD',
          label: 'lastEtd',
          type: 'text',
          width: 120,
          formType: 'el-date-picker',
          required: true,
          props: {
            type: 'date',
            placeholder: '请选择lastest ETD时间',
            format: 'YYYY-MM-DD',
            'value-format': 'YYYY-MM-DD',
            clearable: false,
          },
        },
        {
          label: '是否报关',
          prop: 'isClearance',
          type: 'text',
          formType: 'el-switch',
          width: 120,
          required: true,
          props: {
            placeholder: '请选择是否报关',
          },
          transVal(scope) {
            return scope.row.isClearance ? '是' : '否';
          },
        },
        {
          label: '关键SOP',
          prop: 'keySop',
          type: 'text',
          width: 120,
          formType: 'el-switch',
          required: true,
          transVal(scope) {
            return scope.row.isClearance ? '是' : '否';
          },
          props: {
            placeholder: '请选择关键SOP',
          },
        },
        {
          label: '电气原理图',
          prop: 'needEsd',
          type: 'text',
          width: 120,
          formType: 'el-switch',
          required: true,
          transVal(scope) {
            return scope.row.isClearance ? '是' : '否';
          },
          props: {
            placeholder: '请选择电气原理图',
          },
        },
        {
          label: '无尘包线',
          prop: 'needCrw',
          type: 'text',
          width: 120,
          formType: 'el-switch',
          required: true,
          transVal(scope) {
            return scope.row.isClearance ? '是' : '否';
          },
          props: {
            placeholder: '请选择无尘包线',
          },
        },
        {
          label: '防静电气管',
          prop: 'needEsdPipe',
          type: 'text',
          width: 120,
          formType: 'el-switch',
          required: true,
          transVal(scope) {
            return scope.row.isClearance ? '是' : '否';
          },
          props: {
            placeholder: '请选择防静电气管',
          },
        },
        {
          label: '其他特殊要求',
          prop: 'otherSpecialRequire',
          type: 'text',
          formType: 'el-input',
          width: 120,
          props: {
            style: {
              width: '100%',
            },
            type: 'textarea',
            rows: 4,
            placeholder: '请输入其他特殊要求',
          },
        },
        {
          prop: 'options',
          width: 120,
          label: '操作',
          slot: '',
          type: 'actions',
          fixed: 'right',
          showFunc() {
            return this.routeQueryParams?.type !== 'look';
          },
          children: [
            {
              type: 'button',
              label: '编辑',
              action: 'editrow',
              showFunc() {
                return this.routeQueryParams?.type !== 'look';
              },
            },
            {
              type: 'button',
              label: '删除',
              action: 'delrow',
              showFunc() {
                return this.routeQueryParams?.type !== 'look';
              },
            },
          ],
        },
      ];
    },
    formConfig() {
      const that = this;
      return [
        {
          label: '基础信息',
          type: 'formItemGroup',
          children: [
            {
              label: '项目编号',
              prop: 'projectCode',
              class: 'w30',
              type: 'el-input',
              required: true,
              props: {
                placeholder: '请输入项目编号',
                disabled: true,
              },
            },
            {
              label: '项目名称',
              prop: 'projectName',
              class: 'w30',
              type: 'el-input',
              required: true,
              props: {
                placeholder: '请输入项目名称',
                disabled: true,
              },
            },
            {
              label: '行业类别',
              prop: 'industryDictId',
              class: 'w30',
              type: 'el-select',
              dictKey: 'DC_CRM_SECTOR',
              valueKey: 'id',
              props: {
                disabled: true,
                placeholder: '请选择行业类别',
              },
            },
            {
              label: '设备种类',
              prop: 'quipmentDictId',
              class: 'w30',
              type: 'el-select',
              dictKey: 'DC_PMS_PROJECT_QIOPMENT',
              valueKey: 'id',
              required: true,
              props: {
                multiple: true,
                placeholder: '请选择特种设备',
              },
            },
            {
              label: '项目类型',
              prop: 'projectDictId',
              class: 'w30',
              type: 'el-select',
              dictKey: 'DC_PMS_PROJECT_TYPE',
              valueKey: 'id',
              props: {
                disabled: true,
                placeholder: '请选择特种设备',
              },
            },
            {
              label: '',
              type: 'dc-member',
              props: {},
            },
            {
              label: '备注说明',
              prop: 'remark',
              class: 'w100',
              type: 'el-input',
              props: {
                autosize: { minRows: 2 },
                type: 'textarea',
                placeholder: '请输入备注说明',
              },
            },
            {
              label: '上传附件',
              prop: 'fileIds',
              class: 'w100',
              type: 'dc-upload',
              props: {
                targetType: Const.targetType.CUSTOMER,
              },
            },
          ],
        },
        {
          label: '专案信息',
          type: 'tableGroup',
          children: [
            {
              type: 'actions',
              children: [
                {
                  showFunc() {
                    const { type } = that.routeQueryParams;
                    return ['add', 'edit'].includes(type);
                  },
                  label: '新增',
                  action: 'addrow',
                  disabled() {
                    return false;
                  },
                  props: {
                    plain: true,
                    type: 'primary',
                  },
                },
              ],
            },
            {
              type: 'table',
              props: {
                border: true,
              },
              prop: 'detailList',
              children: [...this.tableColumns],
            },
          ],
        },
      ];
    },
    pageDisabled() {
      return !['add', 'edit'].includes(this.routeQueryParams?.type);
    },
  },
  created() {
    this.dictCache = this.useCache([
      { key: 'DC_CRM_SECTOR' },
      { key: 'DC_PMS_PROJECT_ROLE' },
      { key: 'DC_PMS_PROJECT_QIOPMENT' },
      { key: 'DC_PMS_PROJECT_TYPE' },
      { key: 'PRODUCE_LOCATION' },
    ]);
  },
  mounted() {
    this.initPage();
  },
  methods: {
    handleSelectionChange(selectData, ...args) {
      const selected = detailTable[0].getSelectionRows() || [];
      const indexes = selected.map(row => this.form.detailList.indexOf(row));
      this.detailList.selectData = selected;
      this.detailList.selectRows = indexes;
    },
    submitData() {
      this.$refs.formMainRef.validate(valid => {
        if (valid) {
          this.submitMainData()
            .then(() => {
              this.$router.go('-1');
            })
            .catch(err => {});
        }
      });
    },
    submitMainData() {
      return new Promise((resolve, reject) => {
        this.loading = true;
        let formData = {
          ...this.form,
          detailList: undefined,
          funcFieldTemplateId: this.form.funcFieldTemplateId?.id,
        };
        formData.fileIds = this.arrayToIdsString({
          array: formData.fileIds,
        });
        formData.quipmentDictId = this.form.quipmentDictId.join(',');
        formData.dcPmsDeliveredItems = this.form.detailList.map(item => {
          return {
            ...item,
            funcFieldTemplateId: item.funcFieldTemplateId?.id || item.funcFieldTemplateId,
            projectId: this.form.projectId,
          };
        });
        Api.pdp.deliverystart
          .submit(formData)
          .then(res => {
            this.loading = false;
            if (res.data.code === 200) {
              this.form.id = res.data.data.id;
              this.$message.success(res.data.msg);
              resolve(res.data.data);
            }
          })
          .catch(() => {
            this.loading = true;
            reject();
          });
      });
    },
    cancel() {
      this.$router.go(-1);
    },
    /** 打开抽屉 **/
    openDrawer(action, scope) {
      switch (action) {
        case 'addrow':
          this.drawerDatas.title = '新增专案明细';
          this.drawerDatas.open = true;
          this.drawerDatas.mode = 'add';
          this.drawerDatas.form = {
            deliveredId: this.routeQueryParams?.id,
            projectId: this.form.projectId,
            isClearance: false,
            keySop: false,
            needEsd: false,
            needCrw: false,
            needEsdPipe: false,
          };

          this.initDetailColumn();
          return;
        case 'editrow':
          const { row, $index } = scope;
          this.drawerDatas.mode = 'edit';
          this.drawerDatas.$index = $index;
          this.drawerDatas.title = '编辑专案明细';
          this.drawerDatas.open = true;
          this.drawerDatas.form = {
            ...row,
          };
          return;
      }
    },
    /** 关闭抽屉 **/
    closeDrawer() {
      this.drawerDatas.title = '';
      this.drawerDatas.open = false;
      this.drawerDatas.form = {};
    },
    /** 抽屉提交 **/
    drawerSubmit() {
      this.$refs.submitFormRef.validate(async valid => {
        if (valid) {
          if (this.drawerDatas.mode === 'add') {
            this.form.detailList.push(
              JSON.parse(
                JSON.stringify({
                  ...this.drawerDatas.form,
                  funcFieldTemplateId: this.drawerDatas.form?.funcFieldTemplateId?.id
                    ? this.drawerDatas.form?.funcFieldTemplateId?.id
                    : this.drawerDatas.form?.funcFieldTemplateId,
                })
              )
            );
            this.submitMainData()
              .then(async data => {
                this.closeDrawer();

                this.$router
                  .push({
                    path: '/pdp/deliverystart/addorEdite',
                    query: {
                      id: data.id,
                      type: 'edit',
                    },
                  })
                  .then(async () => {
                    await this.initPage();
                  })
                  .catch(err => {
                    console.error('导航失败:', err);
                  });
              })
              .catch(err => {});
            return;
          } else {
            this.form.detailList[this.drawerDatas.$index] = JSON.parse(
              JSON.stringify(this.drawerDatas.form)
            );
          }
          Api.pdp.deliverystartsubmit
            .submit({
              ...this.drawerDatas.form,
              projectId: this.form.projectId,
              funcFieldTemplateId: this.drawerDatas.form?.funcFieldTemplateId?.id
                ? this.drawerDatas.form?.funcFieldTemplateId?.id
                : this.drawerDatas.form?.funcFieldTemplateId,
            })
            .then(res => {
              const { code, msg } = res.data;
              if (code === 200) {
                this.getProjectList();
                this.$message.success(msg);
                this.closeDrawer();
              }
            })
            .catch(error => {
              this.$message.error(error);
            });
        }
      });
    },
    /** 执行相关操作 */
    doAction(action, scope) {
      switch (action) {
        case 'addrow':
          this.openDrawer(action);
          break;
        case 'editrow':
          this.openDrawer(action, scope);
          break;
        case 'delrow':
          const { row } = scope;
          const ids = row.id;
          this.$confirm(`确定将“[${ids}]”数据删除?`, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => Api.pdp.deliverystartsubmit.remove({ ids }))
            .then(() => {
              this.$message({
                type: 'success',
                message: '操作成功!',
              });
              this.getProjectList();
            })
            .catch(err => {
              this.$message({
                type: 'error',
                message: err,
              });
            });
          break;
        case 'closeDrawer':
          this.closeDrawer();
          break;
        case 'drawerSubmit':
          this.drawerSubmit();
          break;
        case 'submit':
          this.submitData();
          break;
        case 'cancel':
          this.cancel();
          break;
        case 'edit':
          this.$router
            .push({
              path: '/pdp/deliverystart/addorEdite',
              query: {
                id: this.routeQueryParams?.id,
                type: action,
              },
            })
            .then(async () => {
              await this.initPage();
            })
            .catch(err => {
              console.error('导航失败:', err);
            });
          break;
        default:
          console.log('action not done', action);
      }
    },
    hanldeMemberChange(val, key) {
      if (key == 'main' && !this.form.id) {
        if (val.dcPdpFuncFieldList?.length > 0) {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.$confirm(`是否同步项目中的人员数据?`, {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
              .then(() => {
                const query = this.$route.query;
                console.log(this.form.dcPdpFuncFieldList);
                this.form.dcPdpFuncFieldList.forEach((f, i) => {
                  if (query[f.filedKey]) {
                    this.form.dcPdpFuncFieldList[i].bindUserIds = query[f.filedKey];
                  }
                });
                return true;
              })
              .then(() => {
                this.$message({
                  type: 'success',
                  message: '操作成功!',
                });
              })
              .catch(err => {
                console.log(err);
              });
          }, 500);
        }
      } else if (key === 'drawer' && this.drawerDatas.mode === 'add') {
        setTimeout(() => {
          if (!Array.isArray(this.drawerDatas.form.dcPdpFuncFieldList)) return;
          this.drawerDatas.form.dcPdpFuncFieldList.forEach((f, i) => {
            const uid = this.form.dcPdpFuncFieldList.find(
              row => row.filedKey === f.filedKey
            )?.bindUserIds;
            if (uid) {
              this.drawerDatas.form.dcPdpFuncFieldList[i].bindUserIds = uid;
            }
          });
        }, 500);
      }
    },
    /**
     * 基本信息变更回调
     * @param item
     * @param args
     */
    handleFormItemChange(item, ...args) {},
    /**
     * 物料信息变更
     * @param item
     * @param value
     */
    handleDrawerFormItemChange(item, value, $index) {
      console.log('item', item, 'value', value, this.form.detailList);
    },
    /**
     * 处理远程查询
     * @param item
     * @param value
     */
    async handleRemoteQuery(query, col, $index) {
      try {
        if (query || query === 'init') {
          const res = await Api.wms.common.list({
            productName: query !== 'init' ? query : undefined,
            warehouseId: this.form.warehouseId,
            size: 1000,
            current: 1,
          });
          const { code, data: resData } = res.data;
          if (code === 200) {
            this.form.detailList[$index][col.options] = resData.records;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    },

    handleDrawerFormItemChange2(item) {
      this.drawerDatas.form.mtoNo = item?.billNo || null;
      this.drawerDatas.form.number = item?.number || null;
      this.drawerDatas.form.name = item?.name || null;
    },
    async initColumn() {
      const res = await getDetailByParams({
        paramKey: 'BASE_DELIVERED',
      });
      const { code } = res.data;
      if (code === 200) {
        this.form.funcFieldTemplateId = res.data.data.paramValue;
      }
    },
    async initDetailColumn() {
      const res = await getDetailByParams({
        paramKey: 'DC_PMS_DELIVERED_TEMPLATE_ID',
      });
      const { code } = res.data;
      if (code === 200) {
        this.drawerDatas.form.funcFieldTemplateId = res.data.data.paramValue;
      }
    },
    /** 自动填入 */
    async getDetail() {
      if (this.routeQueryParams?.projectId) {
        const fields = [
          'quipmentDictId',
          'projectId',
          'projectCode',
          'projectName',
          'projectDictId',
          'industryDictId',
          'opportunitiyId',
        ];

        fields.forEach(f => {
          this.form[f] =
            f === 'quipmentDictId' && this.$route.query[f]
              ? this.$route.query[f].split(',')
              : this.$route.query[f];
        });
        this.initColumn();
        this.loading = false;
        return;
      }
      const res = await Api.pdp.deliverystart.detail({ id: this.routeQueryParams?.id });
      const { code, data: resData } = res.data;
      if (code === 200) {
        // await getProjectDetail(resData.projectId);
        this.form = {
          ...resData,
          dcPmsProject: undefined,
          projectCode: resData.dcPmsProject.projectCode,
          projectName: resData.dcPmsProject.projectName,
          quipmentDictId: resData.quipmentDictId?.split(',') || [],
          dcPmsDeliveredItems: undefined,
          detailList: resData.dcPmsDeliveredItems,
          dcPmsProjectPhaseList: resData.dcPmsProjectPhaseList,
        };
      }
    },

    /** 获取专案明细 **/
    async getProjectList() {
      if (!this.routeQueryParams?.id) {
        this.form.detailList = [];
        return;
      }
      const params = {
        current: 1,
        size: 10000,
        deliveredId: this.routeQueryParams?.id,
      };
      const res = await Api.pdp.deliverystartsubmit.list(params);
      const { code, data } = res.data;
      if (code == 200) {
        this.form = {
          ...this.form,
          detailList: data.records,
        };
      }
    },
    async initPage() {
      this.loading = true;
      if (['add'].includes(this.routeQueryParams?.type)) {
        await this.getDetail();
        // await this.getProjectList();
      } else if (['edit', 'look'].includes(this.routeQueryParams?.type)) {
        await this.getDetail();
        // await this.getProjectList();
      }
      this.loading = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.page-delivery-start-add-or-edit {
  .title-box {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    font-weight: bold;
    font-size: 18px;
    color: #333333;
    line-height: 48px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    height: 60px;
    border-bottom: 2px solid #dadbe0;
  }

  .self-icon {
    display: inline-block;
    margin-right: 4px;
    transform: translateY(-1px);
  }

  :deep(.el-input) {
    display: block;
    width: 100%;
    .el-input__wrapper {
      width: 100%;
    }
  }

  :deep(.el-table__empty-text) {
    width: 100%;
    text-align: center;
    line-height: 200px;
    height: 200px;
    border-bottom: 1px solid rgb(229, 231, 235);
  }

  .group-title {
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    padding-left: 9px;
    position: relative;
    padding-top: 10px;
    padding-bottom: 10px;

    &::before {
      display: inline-block;
      content: ' ';
      width: 4px;
      height: 13px;
      background: #f78431;
      margin-right: 8px;
    }
  }

  .actions {
    padding-bottom: 12px;
  }
  .w100 {
    width: 98%;
  }
  :deep(.w30),
  .w30 {
    width: 31%;
    margin-right: 2%;
  }
  .w24 {
    width: 20%;
    margin-right: 2%;
  }
  @media (max-width: 1919px) {
    :deep(.w30),
    .w30 {
      width: 30%;
      margin-right: 3%;
    }
  }
}
</style>
