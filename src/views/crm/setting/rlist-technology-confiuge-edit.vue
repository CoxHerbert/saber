<template>
  <div v-loading="loading" class="page-rlist-technology-confiuge-view-or-edit">
    <div class="header">
      <h3 class="title">{{ title }}</h3>
    </div>
    <div class="content">
      <el-form
        ref="formRef"
        :disabled="route.params.mode === 'detail'"
        :model="formData"
        :label-suffix="':'"
        label-width="140px"
      >
        <el-form-item
          class="w-100"
          v-for="(item, i) in formItems"
          :key="i"
          :label="item.label"
          :prop="item.prop"
          :rules="getRules(item)"
        >
          <el-select
            v-if="item.type === 'dict'"
            v-model="formData[item.prop]"
            :placeholder="`请选择${item.label}`"
          >
            <el-option
              v-for="(op, j) in dictMaps[item.dictKey]"
              :label="op[item.labelKey]"
              :value="op[item.valueKey]"
            ></el-option>
          </el-select>
          <el-switch v-else-if="item.type === 'switch'" v-model="formData[item.prop]"></el-switch>
          <el-input
            v-else
            v-model="formData[item.prop]"
            :placeholder="route.params.mode === 'detail' ? '无' : `请输入${item.label}`"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="footer">
      <el-button type="primary" v-if="route.params.mode !== 'detail'" @click="doAction('submit')"
        >提交</el-button
      >
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </div>
</template>
<script setup>
import api from '@/api';
import { computed, getCurrentInstance, reactive, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const title = computed(() => {
  const { mode } = route.params;
  const titleMaps = {
    add: '新增',
    edit: '编辑',
    detail: '查看',
  };
  return `${titleMaps[mode] || ''}需求表配置`;
});

const pageData = reactive({
  formData: {
    isTechnology: false,
    isJudge: false,
  },
  formItems: [
    {
      label: '工艺名称',
      prop: 'technologyNameKey',
      dictKey: 'DC_CRM_TECHNOLOGY',
      type: 'dict',
      required: true,
      withGroup: false,
      labelKey: 'dictValue',
      valueKey: 'dictKey',
    },
    {
      label: '工艺项',
      required: true,
      prop: 'technologyContent',
      type: 'rowText',
    },
    {
      label: '工艺参数',
      prop: 'technologyParameter',
      type: 'rowText',
    },
  ],
  loading: false,
  dictMaps: {},
});
const { formItems, dictMaps, loading, formData } = toRefs(pageData);

const getData = () => {
  if (['detail', 'edit'].includes(route.params.mode) && route.params.id) {
    api.crm.rlistTechnologyConfiuge
      .detail({
        id: route.params.id,
      })
      .then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          formData.value = data;
        }
      });
  }
};

onMounted(async () => {
  await getDict();
  getData();
});

const getDict = async () => {
  const res = await proxy.getMultipleDict('DC_CRM_TECHNOLOGY');
  dictMaps.value = res;
};

const getRules = item => {
  if (item.required) {
    return [
      {
        required: true,
        trigger: ['blur', 'change'],
        validator(_, value, callback) {
          if ([null, undefined, ''].includes(value)) {
            callback(
              new Error(
                ['switch', 'dict'].includes(item.type)
                  ? `请选择${item.label}`
                  : `${item.label}不能为空`
              )
            );
          } else {
            callback();
          }
        },
      },
    ];
  }

  return undefined;
};

const formRef = ref(null);

const doAction = action => {
  if (action === 'cancel') {
    router.go(-1);
  } else if (action === 'submit') {
    formRef.value.validate().then(valid => {
      loading.value = true;
      api.crm.rlistTechnologyConfiuge
        .submit(formData.value)
        .then(res => {
          loading.value = false;
          const { code, data } = res.data;
          if (code === 200) {
            router.go(-1);
          } else {
            proxy.$message.error(data.msg);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    });
  }
};
</script>
<style lang="scss">
.page-rlist-technology-confiuge-view-or-edit {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;

  .header {
    height: 48px;
    border-bottom: 1px solid #eaeaeb;
    padding-left: 24px;
    .title {
      line-height: 48px;
    }
  }

  .content {
    padding-top: 40px;
    width: 80%;
    margin: 0 auto;
  }
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 48px;
  width: 100%;
  text-align: center;
}
</style>
