<template>
  <basic-container>
    <div class="quality-inspection-record-detail">
      <div class="header">
        <div class="title">
          <img
            src="../../../../public/img/back.png"
            alt=""
            class="back-img"
            @click="$router.go(-1)"
          />质检结果详情
        </div>
      </div>
      <div class="info-box">
        <div class="group-title">基本信息</div>
        <el-form
          v-if="dictMaps.DC_INSPECTION_CLASS?.length > 0"
          class="search-container"
          ref="ruleFormRef"
          label-suffix="："
          :model="formData"
        >
          <el-form-item class="form-itme-width" label="检验员" prop="createUser">
            <dc-view v-model="formData.createUser" objectName="user" />
          </el-form-item>
          <el-form-item class="form-itme-width" label="检验时间" prop="updateTime">
            <span>{{ formData.updateTime || '-' }}</span>
          </el-form-item>

          <el-form-item class="form-itme-width" label="检验类别" prop="category">
            <span>{{ formData.category || '-' }}</span>
          </el-form-item>
          <el-form-item class="form-itme-width" label="物料编码" prop="materialNumberCollection">
            <span>{{ formData.materialNumberCollection || '-' }}</span>
          </el-form-item>
          <el-form-item class="form-itme-width" label="物料名称" prop="materialNumberCollection">
            <dc-view v-model="formData.materialNumberCollection" objectName="SnCheckMaterial" />
          </el-form-item>
        </el-form>
      </div>
      <div class="group-title fix">检验信息</div>
      <div class="row-box">
        <div class="left">
          <div class="table-container">
            <el-table
              height="100%"
              v-loading="loading"
              :data="dataList"
              :show-header="false"
              @row-click="handleRowClick"
              :row-class-name="tableRowClassName"
            >
              <el-table-column label="序号" type="checkCategoryDict" width="150px">
                <template #default="scoped">
                  <div
                    class="tag"
                    :class="scoped.row.checkCategoryDict == '功能验证' ? 'green' : 'purple'"
                  >
                    {{ scoped.row.checkCategoryDict }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="名称" show-overflow-tooltip prop="inspectionItemName" />
            </el-table>
          </div>
        </div>
        <div class="right">
          <div class="info-wrapper">
            <el-scrollbar height="100%">
              <div class="right-content">
                <div class="group-box" v-if="selectedRow" :key="index">
                  <div class="group-box_header">
                    <div class="name">{{ selectedRow.inspectionItemName }}</div>
                    <div class="group-box-right-box">
                      <span class="right-title-uptate-time"
                        >由 &nbsp;<dc-view
                          v-model="selectedRow.updateUser"
                          objectName="user"
                        ></dc-view
                      ></span>
                      <span class="right-title-uptate-time"
                        >于&nbsp;{{ selectedRow.updateTime }} 更新&nbsp;</span
                      ><span class="version">版本 {{ selectedRow.version }}</span>
                    </div>
                    <!-- <div class="version">版本 {{ selectedRow.version }}</div> -->
                  </div>
                  <div class="report-title" v-if="selectedRow.exampleFileId">图片示例</div>
                  <div class="imgsList" v-if="selectedRow.exampleFileId">
                    <div class="inspection-media-item fix">
                      <el-image
                        class="inspection-media inspection-img"
                        style="width: 150px; height: 150px"
                        fit="cover"
                        :preview-src-list="[selectedRow.exampleFileId]"
                        :src="selectedRow.exampleFileId"
                        disabled
                      />
                      <span class="tag">image</span>
                      <el-icon class="media-icon"><Search /></el-icon>
                    </div>
                  </div>
                  <div class="report-title" v-if="hasImg">图片/视频</div>
                  <div class="imgsList" v-if="hasImg">
                    <div
                      v-for="(mediaItem, i) in imgList?.map(item => item.url) || []"
                      class="inspection-media-item"
                      :class="{
                        active: imgList?.[i]?.index === tableActiveIndex,
                      }"
                      @click="preViewFiles(i)"
                      :key="i"
                    >
                      <el-image
                        v-if="isImgSrc(mediaItem)"
                        style="width: 150px; height: 150px"
                        fit="cover"
                        class="inspection-media inspection-img"
                        :src="mediaItem"
                        disabled
                      />
                      <video v-else class="inspection-media inspection-video">
                        <source :src="mediaItem" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <span class="tag">{{ isImgSrc(mediaItem) ? 'image' : 'video' }}</span>
                      <el-icon class="media-icon"
                        ><Search v-if="isImgSrc(mediaItem)" /> <CaretRight v-else />
                      </el-icon>
                    </div>
                  </div>
                  <div class="report-title">检查项</div>
                  <el-table
                    v-loading="loading"
                    :data="selectedRow?.inspectionRecordEntryItemList"
                    class="select-table"
                    @row-click="handleRightRowClick"
                  >
                    <el-table-column label="序号" type="index" width="60px" align="center">
                      <template #default="scoped">
                        <span>{{ scoped.$index + 1 }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="检查项" prop="inspectionItem">
                      <template #default="scoped">{{ scoped.row.inspectionItem || '-' }}</template>
                    </el-table-column>
                    <el-table-column label="检测方法&标准" align="center" prop="method">
                      <template #default="scoped">{{ scoped.row.method || '-' }}</template>
                    </el-table-column>
                    <el-table-column
                      v-if="showExtColumn"
                      label="单位"
                      align="center"
                      prop="measureUnit"
                    >
                      <template #default="scoped">{{ scoped.row.measureUnit || '-' }}</template>
                    </el-table-column>
                    <el-table-column
                      v-if="showExtColumn"
                      label="标准值"
                      align="center"
                      prop="measureStand"
                    >
                      <template #default="scoped">{{ scoped.row.measureStand || '-' }}</template>
                    </el-table-column>
                    <el-table-column
                      v-if="showExtColumn"
                      label="上限值"
                      align="center"
                      prop="measureUpper"
                    >
                      <template #default="scoped">{{ scoped.row.measureUpper || '-' }}</template>
                    </el-table-column>
                    <el-table-column
                      v-if="showExtColumn"
                      label="下限值"
                      align="center"
                      prop="measureLower"
                    >
                      <template #default="scoped">{{ scoped.row.measureLower || '-' }}</template>
                    </el-table-column>
                    <el-table-column
                      label="检测结果"
                      align="center"
                      :min-width="showExtColumn ? 140 : 80"
                      prop="inspectorResult"
                    >
                      <template #default="scoped"
                        ><span
                          class="inspector-result"
                          :class="{
                            pass: scoped.row.inspectorResult === '通过',
                            reject: scoped.row.inspectorResult === '不通过',
                          }"
                          >{{ scoped.row.inspectorResult || '-' }}</span
                        >
                        <el-button
                          v-if="showExtColumn"
                          @click="showQcDialog(scoped.row?.inspectionRecordEntryItemDataList || [])"
                          style="margin-left: 8px"
                          type="text"
                          >查看</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>

                  <div class="report-title" v-if="selectedRow.remark">备注信息</div>
                  <div class="report-info" v-if="selectedRow.remark">
                    {{ selectedRow.remark }}
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="qcResultDialogProps.visible" width="80%" :title="qcResultDialogProps.title">
      <div class="qc-dialog-content">
        <el-table
          :data="qcResultDialogProps.data"
          :border="true"
          :style="{ height: 'calc(70vh - 60px)' }"
        >
          <el-table-column min-width="55px">
            <template #default="scoped">{{ scoped.$index + 1 }}</template>
          </el-table-column>
          <el-table-column
            v-for="(col, i) in qcResultDialogProps.columns"
            :label="col.label"
            :prop="col.prop"
            :key="i"
            :align="'center'"
            :min-width="col.minWidth"
          >
            <template #default="scoped">
              <dc-view
                v-if="col.type === 'dc-view'"
                v-model="scoped.row[col.prop]"
                :objectName="col.objectName"
              />
              <span
                v-else
                :class="{
                  'inspector-result': col.prop === 'result',
                  pass: scoped.row.result === '通过',
                  reject: scoped.row.result === '不通过',
                }"
                >{{ scoped.row[col.prop] || '-' }}</span
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="footer">
          <el-button @click="qcResultDialogProps.visible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
    <dc-midia-viewer
      v-if="previewState.isShow"
      :z-index="1000"
      :initial-index="previewState.index"
      :url-list="previewState.srcList"
      :hide-on-click-modal="true"
      @close="closeViewer"
    ></dc-midia-viewer>
  </basic-container>
