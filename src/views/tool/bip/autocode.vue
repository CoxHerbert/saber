<template>
  <div class="app-container">
    <!-- 项目结构信息展示 -->
    <el-card class="project-info-card" shadow="never" v-if="projectInfo">
      <template #header>
        <div class="card-header">
          <span>项目信息</span>
          <el-button type="text" @click="refreshProjectInfo" :loading="refreshing">
            <el-icon><RefreshRight /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ projectInfo.projectName }}</el-descriptions-item>
        <el-descriptions-item label="模块数量">{{ projectInfo.modules?.length || 0 }}</el-descriptions-item>
        <el-descriptions-item label="项目路径" :span="2">
          <el-text type="info" size="small">{{ projectInfo.projectRoot }}</el-text>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 代码生成表单 -->
    <el-card class="form-card" shadow="never">
      <template #header>
        <span>代码生成配置</span>
      </template>

      <el-form
        ref="submitFormRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <!-- 基础信息 -->
          <el-col :span="12">
            <el-form-item label="数据模型" prop="modelId">
              <el-select
                v-model="formData.modelId"
                placeholder="请选择数据模型"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in modelOptions"
                  :key="item.id"
                  :label="`${item.modelTable} (${item.tableComment || ''})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="目标模块" prop="targetModuleName">
              <el-select
                v-model="formData.targetModuleName"
                placeholder="请选择目标模块"
                filterable
                clearable
                style="width: 100%"
                @change="onTargetModuleChange"
              >
                <el-option
                  v-for="item in targetModules"
                  :key="item.moduleName"
                  :label="`${item.moduleName} (${item.packageBase})`"
                  :value="item.moduleName"
                >
                  <div>
                    <span>{{ item.moduleName }}</span>
                    <br />
                    <el-text type="info" size="small">{{ item.packageBase }}</el-text>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="类名" prop="className">
              <el-input
                v-model="formData.className"
                placeholder="请输入类名，如：User"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="分组名称" prop="groupName">
              <el-input
                v-model="formData.groupName"
                placeholder="请输入分组名称（可选），如：system"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input
                v-model="formData.author"
                placeholder="请输入作者名称"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 目标模块信息展示 -->
        <el-row v-if="selectedModuleInfo">
          <el-col :span="24">
            <el-alert
              :title="`目标模块: ${selectedModuleInfo.moduleName}`"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <div class="module-info">
                  <p><strong>Service模块:</strong> {{ selectedModuleInfo.packageBase }}</p>
                  <p v-if="selectedModuleInfo.correspondingApiModule">
                    <strong>API模块:</strong> {{ selectedModuleInfo.correspondingApiModule.packageBase }}
                  </p>
                  <p v-else><strong>API模块:</strong> <el-text type="warning">无对应API模块</el-text></p>
                </div>
              </template>
            </el-alert>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 预览区域 -->
    <el-card v-if="previewData" class="preview-card" shadow="never">
      <template #header>
        <span>生成预览</span>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="目标模块">{{ previewData.targetModule }}</el-descriptions-item>
        <el-descriptions-item label="API模块">
          {{ previewData.apiModule || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="Service包名">{{ previewData.servicePackageBase }}</el-descriptions-item>
        <el-descriptions-item label="API包名">
          {{ previewData.apiPackageBase || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">将生成的文件</el-divider>

      <el-list>
        <el-list-item v-for="(file, index) in previewData.willGenerateFiles" :key="index">
          <div class="file-item">
            <el-icon class="file-icon">
              <Document />
            </el-icon>
            <el-text class="file-path" size="small">{{ file }}</el-text>
          </div>
        </el-list-item>
      </el-list>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button @click="resetForm">重置</el-button>
      <el-button type="info" @click="previewConfig" :loading="previewing">
        预览配置
      </el-button>
      <el-button type="primary" @click="generateCode" :loading="generating">
        生成代码
      </el-button>
    </div>

    <!-- 生成结果对话框 -->
    <el-dialog v-model="resultDialogVisible" title="生成结果" width="60%">
      <div v-if="generateResult">
        <el-alert
          :title="generateResult.success ? '代码生成成功！' : '代码生成失败！'"
          :type="generateResult.success ? 'success' : 'error'"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        >
          <template #default>
            <p>{{ generateResult.message }}</p>
            <p v-if="generateResult.targetModule">
              <strong>目标模块:</strong> {{ generateResult.targetModule }}
            </p>
          </template>
        </el-alert>

        <div v-if="generateResult.success && generateResult.generatedFiles">
          <el-divider content-position="left">生成的文件</el-divider>
          <el-list>
            <el-list-item v-for="(file, index) in generateResult.generatedFiles" :key="index">
              <el-icon color="#67C23A"><SuccessFilled /></el-icon>
              <span style="margin-left: 8px">{{ file }}</span>
            </el-list-item>
          </el-list>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="resultDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="EnhancedAutoCode">
import { onMounted, reactive, toRefs, computed, getCurrentInstance } from 'vue';
import { RefreshRight, Document, SuccessFilled } from '@element-plus/icons-vue';
import Api from '@/api/index'; // 根据实际路径调整导入

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  refreshing: false,
  previewing: false,
  generating: false,
  resultDialogVisible: false,

  // 项目信息
  projectInfo: null,

  // 选项数据
  modelOptions: [],
  targetModules: [],

  // 表单数据
  formData: {
    modelId: null,
    targetModuleName: null,
    className: null,
    groupName: null,
    author: localStorage.getItem('username') || null,
  },

  // 预览和结果数据
  previewData: null,
  generateResult: null,

  // 验证规则
  rules: {
    modelId: [
      { required: true, message: '请选择数据模型', trigger: 'change' }
    ],
    targetModuleName: [
      { required: true, message: '请选择目标模块', trigger: 'change' }
    ],
    className: [
      { required: true, message: '请输入类名', trigger: 'blur' },
      { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '类名必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
    ],
    author: [
      { required: true, message: '请输入作者', trigger: 'blur' }
    ]
  }
});

const {
  loading, refreshing, previewing, generating, resultDialogVisible,
  projectInfo, modelOptions, targetModules, formData, previewData,
  generateResult, rules
} = toRefs(pageData);

// 计算属性：当前选中的模块信息
const selectedModuleInfo = computed(() => {
  if (!formData.value.targetModuleName) return null;
  return targetModules.value.find(m => m.moduleName === formData.value.targetModuleName);
});

onMounted(() => {
  initData();
});

// 初始化数据
const initData = async () => {
  await Promise.all([
    getProjectInfo(),
    getModelOptions(),
    getTargetModules()
  ]);
};

// 获取项目信息
const getProjectInfo = async () => {
  try {
    const res = await Api.configManage.code.getProjectOverview();
    const { code, data } = res.data;
    if (code === 200) {
      projectInfo.value = data;
    }
  } catch (error) {
    console.error('获取项目信息失败:', error);
  }
};

// 获取数据模型选项
const getModelOptions = async () => {
  try {
    const res = await Api.configManage.model.list({
      current: 1,
      size: 9999,
    });
    const { code, data } = res.data;
    if (code === 200) {
      modelOptions.value = data.records || [];
    }
  } catch (error) {
    console.error('获取数据模型失败:', error);
  }
};

// 获取目标模块列表
const getTargetModules = async () => {
  try {
    const res = await Api.configManage.code.getTargetModules();
    const { code, data } = res.data;
    if (code === 200) {
      targetModules.value = data || [];
    }
  } catch (error) {
    console.error('获取目标模块失败:', error);
  }
};

// 刷新项目信息
const refreshProjectInfo = async () => {
  refreshing.value = true;
  try {
    await Promise.all([
      getProjectInfo(),
      getTargetModules()
    ]);
    proxy.$message.success('项目信息刷新成功');
  } catch (error) {
    proxy.$message.error('刷新失败');
  } finally {
    refreshing.value = false;
  }
};

// 目标模块变化事件
const onTargetModuleChange = () => {
  // 清除预览数据
  previewData.value = null;
};

// 预览配置
const previewConfig = () => {
  proxy.$refs['submitFormRef'].validate(async valid => {
    if (valid) {
      previewing.value = true;
      try {
        const res = await Api.configManage.code.previewConfig(formData.value);
        const { code, data, msg } = res.data;
        if (code === 200) {
          previewData.value = data;
          proxy.$message.success('预览配置成功');
        } else {
          proxy.$message.error(msg || '预览失败');
        }
      } catch (error) {
        proxy.$message.error('预览配置失败');
        console.error('预览失败:', error);
      } finally {
        previewing.value = false;
      }
    }
  });
};

// 生成代码
const generateCode = () => {
  proxy.$refs['submitFormRef'].validate(async valid => {
    if (valid) {
      generating.value = true;
      try {
        const res = await Api.configManage.code.generateEnhanced(formData.value);
        const { code, data, msg } = res.data;
        if (code === 200) {
          generateResult.value = data;
          resultDialogVisible.value = true;

          // 如果生成成功，清空表单的部分字段
          if (data.success) {
            formData.value.modelId = null;
            formData.value.className = null;
            previewData.value = null;
          }
        } else {
          proxy.$message.error(msg || '生成失败');
        }
      } catch (error) {
        proxy.$message.error('代码生成失败');
        console.error('生成失败:', error);
      } finally {
        generating.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  proxy.$refs['submitFormRef'].resetFields();
  previewData.value = null;
  generateResult.value = null;
};
</script>

<style lang="scss" scoped>
.app-container {
  .project-info-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .form-card {
    margin-bottom: 20px;
  }

  .preview-card {
    margin-bottom: 20px;

    .file-item {
      display: flex;
      align-items: center;

      .file-icon {
        margin-right: 8px;
        color: #409EFF;
      }

      .file-path {
        word-break: break-all;
      }
    }
  }

  .module-info {
    p {
      margin: 5px 0;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 20px;

  div {
    line-height: 1.4;
  }
}
</style>