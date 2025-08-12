<template>
  <div class="wrap" v-loading="loading">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-suffix=":"
      label-width="120px"
      status-icon
      :inline="true"
    >
      <div class="wrap-left">
        <div class="wrap-left-form">
          <div class="form-group-title">基本信息</div>
          <div class="form-item-info">
            <el-form-item
              class="form-itme-width_50"
              label="需求名称"
              id="rlistName"
              prop="rlistName"
            >
              <el-input
                v-model="formData.rlistName"
                placeholder="请输入需求名称"
                :disabled="isShow"
                clearable
              />
            </el-form-item>
            <el-form-item class="form-itme-width_50" label="BD" id="bdId" prop="bdId">
              <dc-select-user
                v-model="formData.bdId"
                placeholder="请选择BD"
                :multiple="false"
                :multiple-limit="1"
              />
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="关联客户"
              id="customerId"
              prop="customerId"
            >
              <dc-select-dialog
                v-model="formData.customerId"
                placeholder="请选择关联客户"
                objectName="customer"
                type="input"
                :multiple="false"
                :multiple-limit="1"
                :clearable="true"
                :disabled="isShow"
              />
            </el-form-item>
            <el-form-item class="form-itme-width_50" label="关联商机" id="oppsId" prop="oppsId">
              <dc-select-dialog
                v-model="formData.oppsId"
                placeholder="请选择关联商机"
                objectName="opps"
                type="input"
                :params="{ customerId: formData.customerId }"
                :multiple="false"
                :multiple-limit="1"
                :clearable="true"
                :disabled="isShow"
              />
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="需求编号"
              id="rlistCode"
              prop="rlistCode"
            >
              <el-input v-model="formData.rlistCode" placeholder="系统自动生成" :disabled="true" />
            </el-form-item>
            <el-form-item
              class="form-itme-width_100"
              label="备注"
              id="followContent"
              prop="followContent"
            >
              <el-input
                v-model="formData.followContent"
                placeholder="请输入备注"
                :disabled="isShow"
                clearable
              />
            </el-form-item>

            <el-form-item
              class="form-itme-width_100"
              label="相关附件"
              id="attachments"
              prop="attachments"
            >
              <dc-upload
                v-model="formData.attachments"
                :limit="10"
                :targetType="Const.targetType.CUSTOMER"
              />
            </el-form-item>

            <div class="form-group-title">工艺&产品</div>
            <el-form-item
              class="form-itme-width_50"
              label="设备种类"
              id="deviceTypeKey"
              prop="deviceTypeKey"
            >
              <el-select
                v-model="formData.deviceTypeKey"
                clearable
                placeholder="请选择设备种类"
                :disabled="isShow"
              >
                <el-option
                  v-for="item in DC_CRM_DEVICE_TYPE"
                  :key="item.dictKey"
                  :label="item.label"
                  :value="item.dictKey"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="设备类型"
              id="deviceKey"
              prop="deviceKey"
            >
              <el-select
                v-model="formData.deviceKey"
                clearable
                multiple
                placeholder="请选择设备类型"
                :disabled="isShow"
              >
                <el-option
                  v-for="item in DC_PMS_PROJECT_QIOPMENT"
                  :key="item.dictKey"
                  :label="item.dictValue"
                  :value="item.dictKey"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="产品类型"
              id="productKey"
              prop="productKey"
            >
              <el-select
                v-model="formData.productKey"
                clearable
                placeholder="请选择产品类型"
                :disabled="isShow"
              >
                <el-option
                  v-for="item in DC_CRM_PRODUCT"
                  :key="item.dictKey"
                  :label="item.label"
                  :value="item.dictKey"
                />
              </el-select>
            </el-form-item>
            <div class="form-group-title" id="processParameter">
              维度细分（为设备工艺时需配置工艺项）
            </div>
            <el-table :data="formData.dcCrmRlistItems">
              <!-- <el-table-column type="expand">
                <template #default="props">{{ dcCrmRlistTechnologyItems }}</template>
              </el-table-column> -->
              <el-table-column label="需求维度" prop="rlistDimensionKey" width="100" align="center">
                <template #default="scoped">
                  <dc-dict-key :options="DC_CRM_DIMENSION" :value="scoped.row.rlistDimensionKey" />
                </template>
              </el-table-column>
              <el-table-column label="维度内容" prop="dimensionContent" width="150" align="center">
                <template #default="scoped">
                  {{ scoped.row.dimensionContent || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="工艺参数" prop="parameter" min-width="250" align="center">
                <template #default="scoped">
                  <el-select
                    v-if="scoped.row.isTechnology"
                    v-model="scoped.row.parameter"
                    placeholder="选择工艺参数"
                    multiple
                    clearable
                  >
                    <el-option
                      v-for="item in DC_CRM_TECHNOLOGY"
                      :key="item.value"
                      :label="item.label"
                      :value="item.dictKey"
                    />
                  </el-select>
                  <el-input
                    v-else
                    v-model="scoped.row.parameter"
                    type="textarea"
                    placeholder="工艺参数"
                  />
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="note" width="200" align="center">
                <template #default="scoped">
                  <el-input v-model="scoped.row.note" type="textarea" placeholder="备注" />
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="140" align="center">
                <template #default="scoped">
                  <el-button
                    v-if="scoped.row.isTechnology"
                    type="primary"
                    @click="configCrafts(scoped.row)"
                    text
                  >
                    工艺项配置
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <div class="wrap-right">
        <div class="wrap-right-scroll">
          <div class="wrap-right-content">
            <div class="wrap-right-content-title">基本信息</div>
            <!-- <div class="wrap-right-vicecontent" @click="anchorPoint('rlistName')">
              <div class="label">设备名称</div>
              <div class="value ellipsis">
                {{ formData.rlistName || '-' }}
              </div>
            </div> -->
            <div class="wrap-right-vicecontent" @click="anchorPoint('bdId')">
              <div class="label">BD</div>
              <div class="value ellipsis">
                <dc-view v-model="formData.bdId" objectName="user" />
              </div>
            </div>
            <div class="wrap-right-vicecontent" @click="anchorPoint('customerId')">
              <div class="label">关联客户</div>
              <div class="value ellipsis">
                <dc-view v-model="formData.customerId" objectName="customer" />
              </div>
            </div>
            <div class="wrap-right-vicecontent" @click="anchorPoint('oppsId')">
              <div class="label">关联商机</div>
              <div class="value ellipsis">
                <dc-view v-model="formData.oppsId" objectName="opps" />
              </div>
            </div>
            <div class="wrap-right-vicecontent" @click="anchorPoint('followContent')">
              <div class="label">备注</div>
              <div class="value ellipsis">
                {{ formData.followContent || '-' }}
              </div>
            </div>
            <div class="wrap-right-content-title">工艺&产品</div>
            <div class="wrap-right-vicecontent" @click="anchorPoint('deviceTypeKey')">
              <div class="label">设备种类</div>
              <div class="value ellipsis">
                <dc-dict-key :options="DC_CRM_DEVICE_TYPE" :value="formData.deviceTypeKey" />
              </div>
            </div>
            <div class="wrap-right-vicecontent" @click="anchorPoint('deviceKey')">
              <div class="label">设备类型</div>
              <div class="value ellipsis">
                <template v-if="Array.isArray(formData.deviceKey)">
                  <dc-dict-key
                    v-for="eq in formData.deviceKey"
                    :options="DC_PMS_PROJECT_QIOPMENT"
                    :value="eq"
                  />
                </template>
                <dc-dict-key
                  v-else
                  :options="DC_PMS_PROJECT_QIOPMENT"
                  :value="formData.deviceKey"
                />
              </div>
            </div>
            <div class="wrap-right-vicecontent" @click="anchorPoint('productKey')">
              <div class="label">产品类型</div>
              <div class="value ellipsis">
                <dc-dict-key :options="DC_CRM_PRODUCT" :value="formData.productKey" />
              </div>
            </div>
            <div class="wrap-right-content-title" @click="anchorPoint('processParameter')">
              维度细分（为设备工艺时需配置工艺项）
            </div>
          </div>
        </div>

        <div class="wrap-right-footer">
          <div class="wrap-right-footer-top">
            <el-popover placement="top" title="信息不完整" :width="300" trigger="click">
              <template #default>
                <div class="unfilled-group">
                  <div
                    class="unfilled-item"
                    v-for="(item, index) in unfilledItems"
                    :key="index"
                    @click="anchorPoint(item.key)"
                  >
                    <div class="unfilled-item_label">{{ item.keyName }}</div>
                    <div class="unfilled-item_value ellipsis">信息为空，请选择</div>
                  </div>
                </div>
              </template>

              <template #reference>
                <div class="unfilled-box">
                  {{ unfilledItems.length }}项不完善
                  <el-icon class="arrow-up-icon">
                    <ArrowUp />
                  </el-icon>
                </div>
              </template>
            </el-popover>
            <el-checkbox
              v-model="uploadChecked"
              :label="`是否${operateType}客户需求表`"
              size="large"
            />
          </div>
          <div class="wrap-right-footer-btn">
            <el-button type="primary" @click="submitForm">
              {{ operateType }}
            </el-button>
            <el-button @click="cancel">取消</el-button>
          </div>
        </div>
      </div>
    </el-form>
  </div>
  <el-drawer
    v-model="open"
    title="工艺项配置"
    destroy-on-close
    append-to-body
    size="800"
    @close="closeDrawer"
  >
    <el-form ref="formRef" class="h-full" :model="formData" label-width="80px">
      <el-table :data="dcCrmRlistTechnologyItems" height="100%">
        <el-table-column label="工艺名称" prop="technologyNameKey" width="100" align="center">
          <template #default="scoped">
            <dc-dict-key :options="DC_CRM_TECHNOLOGY" :value="scoped.row.technologyNameKey" />
          </template>
        </el-table-column>
        <el-table-column label="工艺项" prop="technologyContent" width="150" align="center">
          <template #default="scoped">
            {{ scoped.row.technologyContent || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="工艺参数"
          prop=" technologyParameter"
          min-width="250"
          align="center"
        >
          <template #default="scoped">
            <el-input
              v-model="scoped.row.technologyParameter"
              type="textarea"
              placeholder="请输入工艺参数"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="note" width="200" align="center">
          <template #default="scoped">
            <el-input v-model="scoped.row.note" type="textarea" placeholder="请输入备注" />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="confirm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="DemandScheduleSubmit">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { useRouter, useRoute } from 'vue-router';
import Const from '@/const';

const router = useRouter();
const route = useRoute(); // 获取当前路由对象

const { proxy } = getCurrentInstance();

const {
  DC_CRM_DEVICE_TYPE,
  DC_PMS_PROJECT_QIOPMENT,
  DC_CRM_PRODUCT,
  DC_CRM_DIMENSION,
  DC_CRM_TECHNOLOGY,
} = proxy.useCache([
  { key: 'DC_CRM_DEVICE_TYPE' },
  { key: 'DC_PMS_PROJECT_QIOPMENT' },
  { key: 'DC_CRM_PRODUCT' },
  { key: 'DC_CRM_DIMENSION' },
  { key: 'DC_CRM_TECHNOLOGY' },
]);

const pageData = reactive({
  loading: false,
  rules: {
    // rlistName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    bdId: [{ required: true, message: '请选择BD', trigger: 'blur' }],
    customerId: [{ required: true, message: '请选择关联客户', trigger: 'blur' }],
    oppsId: [{ required: true, message: '请选择关联商机', trigger: 'blur' }],
    deviceTypeKey: [{ required: true, message: '请选择设备种类', trigger: 'blur' }],
    deviceKey: [{ required: true, message: '请选择设备种类', trigger: 'blur' }],
    productKey: [{ required: true, message: '请选择产品类型', trigger: 'blur' }],
  },
  keyNames: {
    // rlistName: '设备名称',
    bdId: 'BD',
    customerId: '关联客户',
    oppsId: '关联商机',
    deviceTypeKey: '设备种类',
    deviceKey: '设备种类',
    productKey: '产品类型',
  },
  formData: {
    bdId: undefined,
    followContent: undefined,
  },
  isShow: false,
  uploadChecked: true,
  // 工艺项配置
  open: false,
  // 某一行的工艺配置项
  dcCrmRlistTechnologyItems: [],
  // 编辑中的行
  editRow: {},
});

const {
  loading,
  rules,
  formData,
  keyNames,
  isShow,
  uploadChecked,
  open,
  dcCrmRlistTechnologyItems,
  editRow,
} = toRefs(pageData);

// 未填项
const unfilledItems = computed(() => {
  return Object.keys(rules.value)
    .filter(key => {
      if (formData.value[key] instanceof Array && formData.value[key].length === 0) return true;
      if (typeof formData.value[key] === 'string' && !formData.value[key]) return true;
      if (!formData.value[key]) return true;
      return false;
    })
    .map(key => {
      formData.value[key];
      return {
        key,
        keyName: keyNames.value[key],
      };
    });
});

// 操作类型
const operateType = computed(() => {
  if (route.path.indexOf('create') > -1) {
    return '创建';
  } else if (route.path.indexOf('edit') > -1) {
    return '编辑';
  } else if (route.path.indexOf('update') > -1) {
    return '升版';
  }
});

onMounted(async () => {
  if (route.params.id !== 'create' && !!route.params.id) {
    await getDetail(route.params.id);
  } else {
    await initCreate();
    formData.value.customerId = route.query.customerId;
  }
});

// 初始化创建
const initCreate = async () => {
  await getConfigueList();
};

// 获取配置项目明细
const getConfigueList = async () => {
  const res = await Api.crm.customerRlist.getConfigueList();
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = data;
  }
};

// 获取详情
const getDetail = async id => {
  const res = await Api.crm.customerRlist.detail({
    id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = {
      ...data,
      deviceKey: data.deviceKey ? data.deviceKey?.split(',') : [],
    };
    formData.value.dcCrmRlistItems = formData.value.dcCrmRlistItems.map(item => {
      if (item.isTechnology) {
        if (item.parameter) item.parameter = item.parameter.split(',');
      }
      return item;
    });
  }
};

// 工艺项配置
const configCrafts = async row => {
  if (Array.isArray(row.parameter) && !row.parameter.length) {
    return proxy.$message.error('请选择工艺参数后配置！');
  }
  try {
    loading.value = true;
    const technologyKey = row.parameter.join(',');
    const res = await Api.crm.customerRlist.getTechnologyConfigueList({
      technologyKey,
      id: formData.value.id,
    });
    const { code, data } = res.data;
    if (code === 200) {
      dcCrmRlistTechnologyItems.value = data;
      editRow.value = row;
      openDialog();
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 打开弹窗
const openDialog = () => {
  open.value = true;
};

// 关闭弹窗
const closeDrawer = () => {
  open.value = false;
  dcCrmRlistTechnologyItems.value = [];
  editRow.value = [];
};

const confirm = () => {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      editRow.value.dcCrmRlistTechnologyItems = dcCrmRlistTechnologyItems.value;
      closeDrawer();
    }
  });
};

// 保存 确认创建
const submitForm = () => {
  if (!uploadChecked.value)
    return proxy.$message.error(`请勾选 是否进行客户需求表${operateType}，提交客户需求表信息`);
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      try {
        loading.value = true;
        const form = {
          ...formData.value,
          deviceKey: formData.value.deviceKey?.join(','),
          attachments: Array.isArray(formData.value.attachments)
            ? formData.value.attachments.map(item => item.id).join(',')
            : null,
          dcCrmRlistItems: formData.value.dcCrmRlistItems.map(item => {
            if (item.isTechnology) {
              if (Array.isArray(item.parameter)) item.parameter = item.parameter.join(',');
            }
            return item;
          }),
        };
        if (operateType.value === '升版') {
          const res = await Api.crm.customerRlist.updateVersion(form);
          const { code, msg } = res.data;
          if (code === 200) {
            proxy.$message.success(msg);
            router.go(-1);
          }
        } else {
          const res = await Api.crm.customerRlist.submit(form);
          const { code, msg } = res.data;
          if (code === 200) {
            proxy.$message.success(msg);
            router.go(-1);
          }
        }

        loading.value = false;
      } catch (error) {
        console.error('error', error);
        loading.value = false;
      }
    }
  });
};

// 锚点并且检验 form-item
const anchorPoint = id => {
  try {
    proxy.$refs['ruleFormRef'].clearValidate();
    window.location.hash = id;
    proxy.$refs['ruleFormRef'].validateField(id);
  } catch (err) {}
};

// 点击取消跳转商机列表
const cancel = () => {
  proxy
    .$confirm(`确认是否取消新建项目计划?`, {
      confirmButtonText: '确认取消',
      cancelButtonText: '继续创建',
      type: 'warning',
    })
    .then(() => {
      router.go(-1);
    });
};

const findNodeById = (tree, dictKey) => {
  for (const node of tree) {
    if (node.dictKey === dictKey) return node;
    if (node.children && node.children.length) {
      const result = findNodeById(node.children, dictKey);
      if (result) return result;
    }
  }
  return null;
};
</script>
<style lang="scss">
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

@media (max-width: 1360px) {
  .form-itme-width_50 {
    width: 100% !important;
    margin-right: 0;
  }
}
</style>
<style scoped lang="scss">
.wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;

  &-left {
    flex: 1;
    height: 100%;
    overflow: auto;
    background: #fff;
    margin-right: 16px;

    &-form {
      margin: auto;
      padding-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      width: 80%;
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

  &-right {
    width: 460px;
    height: 100%;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    :deep(.el-form-item__label) {
      width: 85px !important;
    }

    &-scroll {
      overflow: auto;
      flex: 1;
    }

    &-content {
      display: flex;
      flex-direction: column;
      padding: 20px;
      gap: 12px;

      &-title {
        height: 32px;
        font-weight: 600;
        font-size: 16px;
        color: #333;
        line-height: 32px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    &-vicecontent {
      display: flex;
      align-items: center;
      width: 100%;
      height: 32px;
      line-height: 32px;
      font-weight: 400;
      font-size: 14px;
      color: #333;

      &:hover {
        background-color: rgba(250, 111, 12, 0.05);

        &::after {
          margin-right: 20px;
          content: '点击可进行锚点定位';
          font-weight: 400;
          font-size: 12px;
          color: #333;
        }
      }

      .label {
        width: 110px;

        &::after {
          content: '：';
        }
      }

      .value {
        display: inline-flex;
        align-items: center;
        flex: 1;
        font-weight: 500;
      }
    }

    &-footer {
      padding-left: 20px;
      border-radius: 8px;
      box-shadow: 4px 0 10px 0 rgba(0, 0, 0, 0.15);

      &-top {
        display: flex;
        align-items: center;
        padding: 10px;
      }

      &-btn {
        border-top: 1px solid #e5e5e5;
        padding: 16px 0;
      }
    }
  }
}

.show-dialog {
  margin-top: 20px;
  float: right;
}

.backList {
  margin-bottom: 15px;
}

.headeAdd {
  margin-bottom: 15px;
}

.unfilled-box {
  margin-right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 99px;
  height: 24px;
  background: rgba(225, 33, 55, 0.1);
  font-size: 12px;
  color: #e12137;
  cursor: pointer;

  .arrow-up-icon {
    margin-left: 5px;
  }
}

.unfilled-group {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  .unfilled-item {
    box-sizing: border-box;
    padding: 0 8px;
    display: flex;
    align-items: center;
    width: 277px;
    height: 32px;
    background-color: #f6f8fa;

    &_label {
      width: 90px;
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    &_value {
      flex: 1;
      cursor: pointer;
    }
  }
}
</style>