</template>

<script setup>
import { onBeforeMount, reactive, getCurrentInstance, computed } from 'vue';
import { useRoute } from 'vue-router';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const route = useRoute();
const pageData = reactive({
  queryParams: {
    id: '',
  },
  selectedRow: [],
  formData: {},
  mode: 2,
  dictMaps: {},
  loading: false,
  dataList: [],

  previewState: {
    index: 0,
    srcList: [],
  },

  qcResultDialogProps: {
    visible: false,
    title: '检测结果记录',
    columns: [
      {
        label: '检测值',
        prop: 'measureDiff',
      },

      {
        label: '标准值',
        prop: 'measureStand',
      },
      {
        label: '上限值',
        prop: 'measureUpper',
      },
      {
        label: '下限值',
        prop: 'measureLower',
      },
      {
        label: '单位',
        prop: 'measureUnit',
      },
      {
        label: '检测人员',
        type: 'dc-view',
        objectName: 'user',
        prop: 'updateUser',
      },
      {
        label: '检测结果',
        prop: 'result',
      },
    ],
    dataList: [],
  },
});

const {
  queryParams,
  loading,
  dataList,
  dictMaps,
  mode,
  formData,
  selectedRow,
  previewState,
  qcResultDialogProps,
} = toRefs(pageData);

