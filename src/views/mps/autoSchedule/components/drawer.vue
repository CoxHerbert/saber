<template>
  <el-drawer
    class="schedule-drawer"
    v-model="open"
    size="700px"
    @close="closeDrawer"
    destroy-on-close
  >
    <template #header>
      <div class="child-wrap">
        <el-icon class="close-icon" @click="closeChild"><Close /></el-icon>
        <div>缺料情况：</div>
        <div class="mt-2 table-container">
          <el-table :data="materialList || []" style="width: 100%" height="100%" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="materialCode" label="物料编码" width="140" align="center" />
            <el-table-column prop="materialName" label="物料名称" min-width="120" align="center" />
            <el-table-column prop="completeTimeCount" label="库存/需求" width="120" align="center">
              <template #default="scoped">
                {{ scoped.row.completeQty }}/{{ scoped.row.qty }}
              </template>
            </el-table-column>
            <el-table-column prop="purchaseDate" label="采购日期" min-width="120" align="center">
              <template #default="scoped">
                {{ scoped.row.purchaseDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="deliveryDate" label="预计交货日" min-width="120" align="center">
              <template #default="scoped">
                {{ scoped.row.deliveryDate || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <template #default>
      <div class="info-wrap">
        <el-descriptions class="w-full" :column="2" :label-width="105" border>
          <el-descriptions-item label="专案号：">{{
            info?.projectNumber || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="成品料号：">{{
            info?.materialNumber || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="成品名称：">{{
            info?.materialName || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="工艺名称：">{{
            info?.processName || '-'
          }}</el-descriptions-item>

          <el-descriptions-item
            :label="`${item.processName}：`"
            v-for="(item, index) in info.dcMpsBillInfoList"
            :key="index"
            >{{ item?.workGroupLeaderName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="齐套日：">
            {{ info?.completeSetTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="ETD：">
            {{ info?.etdTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="齐套率：">
            <div class="progress-box" @click="handleOpenChild">
              <el-progress
                class="progress"
                type="circle"
                :width="70"
                :percentage="Number(info?.completeSetRate || 0)"
                ><template #default="scoped">
                  <span class="percentage-value">{{ scoped?.percentage }}%</span>
                </template>
              </el-progress>
              <div>点击查看</div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="工效/进度：">
            <div class="progress-box">
              <el-progress class="progress" type="circle" :width="70" :percentage="info?.progress">
                <template #default="scoped">
                  <span class="percentage-value">{{ scoped?.percentage }}%</span>
                </template>
              </el-progress>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="wrap wrap-table">
        <div class="wrap-title">本工艺模组：</div>
        <div class="table-container">
          <el-table :data="info?.trueMo || []" style="width: 100%" height="100%" border>
            <el-table-column prop="materialNumber" label="物料编码" width="120" align="center" />
            <el-table-column prop="materialName" label="物料名称" min-width="160" align="center" />
            <el-table-column
              prop="completeSetNumber"
              label="齐料数/料总数"
              width="130"
              align="center"
            >
              <template #default="scoped">
                {{ scoped.row.completeSetNumber }}/{{ scoped.row.totalNumber }}
              </template>
            </el-table-column>
            <el-table-column
              prop="completeTimeCount"
              label="已报工时/计划工时"
              width="160"
              align="center"
            >
              <template #default="scoped">
                {{ scoped.row.completeTimeCount }}/{{ scoped.row.planTime }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="wrap remark-dialog">
        <div class="wrap-title">备注：</div>
        <div class="remark-wrap">
          <div class="remark-list" v-if="Array.isArray(noteList) && noteList.length">
            <div class="remark" v-for="(note, index) in noteList" :key="index">
              <div class="remark-user">
                {{ note?.updateTime }}
                <dc-view v-model="note.updateUser" objectName="user" />：
              </div>
              <div class="remark-content">
                <span v-html="note?.notes"></span>
                <span
                  class="remove-btn"
                  @click="doAction('deleteNote', note)"
                  v-if="note.updateUser === proxy.$store.getters.userInfo.user_id"
                  >删除</span
                >
              </div>
            </div>
          </div>
          <div class="no-data" v-else>暂无历史备注</div>
        </div>
        <el-input
          class="w-full mt-2"
          v-model="noteValue"
          :rows="2"
          type="textarea"
          placeholder="清输入备注"
        />
        <div class="mt-4">
          <el-button type="primary" @click="submitNote" v-loading="noteLoading">
            添加备注
          </el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>
<script setup>
import Api from '@/api/index';

const { proxy } = getCurrentInstance();
const emit = defineEmits(['confirm']);
const pageData = reactive({
  // 备注提交
  noteLoading: false,
  //
  drawerId: null,
  // 控制弹窗显示隐藏
  open: false,
  // 详情
  info: {},
  // 历史备注
  noteList: [],
  // 物料列表
  materialList: [],
  // 本次输入的备注
  noteValue: '',
});

const { noteLoading, drawerId, open, info, materialList, noteList, noteValue } = toRefs(pageData);

const isInvalid = computed(() => !noteValue.value.trim());

// 打开抽屉
const openDrawer = async id => {
  const header = document.querySelector('.schedule-drawer .el-drawer__header');
  if (header) {
    header.style.display = 'none';
  }
  drawerId.value = id;
  await getInfo();
  await getNotes();
  open.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  drawerId.value = null;
  info.value = {};
  noteList.value = [];
  materialList.value = [];
  noteValue.value = '';
};

// 获取详情
const getInfo = async () => {
  try {
    const res = await Api.mps.workinghoursreport.getPlanInfo({
      planId: drawerId.value,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      resData.trueMo = resData.trueMo.map(item => {
        item.completeTimeCount = proxy.secondToHour(item.completeTimeCount || 0);
        item.planTime = proxy.secondToHour(item.planTime || 0);
        return item;
      });
      info.value = resData;
      noteValue.value = `【${info.value?.processName}】  `;
    }
  } catch (error) {
    console.log(error);
  }
};

// 获取历史备注
const getNotes = async () => {
  try {
    const res = await Api.common.note.list({
      businessId: drawerId.value,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      noteList.value = resData.records.map(note => {
        note.notes = note.notes.replace(/\n/g, '<br>');
        return note;
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// 提交备注
const submitNote = async () => {
  if (!noteValue.value || isInvalid.value) return;
  noteLoading.value = true;
  try {
    const res = await Api.common.note.submit({
      businessId: drawerId.value,
      notes: noteValue.value,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      noteValue.value = `【${info.value?.processName}】  `;
      await getNotes();
    }
    noteLoading.value = false;
  } catch (error) {
    noteLoading.value = false;
  }
};

// 处理打开子项
const handleOpenChild = async () => {
  try {
    const header = document.querySelector('.schedule-drawer .el-drawer__header');
    if (header?.style?.display === 'block') return;
    const res = await Api.mps.workinghoursreport.getMaterialInfo({
      billNumber: info.value.billNumber,
    });
    const { code, data: resData } = res.data;
    if (code === 200) {
      materialList.value = resData;
    }
    if (header) {
      header.style.display = 'block';
    }
  } catch (error) {
    if (header) {
      header.style.display = 'none';
    }
  }
};

// 关闭子项
const closeChild = () => {
  const header = document.querySelector('.schedule-drawer .el-drawer__header');
  if (header) {
    header.style.display = 'none';
  }
};

const doAction = (action, data) => {
  switch (action) {
    case 'deleteNote':
      proxy
        .$confirm('是否确认删除参数编号为"' + data.id + '"的数据项？')
        .then(() => Api.common.note.remove({ ids: data.id }))
        .then(() => {
          getNotes();
          proxy.$message.success('删除成功');
        })
        .catch(() => {});

      break;
  }
};

defineExpose({
  openDrawer,
});
</script>
<style lang="scss">
.schedule-drawer {
  .el-drawer__header {
    display: none;
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: -710px;
    padding: 20px;
    width: 700px;
    background-color: #fff;
    .el-drawer__close-btn {
      display: none !important;
    }
    .child-wrap {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      .close-icon {
        position: absolute;
        right: 0;
        top: 0;
        cursor: pointer;
      }
      .table-container {
        flex: 1;
        overflow: hidden;
      }
    }
  }
  .el-drawer__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .info-wrap {
      display: flex;
      font-size: 16px;
      gap: 20px;
      .el-descriptions__table {
        tr {
          display: flex;
          .el-descriptions__content {
            flex: 1;
            .progress-box {
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              .percentage-value {
                font-size: 22px;
              }
            }
          }
        }
      }
    }
    .wrap {
      &-title {
        margin-bottom: 10px;
      }
      .remark-wrap {
        height: 100px;
        overflow: auto;
      }
      &-table {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        .table-container {
          flex: 1;
          overflow: hidden;
        }
      }
    }
  }
  .children-drawer {
    position: fixed;
    left: right;
    width: 620px;
    top: 20px;
    bottom: 20px;
    background: #ccc;
    z-index: 9999999;
  }
}
</style>
<style scoped lang="scss"></style>
