<template>
  <div class="app-container" v-loading="loading">
    <div class="header-wrapper" :class="!detailData ? 'nodata-height' : ''">
      <div class="title">
        <img
          src="../../../../../public/img/back.png"
          alt=""
          class="back-img"
          @click="$router.go(-1)"
        />编辑配置
      </div>

      <div class="operate-container">
        <div class="left">
          <el-button
            icon="el-icon-delete"
            plain
            @click="doAction('remove-left')"
            :disabled="multipleSelectionLeft.length == 0"
            >批量删除</el-button
          >
          <el-button icon="CirclePlus" @click="doAction('add-left')">新增检查项</el-button>
        </div>

        <div class="right">
          <el-button
            icon="el-icon-delete"
            plain
            @click="doAction('remove-right')"
            :disabled="multipleSelectionRight.length == 0"
            >批量删除</el-button
          >
          <el-button icon="CirclePlus" @click="doAction('add-right')">新增</el-button>
        </div>
      </div>
      <div class="noData-wrapper" v-if="!detailData">
        <img src="../../../../../public/img/frame@2x.png" alt="" class="img" />
        <p class="tip">暂无信息，请新增检查项</p>
      </div>
    </div>
    <div class="content-warp" v-if="detailData">
      <div class="table-container">
        <el-table
          height="100%"
          v-loading="loading"
          :data="detailData?.childrenList || []"
          @row-click="handleRowClick"
          :row-class-name="tableRowClassName"
          @selection-change="handleSelectionChangeLeft"
        >
          <el-table-column type="selection" width="45"> </el-table-column>
          <el-table-column label="维度名称" show-overflow-tooltip prop="checkListName">
            <template #default="scoped">
              <span
                class="tag"
                :style="{
                  backgroundColor: detailData.dimensionColor,
                }"
              >
                {{ detailData.dimensionName || '-' }}
              </span>
              {{ scoped.row.dimensionName }}</template
            >
          </el-table-column>
          <el-table-column
            label="所属问题组"
            show-overflow-tooltip
            prop="reviewTeam"
            width="100"
            align="center"
          >
            <template #default="scoped">
              <dc-dict
                v-if="dictMaps['DC_REVIEW_TEAM']"
                type="text"
                :options="dictMaps['DC_REVIEW_TEAM']"
                :value="scoped.row.reviewTeam"
              ></dc-dict>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="dimensionSort" width="60" align="center">
            <template #default="scoped">{{ scoped.row.dimensionSort }}</template>
          </el-table-column>

          <el-table-column label="操作" width="80" fixed="right" align="right">
            <template #default="scoped">
              <el-button
                icon="el-icon-edit"
                link
                type="primary"
                @click="doAction('edit-left', scoped)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="report-info-wrapper">
        <el-table
          height="100%"
          v-loading="loading"
          :data="detailData?.childrenList?.[rowIndexLeft]?.issues || []"
          @selection-change="handleSelectionChangeRight"
        >
          <el-table-column type="selection" width="45"> </el-table-column>
          <el-table-column
            label="评审问题"
            show-overflow-tooltip
            prop="reviewIssues"
            min-width="140"
          />
          <el-table-column
            label="参数/描述"
            show-overflow-tooltip
            prop="reviewDescribe"
            width="120"
            align="center"
          >
            <template #default="scoped">{{ scoped.row.reviewDescribe || '-' }}</template>
          </el-table-column>
          <el-table-column label="排序" prop="reviewSort" width="60" align="center">
            <template #default="scoped">{{ scoped.row.reviewSort || '-' }}</template>
          </el-table-column>
          <el-table-column label="是否生成任务单" prop="isTask" width="140" align="center">
            <template #default="scoped">{{ isTaskEnum[scoped.row.isTask] || '-' }} </template>
          </el-table-column>
          <el-table-column label="评审权重" prop="reviewWeight" width="120" align="center">
            <template #default="scoped">
              <dc-dict
                v-if="dictMaps['DC_REVIEW_WEIGHT']"
                type="text"
                :options="dictMaps['DC_REVIEW_WEIGHT']"
                :value="scoped.row.reviewWeight"
              ></dc-dict>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="80" fixed="right" align="right">
            <template #default="scoped">
              <el-button
                icon="el-icon-edit"
                link
                type="primary"
                @click="doAction('edit-right', scoped)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 左侧编辑弹窗 -->
    <el-dialog
      v-model="dialogLeft.open"
      :title="dialogLeft.title"
      @close="doAction('close')"
      v-loading="loading"
    >
      <el-form
        :model="dialogLeft.formData"
        ref="formRef"
        :rules="dialogLeft.rules"
        label-width="100px"
      >
        <el-form-item label="维度名称" prop="dimensionName">
          <el-input
            v-model="dialogLeft.formData.dimensionName"
            placeholder="请输入维度名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="所属问题组" prop="reviewTeam">
          <el-select
            v-model="dialogLeft.formData.reviewTeam"
            placeholder="请输入所属问题组"
            clearable
          >
            <el-option
              v-for="(dict, index) in dictMaps['DC_REVIEW_TEAM']"
              :label="dict.dictValue"
              :value="dict.id"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="dimensionSort">
          <el-input
            v-model="dialogLeft.formData.dimensionSort"
            placeholder="请输入排序"
            type="number"
            clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="doAction('submit-left')">提交</el-button>
        <el-button @click="doAction('close-left')">取消</el-button>
      </template>
    </el-dialog>
    <!-- 右侧编辑弹窗 -->
    <el-dialog
      v-model="dialogRight.open"
      :title="dialogRight.title"
      @close="doAction('close')"
      v-loading="loading"
    >
      <el-form
        :model="dialogRight.formData"
        ref="formRef"
        :rules="dialogRight.rules"
        label-width="120px"
      >
        <el-form-item label="维度名称" prop="reviewDimensionId">
          <el-select
            v-model="dialogRight.formData.reviewDimensionId"
            placeholder="请选择维度名称"
            clearable
          >
            <el-option
              v-for="(opt, index) in detailData?.childrenList || []"
              :label="opt.dimensionName"
              :value="opt.id"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评审问题" prop="reviewIssues">
          <el-input
            v-model="dialogRight.formData.reviewIssues"
            placeholder="请输入评审问题"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="评审权重" prop="reviewWeight">
          <el-select
            v-model="dialogRight.formData.reviewWeight"
            placeholder="请选择评审权重"
            clearable
          >
            <el-option
              v-for="(dict, index) in dictMaps['DC_REVIEW_WEIGHT']"
              :label="dict.dictValue"
              :value="dict.id"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参数/描述" prop="reviewDescribe">
          <el-input
            v-model="dialogRight.formData.reviewDescribe"
            placeholder="请输入参数/描述"
            clearable
          />
        </el-form-item>
        <el-form-item label="排序" prop="reviewSort">
          <el-input
            v-model="dialogRight.formData.reviewSort"
            placeholder="请输入排序"
            type="number"
            clearable
          />
        </el-form-item>
        <el-form-item label="是否生成任务单" prop="isTask">
          <el-switch
            v-model="dialogRight.formData.isTask"
            placeholder="请输入是否生成任务单"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="doAction('submit-right')">提交</el-button>
        <el-button @click="doAction('close-right')">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import Api from '@/api/index';