const showQcDialog = data => {
  qcResultDialogProps.value.data = data;
  qcResultDialogProps.value.visible = true;
};

// 目前判断的比较简单，不是mp4的都认为是图片
const isImgSrc = srcLink => {
  return !/\.mp4$/.test(srcLink);
};

// 检验物料
const changeMaterial = e => {
  if (e.length > 0) {
    formData.value.materialNameCollection = e.map(item => item.fname).join(',');
    formData.value.materialNumberCollection = e.map(item => item.fnumber).join(',');
  } else {
    formData.value.materialNameCollection = e.fname;
    formData.value.materialNameCollection = e.fnumber;
  }
};

const hasImg = computed(() => {
  return imgList.value && imgList.value?.length > 0;
});

const imgList = computed(() => {
  const result = selectedRow.value?.inspectionRecordEntryItemList?.reduce((rec, item, index) => {
    if (item.inspectorFileId) {
      rec.push(
        ...item.inspectorFileId?.split(',')?.map(url => {
          return {
            url,
            index,
          };
        })
      );
    }
    return rec;
  }, []);
  return result; // selectedRow.value?.inspectorFileId?.split(',');
});

// 多选
const handleRowClick = val => {
  selectedRow.value = val;
  qcResultDialogProps.value.data = [];
  tableActiveIndex.value = -1;
};

const tableRowClassName = ({ row }) => {
  if (selectedRow.value && selectedRow.value === row) {
    return 'selected-row';
  }
  return '';
};

const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.qms.sip.getInspectionRecordOrderDetail(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    formData.value.materialNumberCollection = data.materialNum;
    formData.value.createUser = data.createUser;
    formData.value.updateTime = data.updateTime;
    formData.value.category = data.category;
    dataList.value = data.inspectionRecordEntryList.filter(item => item) || [];
    if (dataList.value.length > 0) {
      selectedRow.value = dataList.value[0];
    }
  }
  loading.value = false;
};

const getDict = async () => {
  try {
    const res = await proxy.useAsyncCache([{ key: 'DC_INSPECTION_CLASS' }]);
    dictMaps.value = res.value;
  } catch (error) {
    console.error('获取枚举失败', error);
  }
};

const preViewFiles = index => {
  previewState.value.index = index;
  previewState.value.srcList = imgList.value?.map(item => item.url) || [];
  previewState.value.isShow = true;
};

const tableActiveIndex = ref(-1);

const handleRightRowClick = data => {
  const index = selectedRow.value?.inspectionRecordEntryItemList.findIndex(row => row === data);
  tableActiveIndex.value = index;
};

const showExtColumn = computed(() => {
  return (
    selectedRow.value?.inspectionRecordEntryItemList?.findIndex(row =>
      ['重复精度', '形位公差'].includes(row.method)
    ) > -1
  );
});

const closeViewer = () => {
  previewState.value.isShow = false;
};

onBeforeMount(async () => {
  queryParams.value.id = route.query.id;
  await getDict();
  // await getDetail();
  getData();
});
</script>

