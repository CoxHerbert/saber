<template>
  <div class="content-warp">
    <!-- <div class="btn-row">
      <el-upload
        :show-file-list="false"
        accept=".xls,.xlsx"
        :http-request="uploadFile"
        class="ml-2 mr-2"
      >
        <el-button type="primary" icon="Plus">导入</el-button>
      </el-upload>
    </div> -->
    <el-table :data="siteReportList">
      <el-table-column label="序号" width="80" type="index" align="center">
        <template #default="scoped">
          <span>{{ scoped.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="用户名" align="center" width="100">
        <template #default="scoped">
          <dc-view v-model="scoped.row.userId" objectName="user" showKey="realName" />
        </template>
      </el-table-column>
      <el-table-column prop="levelDict" label="人员等级" align="center" width="80">
        <template #default="scoped">
          <dc-dict-key :options="DC_MMR_PERSON_LEVEL" :value="scoped.row.levelDict" />
        </template>
      </el-table-column>
      <el-table-column prop="skillDict" label="人员技能" align="center" min-width="200"
        ><template #default="scoped">
          <dc-dict-key
            :options="DC_MMR_SKILL"
            :value="dict"
            v-for="dict in scoped.row.skillDict"
            :key="dict"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="startDate"
        label="入驻开始时间"
        align="center"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        prop="endDate"
        label="入驻结束时间"
        align="center"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        prop="country"
        label="国家"
        align="center"
        width="160"
        show-overflow-tooltip
      />
    </el-table>
  </div>
</template>
<script setup name="SiteReport">
import { onMounted, toRefs } from 'vue';
import Api from '@/api/index';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();

const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
});

const { proxy } = getCurrentInstance();
const { DC_MMR_PERSON_LEVEL, DC_MMR_SKILL } = proxy.useCache([
  { key: 'DC_MMR_PERSON_LEVEL' },
  { key: 'DC_MMR_SKILL' },
]);

let pageData = reactive({
  siteReportList: [],
});

let { siteReportList } = toRefs(pageData);

onMounted(async () => {
  await getDetail();
});
const getDetail = async orderId => {
  const res = await Api.pdp.mmrStaffSchedule.detail({
    orderId: route.params.id ? route.params.id : props.id,
    size: 1000,
    current: 1,
  });
  const { code, data } = res.data;
  if (code == 200) {
    siteReportList.value = data.records.map(item => {
      item.skillDict = item.skillDict ? item.skillDict.split(',') : [];
      return item;
    });
  }
};

/** 上传文件 */
const uploadFile = async fileObj => {
  const formData = new FormData();
  formData.append('file', fileObj.file);
  try {
    const response = await axios.post(
      '/blade-bip/mmr-staff-schedule/import-excel-user-detail?orderId=' +
        (route.params.id ? route.params.id : props.id),
      formData
    );

    if (response.data.code === 200) {
      ElMessage.success('导入成功！');
    } else {
      ElMessage.error(response.data.message || '导入失败');
    }
  } catch (error) {
    console.error('导入失败', error);
    ElMessage.error('导入失败，请稍后重试');
  }
};
</script>
<style lang="scss">
.btn-row {
  text-align: right;
  padding-bottom: 16px;
}
</style>