import dict from '@/mixins/dict';

export default {
  mixins: [dict],
  name: 'review-item-config-edit',
  data() {
    return {
      pageId: null,
      loading: true,
      detailData: {},
      rowIndexLeft: null,
      multipleSelectionLeft: [],
      multipleSelectionRight: [],
      formData: {},
      dialogLeft: {
        open: false,
        title: '新增',
        formData: {},
        rules: {
          dimensionName: [{ required: true, message: '维度名称为必填项', trigger: 'change' }],
          reviewTeam: [{ required: true, message: '所属问题组为必选项', trigger: 'change' }],
        },
      },
      dialogRight: {
        open: false,
        title: '新增',
        formData: {},
        rules: {
          reviewDimensionId: [{ required: true, message: '维度名称为必选项', trigger: 'change' }],
          reviewIssues: [{ required: true, message: '评审问题为必填项', trigger: 'change' }],
          reviewWeight: [{ required: true, message: '评审权重为必选项', trigger: 'change' }],
        },
      },
      isTaskEnum: {
        0: '否',
        1: '是',
      },
    };
  },
  created() {
    const { id, type } = this.$route.query;
    if (id) {
      this.pageId = id;
      this.show();
    }
    this.dictKeys = [{ key: 'DC_REVIEW_TEAM' }, { key: 'DC_REVIEW_WEIGHT' }];
    this.getDictData().then(() => {
      console.log(this.dictMaps, '---------');
    });
  },
  methods: {
    // 查询数据
    show() {
      this.loading = true;
      Api.pdp.projectSetting
        .getReviewDimension({
          reviewDimensionId: this.pageId,
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.detailData = data;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    /* 页面操作 */
    doAction(action, scope = {}) {
      const { row } = scope;
      console.log(action);

      if (action === 'add-left') {
        this.dialogLeft = {
          ...this.dialogLeft,
          open: true,
          title: '新增',
          formData: {
            parentId: this.pageId,
          },
        };
      } else if (action === 'edit-left') {
        this.dialogLeft = {
          ...this.dialogLeft,
          open: true,
          title: '编辑',
          formData: {
            ...row,
          },
        };
      } else if (action === 'submit-left') {
        this.handleSubmitLeft();
      } else if (action === 'close-left') {
        this.dialogLeft = {
          ...this.dialogLeft,
          open: false,
          title: '',
          formData: {},
        };
      } else if (action === 'edit-right') {
        this.dialogRight = {
          ...this.dialogRight,
          open: true,
          title: '编辑',
          formData: {
            ...row,
          },
        };
      } else if (action === 'remove-left') {
        const ids = this.multipleSelectionLeft.join(',');
        this.$confirm(`确定将选择${ids}数据删除?`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            return Api.pdp.projectSetting.removeReviewDimension({ ids });
          })
          .then(() => {
            this.rowIndexLeft = null;
            this.multipleSelectionRight = [];
            this.show();
            this.$message({
              type: 'success',
              message: '操作成功!',
            });
          });
      } else if (action === 'remove-right') {
        const ids = this.multipleSelectionRight.join(',');
        this.$confirm(`确定将选择${ids}数据删除?`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            return Api.pdp.projectSetting.removeIssues({ ids });
          })
          .then(() => {
            this.detailData.childrenList[rowIndexLeft].issues = this.detailData?.childrenList?.[
              rowIndexLeft
            ]?.issues.filter(item => !this.multipleSelectionRight.some(id => item.id === id));
            this.$message({
              type: 'success',
              message: '操作成功!',
            });
          });
      } else if (action === 'close-right') {
        this.dialogRight = {
          ...this.dialogRight,
          open: false,
          title: '',
          formData: {},
        };
      } else if (action === 'add-right') {
        this.dialogRight = {
          ...this.dialogRight,
          open: true,
          title: '新增',
          formData: {},
        };
      } else if (action === 'submit-right') {
        this.handleSubmitRight();
      }
    },
    handleSubmitLeft() {
      this.$refs.formRef.validate().then(valid => {
        if (valid) {
          this.loading = true;
          Api.pdp.projectSetting
            .submitReviewDimension(this.dialogLeft.formData)
            .then(res => {
              const { code } = res.data;
              if (code === 200) {
                this.$message.success('操作成功');
                this.show();
                this.doAction('close-left');
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              console.log(err);
            });
        }
      });
    },
    handleSubmitRight() {
      this.$refs.formRef.validate().then(valid => {
        if (valid) {
          this.loading = true;
          Api.pdp.projectSetting
            .submitReviewIssues(this.dialogRight.formData)
            .then(res => {
              const { code } = res.data;
              if (code === 200) {
                this.$message.success('操作成功');
                this.show();
                this.doAction('close-right');
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              console.log(err);
            });
        }
      });
    },
    getField(id, key) {
      return this.options.find(opt => opt.id === id)?.[key] || '-';
    },

    handleSelectionChangeLeft(val) {
      this.multipleSelectionLeft = Array.from(val, ({ id }) => id);
    },
    handleSelectionChangeRight(val) {
      this.multipleSelectionRight = Array.from(val, ({ id }) => id);
    },

    handleRowClick(row) {
      const findIndex = this.detailData?.childrenList.findIndex(item => item === row);
      this.rowIndexLeft = findIndex;
      this.multipleSelectionRight = [];
    },

    tableRowClassName({ rowIndex }) {
      return this.rowIndexLeft === rowIndex ? 'selected-row' : '';
    },
  },
};
</script>

<style scoped lang="scss">
.app-container {
  padding: 0;
}
:deep(.selected-row) {
  background: rgba(250, 111, 12, 0.05);
  box-shadow: inset 0px 0px 0px 0px #e5e5e5;
}

.imgsList :deep(.component-upload-image) {
  .el-upload--picture-card {
    width: 160px; /* 设置上传按钮的宽度 */
    height: 120px; /* 设置上传按钮的高度 */
    line-height: 120px; /* 设置上传按钮的行高 */
  }

  .el-upload-list--picture-card .el-upload-list__item {
    width: 160px; /* 设置图片项的宽度 */
    height: 120px; /* 设置图片项的高度 */
  }

  .el-upload--picture-card {
    display: none;
  }
}

.operate-container {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  .left,
  .right {
    display: flex;
  }
}
.content-warp {
  padding-top: 0px;
  display: flex;
  flex-direction: row;
  border-radius: 0px 0px 8px 8px;
  gap: 8px;

  .table-container {
    flex: 1;
    margin-bottom: 0px;
    border: 1px solid #e9e9e9;
    border-radius: 8px;
    overflow: auto;
    .tag {
      padding: 4px;
      border-radius: 6px;
    }
  }

  .report-info-wrapper {
    flex: 1;
    height: 100%;
    border-radius: 8px;
    border: 1px solid #e9e9e9;
    display: flex;
    background: #fff;
    flex-direction: column;
    box-sizing: border-box;
    overflow: auto;
    .scroll-content {
      padding-right: 10px;
    }
    .group-box {
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid #ccc;
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
  }
}

:deep(.el-table__inner-wrapper:before) {
  display: none;
}

.nodata-height {
  height: calc(100% - 20px) !important;
}

.header-wrapper {
  display: flex;
  padding: 0px 16px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  width: 100%;
  flex-direction: column;
  .title {
    display: flex;
    height: 58px;
    align-items: center;
    border-bottom: 1px solid #dadbe0;
    margin-bottom: 8px;
    .back-img {
      width: 22px;
      height: 22px;
      margin-right: 8px;
      cursor: pointer;
    }
  }
  .search-container {
    width: 100%;
    display: flex;
    gap: 20px;
    .el-form-item {
      width: 240px;
    }
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
}
.group-box-right-box {
  :deep(.dc-view),
  .right-title-uptate-time {
    font-size: 14px;
    font-weight: normal;
    color: #333;
    margin-right: 2px;
  }
}
.dialog-search-box {
  width: 600px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 50%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 120px);
    }
  }
}
</style>