<style lang="scss" scoped>
.quality-inspection-record-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;

  .search-container {
    padding: 16px;
  }

  .group-title {
    font-size: 14px;
    line-height: 14px;
    font-weight: bold;
    color: #333;
    padding-left: 4px;
    border-left: 3px solid #f78431;
    &.fix {
      margin-bottom: 16px;
    }
  }

  .header {
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 12px;
    border-bottom: 1px solid #e5e5e5;
    margin-bottom: 20px;
    .title {
      width: 140px;
      font-size: 16px;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      color: #333;
      height: 30px;
      font-weight: 500;
      padding-bottom: 10px;
      .back-img {
        width: 22px;
        height: 22px;
        margin-right: 8px;
        cursor: pointer;
      }
    }
    .search-area {
      flex: 1;
    }
  }

  .info-box {
    width: 100%;
    height: auto;
    :deep(.el-form-item) {
      width: 50%;
      display: inline-flex;
      margin-bottom: 0;

      .el-form-item__content {
        width: calc(100% - 120px);
      }
    }
  }
  .row-box {
    flex: 1;
    box-sizing: border-box;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    .left,
    .right {
      position: relative;
      border: 1px solid #e9e9e9;
      border-radius: 8px;
      height: 100%;
      width: calc(50% - 5px);
    }
    .left {
      margin-right: 10px;
      .table-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
    .tag {
      display: flex;
      padding: 4px 12px;
      box-sizing: border-box;
      height: 22px;
      align-items: center;
      background: #168be8;
      border-radius: 4px 4px 4px 4px;
      font-size: 14px;
      color: #ffffff;
      justify-content: center;
      align-items: center;
    }
    .green {
      background-color: #11afa7;
    }
    .purple {
      background-color: #994fe1;
    }
    .right {
      .info-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
  }

  .group-box {
    font-size: 18px;
    font-weight: 600;
    &_header {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .version {
      color: rgb(29, 87, 29);
      font-size: 14px;
    }
  }

  .imgsList {
    display: flex;
    align-items: center;
    margin: 10px 0px;
    flex-wrap: wrap;
    .img-item {
      width: 30%;
      height: 100px;
      margin-right: 5%;
      margin-bottom: 10px;
      &:nth-of-type(3n) {
        margin-right: 0px !important;
      }
    }
  }
  .report-title {
    font-weight: bold;
    font-size: 14px;
    color: #333333;
  }
  .report-info {
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
  .select-table {
    margin: 16px 0px 24px;
  }

  :deep(.el-table__inner-wrapper:before) {
    display: none;
  }

  .nodata-height {
    height: calc(100% - 20px) !important;
  }

  .noData-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .img {
      width: 320px;
      height: 320px;
    }
    .tip {
      font-size: 24px;
      color: #848488;
    }
  }
  :deep(.el-descriptions__label) {
    display: inline-block;
    width: 90px;
    text-align: right;
  }

  :deep(.el-descriptions__cell) {
    margin-bottom: 18px !important;
  }
  .search-result {
    padding: 10px 0px 0px;
    box-sizing: border-box;
    border: 1px dashed #606266;
  }

  .inspection-media-item {
    position: relative;
    width: 150px;
    height: 150px;
    margin-right: 10px;
    margin-bottom: 10px;
    display: inline-block;
    overflow: hidden;
    box-sizing: border-box;
    &.active {
      border: 2px solid red;
    }

    .media-icon {
      position: absolute;
      display: none;
      width: 20px;
      height: 20px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 4;
      color: #fff;
    }
    .tag {
      pointer-events: none;
      display: inline-block;
      width: auto;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 5;
      margin: 0;
      padding: 0;
      border-radius: 0;
      font-size: 12px;
      padding: 0 24px;
      height: 38px;
      line-height: 48px;
      transform: rotate(45deg) translate(18px, -24px);
    }
    &:hover {
      .media-icon {
        display: block;
        pointer-events: none;
      }
      &::before {
        pointer-events: none;
        content: ' ';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 3;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }

  .inspection-media {
    width: 150px;
    height: 150px;
    border: 1px solid #eaeaeb;
    object-fit: fill;
    position: relative;
  }

  .container-wrapper {
    overflow: hidden;
    height: calc(100% - 40px);
  }
  .content-warp-list {
    width: 100%;
    height: 100%;
  }
  .right {
    :deep(.dc-view),
    .right-title-uptate-time {
      font-size: 14px;
      font-weight: normal;
      color: #333;
      margin-right: 2px;
    }
  }

  .right-content {
    padding: 16px;
  }
}
.qc-dialog-content {
  height: 70vh;
  overflow: hidden;

  .footer {
    margin-top: 8px;
    padding: 10px;
    text-align: center;
  }
}

.inspector-result {
  &.pass {
    color: green;
  }
  &.reject {
    color: red;
  }
}
</style>
