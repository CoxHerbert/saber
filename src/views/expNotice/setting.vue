<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="来源" prop="sourceFrom">
        <el-input type="text" v-model="queryParams.sourceFrom" placeholder="请输入来源"></el-input>
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          type="text"
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="异常通知类名称" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="请选择异常通知类名称" clearable>
          <el-option
            v-for="(item, index) in DC_EXPNOTICE_TYPE"
            :key="index"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态" prop="openStatus">
        <el-select v-model="queryParams.openStatus" placeholder="请选择启用状态" clearable>
          <el-option
            v-for="(item, index) in DC_EXPNOTICE_STATUS"
            :key="index"
            :value="item.dictKey"
            :label="item.label"
            :disabled="item.label == '创建中'"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="operate-container">
      <el-button type="primary" icon="CirclePlus" @click="handleAdd">新增</el-button>
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" label="来源" align="center" prop="sourceFrom" />
        <el-table-column min-width="100px" label="部门名称" align="center" prop="deptName" />
        <el-table-column
          min-width="130px"
          label="异常通知类名称"
          align="center"
          prop="noticrTypeName"
          :show-overflow-tooltip="true"
        >
        </el-table-column>

        <el-table-column min-width="120px" label="第一阶段通知" align="center">
          <template #default="scoped">
            <p>{{ scoped.row.levelOneTime / 3600 }}小时</p>
            <dc-view v-model="scoped.row.levelOnePerson" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column min-width="120px" label="第二阶段通知" align="center">
          <template #default="scoped">
            <p>{{ scoped.row.levelTwoTime / 3600 }}小时</p>
            <dc-view v-model="scoped.row.levelTwoPerson" objectName="user" showKey="realName" />
          </template>
        </el-table-column>

        <el-table-column min-width="120px" label="第三阶段通知" align="center">
          <template #default="scoped">
            <p>{{ scoped.row.levelThreeTime / 3600 }}小时</p>
            <dc-view v-model="scoped.row.levelThreePerson" objectName="user" showKey="realName" />
          </template>
        </el-table-column>

        <el-table-column min-width="120px" label="第四阶段通知" align="center">
          <template #default="scoped">
            <p>{{ scoped.row.levelFourTime / 3600 }}小时</p>
            <dc-view v-model="scoped.row.levelFourPerson" objectName="user" showKey="realName" />
          </template>
        </el-table-column>

        <el-table-column min-width="120px" label="第五阶段通知" align="center">
          <template #default="scoped">
            <p>{{ scoped.row.levelFiveTime / 3600 }}小时</p>
            <dc-view v-model="scoped.row.levelFivePerson" objectName="user" showKey="realName" />
          </template>
        </el-table-column>

        <el-table-column
          min-width="100"
          label="是否为每日定时通知"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template #default="scoped">
            <el-tag :type="scoped.row.isDailyNotice ? 'success' : 'danger'">
              {{ scoped.row.isDailyNotice ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column min-width="100" label="启用状态" align="center">
          <template #default="scoped">
            <el-tag :type="scoped.row.openStatus == 'OPENING' ? 'success' : 'danger'">
              {{ scoped.row.openStatus == 'OPENING' ? '已启用' : '已暂停' }}</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column min-width="60px" label="排序" align="center" prop="sort" />

        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template #default="scoped">
            <el-switch
              v-model="scoped.row.openStatus"
              style="margin-right: 20px"
              active-value="OPENING"
              inactive-value="HOLD"
              @input="e => changeOpenStatus(e, scoped.row)"
            >
            </el-switch>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scoped.row)"
              >编辑</el-button
            >
            <el-button link type="primary" icon="Delete" @click="handleDelete(scoped.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />

    <el-drawer v-model="dialogVisible" size="800px" :title="title" @close="cancel">
      <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="来源" prop="sourceFrom">
              <el-input
                type="text"
                v-model="formData.sourceFrom"
                placeholder="请输入来源"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input
                type="text"
                v-model="formData.deptName"
                placeholder="请输入部门名称"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="异常通知类名称" prop="noticeType">
              <el-select
                v-model="formData.noticeType"
                placeholder="请选择异常通知类名称"
                clearable
                @change="changeNoticeType"
              >
                <el-option
                  v-for="(item, index) in DC_EXPNOTICE_TYPE"
                  :key="index"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-form-item label="异常通知sql" prop="sqlSentence">
          <el-input
            type="textarea"
            v-model="formData.sqlSentence"
            placeholder="请输入异常通知sql"
            :rows="5"
          ></el-input>
        </el-form-item> -->

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="第一阶段通知时间(H)" prop="levelOneTime">
              <el-input
                type="number"
                v-model="formData.levelOneTime"
                placeholder="请输入第一阶段通知时间"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第一阶段通知人" prop="levelOnePerson">
              <dc-select-user
                v-model="formData.levelOnePerson"
                placeholder="请选择"
                :multiple="true"
                :multiple-limit="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="第二阶段通知时间(H)" prop="levelTwoTime">
              <el-input
                type="number"
                v-model="formData.levelTwoTime"
                placeholder="请输入第二阶段通知时间"
                min="0"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第二阶段通知人" prop="levelTwoPerson">
              <dc-select-user
                v-model="formData.levelTwoPerson"
                placeholder="请选择"
                :multiple="true"
                :multiple-limit="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="第三阶段通知时间(H)" prop="levelThreeTime">
              <el-input
                type="number"
                max="24"
                v-model="formData.levelThreeTime"
                placeholder="请输入第三阶段通知时间"
              >
                <template slot="append">小时</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第三阶段通知人" prop="levelThreePerson">
              <dc-select-user
                v-model="formData.levelThreePerson"
                placeholder="请选择"
                :multiple="true"
                :multiple-limit="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="第四阶段通知时间(H)" prop="levelFourTime">
              <el-input
                type="number"
                v-model="formData.levelFourTime"
                placeholder="请输入第四阶段通知时间"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第四阶段通知人" prop="levelFourPerson">
              <dc-select-user
                v-model="formData.levelFourPerson"
                placeholder="请选择"
                :multiple="true"
                :multiple-limit="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="第五阶段通知时间(H)" prop="levelFiveTime">
              <el-input
                type="number"
                v-model="formData.levelFiveTime"
                placeholder="请输入第五阶段通知时间"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第五阶段通知人" prop="levelFivePerson">
              <dc-select-user
                v-model="formData.levelFivePerson"
                placeholder="请选择"
                :multiple="true"
                :multiple-limit="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="每日通知corn表达式" prop="dailyNoticeCorn">
              <el-input
                type="textarea"
                v-model="formData.dailyNoticeCorn"
                placeholder="请输入每日通知corn表达式"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="是否为每日定时通知" prop="isDailyNotice">
              <el-switch v-model="formData.isDailyNotice" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input type="number" v-model="formData.sort" placeholder="请输入排序"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
          <el-button @click="cancel(ruleFormRef)">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import { getSetList, removeSet, updateSet, addSet, getTenantList } from '@/api/system/expNotice';
const { proxy } = getCurrentInstance();

const data = reactive({
  tenantList: [],
  formData: {
    openStatus: 'CREATED',
  },
  queryParams: {
    current: 1,
    size: 10,
    workGroupName: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  switchValue: true,
  title: '',
  rules: {
    deptName: [{ required: true, message: '部门为必选项', trigger: 'blur' }],
    sourceFrom: [{ required: true, message: '来源为必选项', trigger: 'blur' }],
    noticeType: [{ required: true, message: '异常通知类名称为必选项', trigger: 'change' }],
    //sqlSentence: [{ required: true, message: '异常通知sql为必选项', trigger: 'blur' }],
    levelOneTime: [{ required: true, message: '第一阶段通知时间(H)为必选项', trigger: 'blur' }],
    levelOnePerson: [{ required: true, message: '第一阶段通知人为必选项', trigger: 'blur' }],
  },
  dialogVisible: false,
});

const {
  queryParams,
  formData,
  dataList,
  loading,
  total,
  switchValue,
  title,
  rules,
  dialogVisible,
} = toRefs(data);

const ruleFormRef = ref(null);
// 数据字典
const { DC_EXPNOTICE_TYPE, DC_EXPNOTICE_STATUS } = proxy.useCache([
  { key: 'DC_EXPNOTICE_TYPE' },
  { key: 'DC_EXPNOTICE_STATUS' },
]);

onMounted(() => {
  getData();
  getTenantListFn();

  console.log(DC_EXPNOTICE_STATUS);
});

// 启用/禁用
const changeOpenStatus = async (e, row) => {
  console.log(e);
  console.log(row.openStatus);

  let data = Object.assign({}, row);
  data.openStatus = e;
  const res = await updateSet(data);
  const { code, msg } = res.data;
  if (code === 200) {
    getData();
    proxy.$message.success(msg);
  }
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await getSetList(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
    switchValue.value = data.isEnable;
  }
  loading.value = false;
};

// 处理变化
const changeNoticeType = (e, row) => {
  let find = DC_EXPNOTICE_TYPE.value.find(item => item.value === e);
  formData.value.noticrTypeName = find.dictValue;
};

// 开关方式
const handleUpdate = async row => {
  let data = Object.assign({}, row);
  data.sqlSentence = decodeURIComponent(data.sqlSentence);
  if (data.levelOneTime && data.levelOneTime > 0) {
    data.levelOneTime = data.levelOneTime / 3600;
  }
  if (data.levelTwoTime && data.levelTwoTime > 0) {
    data.levelTwoTime = data.levelTwoTime / 3600;
  }
  if (data.levelThreeTime && data.levelThreeTime > 0) {
    data.levelThreeTime = data.levelThreeTime / 3600;
  }
  if (data.levelFourTime && data.levelFourTime > 0) {
    data.levelFourTime = data.levelFourTime / 3600;
  }
  if (data.levelFiveTime && data.levelFiveTime > 0) {
    data.levelFiveTime = data.levelFiveTime / 3600;
  }
  formData.value = data;
  title.value = '编辑';
  dialogVisible.value = true;
};

// 打开添加弹窗
const handleAdd = async () => {
  title.value = '添加';
  dialogVisible.value = true;
  proxy.resetForm('ruleFormRef');
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
    workGroupName: undefined,
    areaName: undefined,
    chargePerson: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = [row.id];
  proxy
    .$confirm('是否确认删除异常通知类名称为"' + row.noticrTypeName + '"的数据项？')
    .then(async () => {
      return removeSet(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      const form = Object.assign({}, formData.value);
      form.sqlSentence = encodeURIComponent(form.sqlSentence);
      if (form.levelOneTime > 0) {
        form.levelOneTime = form.levelOneTime * 3600 || null;
      }
      if (form.levelTwoTime > 0) {
        form.levelTwoTime = form.levelTwoTime * 3600 || null;
      }
      if (form.levelThreeTime > 0) {
        form.levelThreeTime = form.levelThreeTime * 3600 || null;
      }
      if (form.levelFourTime > 0) {
        form.levelFourTime = form.levelFourTime * 3600 || null;
      }
      if (form.levelFiveTime > 0) {
        form.levelFiveTime = form.levelFiveTime * 3600 || null;
      }
      if (form.id) {
        const res = await updateSet(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await addSet(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      }
    }
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = {};
};

// 获取租户列表
const getTenantListFn = () => {
  getTenantList().then(res => {
    if (res.data.code === 200) {
      data.tenantList = res.data.data;
    }
  });
};
</script>
