<template>
  <basic-container>
    <div class="content-warp page-processing-outsourcing">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button icon="Plus" type="primary" style="margin-right: 16px" @click="doAction('add')"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          row-key="id"
          @select="handleSelect"
          @select-all="handleSelectAll"
          @selection-change="handleSelectionChange"
        >
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
              :align="col.align"
              :width="col.width"
              :min-width="col.minWidth"
            >
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <!-- 普通文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowText'"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{
                  [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
                }}
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :key="'dc-view' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col.showKey"
                />
              </template>
            </el-table-column>

            <el-table-column
              v-else-if="col.type === 'imageUrl'"
              :key="'imageUrl' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <el-image
                  :src="scoped.row[col.prop]"
                  style="width: 30px; height: 30px; border-radius: 50%"
                  preview-src-list="[scoped.row[col.prop]]"
                ></el-image>
              </template>
            </el-table-column>
            <!-- 字典类型 -->
            <el-table-column
              v-else-if="col.type === 'dict'"
              :key="'dict' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-dict-key
                  v-if="dictMaps[col.dictKey]"
                  type="text"
                  :options="dictMaps[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict-key>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="col.type === 'actions'"
              :key="'option' + i"
              :fixed="col.fixed"
              :label="col.label"
              :width="col.width ? col.width : 180"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
            >
              <template #default="scoped">
                <el-button
                  v-for="(btn, j) in col.children"
                  :key="j"
                  link
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                  type="primary"
                  @click="doAction(btn.action, scoped)"
                  >{{ btn.label }}</el-button
                >
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>

    <el-drawer v-model="dialogVisible" width="600px" :title="title" @close="cancel">
      <el-form :model="formData" ref="formRef" label-width="90px">
        <el-form-item label="设备ID" prop="equipmentId">
          <wf-select-dialog
            placeholder="请选择关联项目"
            v-model="formData.equipmentId"
            objectName="floorleaderdevice"
            type="input"
            returnType="object"
            :multiple="false"
            :multiple-limit="1"
            :initChangeable="true"
            :clearable="true"
            :query="{ enabled: true }"
            @change="handleLeaderDevice"
          />
        </el-form-item>
        <el-form-item label="负责人ID" prop="leaderUserId">
          <wf-select-dialog
            placeholder="请选择关联项目"
            v-model="formData.leaderUserId"
            objectName="user"
            type="input"
            returnType="object"
            :multiple="false"
            :multiple-limit="1"
            :initChangeable="true"
            :clearable="true"
            :query="{ enabled: true }"
            @change="handleLeaderUser"
          />
        </el-form-item>
        <!-- <el-form-item label="联系方式" prop="leaderUserPhone">
          <el-input v-model="formData.leaderUserPhone" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="leaderUserDept">
          <el-input v-model="formData.leaderUserDept" placeholder="请输入部门"></el-input>
        </el-form-item> -->
        <el-form-item label="负责人图片" prop="leaderImage">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :http-request="handleImageUpload"
            accept="image/*"
          >
            <img v-if="formData.leaderImage" :src="formData.leaderImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
export default {
  mixins: [listPage],
  name: 'solution-plan-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      formData: {
        id: '',
        currentNodeUserName: '',

        flowName: '',
        equipmentId: '',
        leaderUserId: '',
        leaderUserPhone: '',
        leaderUserDept: '',
        leaderImage: '',
      },
      dialogVisible: false,
      queryParams: {
        current: 1,
        size: 20,
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.floor.floorid
        .listFloorLeader(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    },
    handleLeaderUser(val) {
      console.log(val);
      this.formData.leaderUserId = val.id;
      this.formData.currentNodeUserName = val.name;
      this.formData.leaderUserPhone = val.phone;
      this.formData.leaderUserDept = val.deptName;
    },
    handleLeaderDevice(val) {
      console.log(val);
      this.formData.equipmentId = val.id;
      this.formData.flowName = val.smartboxBswz;
      //   this.formData.smartboxZpqyCode = val.smartboxZpqyCode;
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.entryId));
      } else if (action === 'delete') {
        this.deleteData(scope.row.id);
      } else if (action === 'edit') {
        this.dialogVisible = true;
        this.formData = row;
        console.log(row);
        this.formData.equipmentId = row.equipmentId.toString();

        console.log(this.formData);
      } else {
        this.dialogVisible = true;
        this.formData.id = '';
        this.formData.equipmentId = '';
        this.formData.leaderUserId = '';
        this.formData.leaderUserPhone = '';
        this.formData.currentNodeUserName = '';
        this.formData.leaderUserDept = '';
        this.formData.leaderImage = '';
      }
    },
    /** 处理删除 **/
    async deleteData(id) {
      try {
        await this.$messageBox.confirm('确定要删除这条记录吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        const res = await this.api.floor.floorid.deleteFloorLeader({ ids: id });
        if (res.data.code === 200) {
          this.$message.success('删除成功');
          this.getData();
        }
      } catch (error) {
        if (error.message !== 'cancel') {
          this.$message.error(`删除失败：${error.message || '网络错误'}`);
        }
      }
    },
    // 提交表单
    async submitForm() {
      try {
        if (this.formData.id) {
          // 编辑
          const res = await this.api.floor.floorid.submitFloorLeader(this.formData);
          if (res.data.code === 200) {
            this.$message.success('修改成功');
          }
        } else {
          // 新增
          const res = await this.api.floor.floorid.submitFloorLeader(this.formData);
          if (res.data.code === 200) {
            this.$message.success('新增成功');
          }
        }
        this.dialogVisible = false;
        this.getData();
      } catch (error) {
        this.$message.success('提交失败：');
      }
    },
    // 图片上传处理
    async handleImageUpload(params) {
      try {
        const imageUrl = await this.api.floor.upload.simpleUploadImage(params.file);
        this.formData.leaderImage = imageUrl;
        ElMessage.success('图片上传成功');
      } catch (error) {
        ElMessage.error(`图片上传失败：${error.message || '网络错误'}`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-processing-outsourcing {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
}
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 6px;
      padding-bottom: 0;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
</style>
