<template>
  <div class="addorEdite">
    <div class="title">
      <img
        src="../../../../../public/img/back.png"
        alt=""
        class="back-img"
        @click="$router.go(-1)"
      />{{ title }}物料

      <div class="title-btns">
        <el-button
          type="primary"
          @click="submitForReview('提交审核')"
          v-if="formData.flagStatusDict == 0 && title != '查看'"
          >提交审核</el-button
        >
        <el-button v-if="formData.flagStatusDict == 1" @click="submitForReview('取消审核')"
          >取消审核</el-button
        >
        <el-button
          v-if="(formData.flagStatusDict == 0 || !formData.id) && title != '查看'"
          type="primary"
          @click="submitForm(ruleFormRef)"
          >保存</el-button
        >
      </div>
    </div>
    <el-form
      ref="ruleFormRef"
      :rules="rules"
      :model="formData"
      label-width="auto"
      label-suffix=":"
      style="overflow-x: hidden"
    >
      <div class="form-group-title">基础信息</div>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="物料名称" prop="materialName">
            <el-input
              v-model="formData.materialName"
              placeholder="请输入物料名称"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="组织" prop="orgId">
            <el-select
              v-model="formData.orgId"
              placeholder="请选择组织"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in SCMORG_LIST_CACHE"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="物料编码" prop="materialNumbertext">
            <el-input
              v-model="formData.materialNumbertext"
              placeholder="请输入物料编码"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item class="form-itme-width" label="物料分类" prop="classifyDict">
            <el-select
              style="width: 100%"
              v-model="formData.classifyDict"
              placeholder="请选择物料分类"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_SCM_MATERIAL_CLASSIFY"
                :key="index"
                :value="item.dictKey"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item class="form-itme-width" label="品牌" prop="brand">
            <el-input
              v-model="formData.brand"
              placeholder="请输入品牌"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item class="form-itme-width" label="规格型号" prop="specification">
            <el-input
              v-model="formData.specification"
              placeholder="请输入规格型号"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item class="form-itme-width" label="单位" prop="unitDict">
            <el-select
              v-model="formData.unitDict"
              placeholder="请选择单位"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_MATERIAL_UNIT"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item class="form-itme-width" label="物料属性" prop="attribute">
            <el-select
              v-model="formData.attribute"
              placeholder="请选择物料属性"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_SCM_MATERIAL_ATTRIBUTE"
                :key="index"
                :value="item.id"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="form-group-title">产品技术附件</div>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item prop="pictureId" class="uppicture">
            <dc-upload
              v-model="formData.productFileId"
              :limit="10"
              :targetType="Const.targetType.CUSTOMER_RLIST"
              :isUpload="!isDisabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api/index';
import Const from '@/const';
import { useRoute } from 'vue-router';
const route = useRoute(); // 获取当前路由对象
const router = useRouter();
const { proxy } = getCurrentInstance();
// 数据字典
const { DC_SCM_MATERIAL_CLASSIFY, SCMORG_LIST_CACHE, DC_MATERIAL_UNIT, DC_SCM_MATERIAL_ATTRIBUTE } =
  proxy.useCache([
    { key: 'DC_SCM_MATERIAL_CLASSIFY' },
    { key: 'SCMORG_LIST_CACHE' },
    { key: 'DC_MATERIAL_UNIT' },
    { key: 'DC_SCM_MATERIAL_ATTRIBUTE' },
  ]);

const data = reactive({
  loading: true,
  rules: {
    materialName: [{ required: true, message: '物料名称为必选项', trigger: 'change' }],
    classifyDict: [{ required: true, message: '物料分类为必选项', trigger: 'change' }],
    orgId: [{ required: true, message: '组织为必选项', trigger: 'change' }],
    brand: [{ required: true, message: '品牌为必选项', trigger: 'change' }],
    specification: [{ required: true, message: '规格型号为必选项', trigger: 'change' }],
    unitDict: [{ required: true, message: '单位为必选项', trigger: 'change' }],
    attribute: [{ required: true, message: '物料属性为必选项', trigger: 'change' }],
  },
  formData: {
    materialNumbertext: '系统自动生成',
  },

  ids: [],
  isDisabled: false,
  title: '新增',
});

const { rules, formData, title, isDisabled } = toRefs(data);
const ruleFormRef = ref(null);
const emit = defineEmits(['success']);

onMounted(() => {
  getDetail();
  isDisabled.value = route.query.type == 'look';
});

// 审核和反审核
const submitForReview = name => {
  proxy.$confirm(`确定${name}吗`).then(async () => {
    let form = new FormData();
    form.append('flagStatusDict', name == '提交审核' ? 1 : 0);
    form.append('id', formData.value.id);
    const res = await Api.scm.scmMaterial.toExamine(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      getDetail();
    }
  });
};

// 获取详情
const getDetail = async () => {
  proxy.resetForm('ruleFormRef');
  title.value = route.query.type == 'look' ? '查看' : route.query.id ? '编辑' : '新增';
  if (!route.query.id) return false;
  const res = await Api.scm.scmMaterial.getDetail({
    id: route.query.id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = { ...data.finance, ...data };
    formData.value.materialNumbertext = data.materialNumber;
    formData.value.orgId = parseInt(formData.value.orgId);
    isDisabled.value =
      formData.value.flagStatusDict == 1 || route.query.type == 'look' ? true : false;
  }
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let fdata = {
        ...formData.value,
        flagStatusDict: formData.value.flagStatusDict || 0,
      };

      if (Array.isArray(formData.value.productFileId) && formData.value.productFileId.length > 0) {
        let productFileIdsList = formData.value.productFileId.map(item => {
          return item.id;
        });
        fdata.productFileId = productFileIdsList.join(',');
      }
      const res = await Api.scm.scmMaterial.submit(fdata);
      const { code, msg, data } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        router.go(-1);
        formData.value = { ...data.finance, ...data };
        formData.value.materialNumbertext = data.materialNumber;
        formData.value.orgId = parseInt(formData.value.orgId);
      }
    }
  });
};
</script>

<style scoped lang="scss">
.addorEdite {
  background-color: #fff;
  padding: 0px 19px 19px;
  box-sizing: border-box;
  height: 100%;
  .title {
    display: flex;
    height: 58px;
    align-items: center;
    border-bottom: 1px solid #dadbe0;
    margin-bottom: 20px;
    position: relative;
    .back-img {
      width: 22px;
      height: 22px;
      margin-right: 8px;
      cursor: pointer;
    }
    .title-btns {
      position: absolute;
      right: 0px;
      top: 0px;
      bottom: 0px;
      margin: auto;
      display: flex;
      align-items: center;
    }
  }
}

.uppicture :deep(.component-upload-image) {
  .el-upload--picture-card {
    width: 160px; /* 设置上传按钮的宽度 */
    height: 120px; /* 设置上传按钮的高度 */
    line-height: 120px; /* 设置上传按钮的行高 */
  }

  .el-upload-list--picture-card .el-upload-list__item {
    width: 160px; /* 设置图片项的宽度 */
    height: 120px; /* 设置图片项的高度 */
  }

  .hide .el-upload--picture-card {
    display: none;
  }
}
.form-group-title {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 10px 0px 20px;
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
}

.report-info {
  width: 100%;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #dadbe0;
  padding: 8px 16px;
  box-sizing: border-box;
  margin: 16px 0px 20px;
  background-color: #f6f8fa;
  color: #848488;
  font-size: 14px;
  .report-info-item {
    display: flex;
    align-items: center;
    line-height: 24px;
  }
}
</style>
