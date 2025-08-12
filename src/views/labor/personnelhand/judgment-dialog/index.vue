<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    @closed="handleClose"
    v-loading="loading"
  >
    <el-form :model="dataList">
      <el-table
        ref="tableRef"
        :data="dataList"
        border
        style="width: 100%"
        height="calc(80vh - 100px)"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="name" label="姓名" width="100" fixed></el-table-column>
        <el-table-column prop="deptId" label="*所属部门" width="180">
          <template #default="{ row }">
            <dc-select-dialog
              v-model="row.deptId"
              objectName="dept"
              returnType="string"
              type="input"
              @change="
                val => {
                  changeCustomerRlist(val, row, scoped);
                }
              "
              :params="{
                parentId: row.jobGradeDictCode == 7 ? '1906612083816628226' : '1890319987136700417',
              }"
            />
          </template>
        </el-table-column>
        <el-table-column prop="leaderId" label="*直属上级" width="200">
          <template #default="{ row }">
            <dc-select-user v-model="row.leaderId" placeholder="请选择" :multiple="true">
              <template #default="scoped">
                <span class="ceil-users" v-if="scoped.iptTagData?.length > 0">{{
                  scoped.iptTagData?.map(u => u.name)?.join(',')
                }}</span>
                <span v-else class="ceil-users"><span class="placeholder">请选择</span></span>
              </template>
            </dc-select-user>
          </template>
        </el-table-column>
        <el-table-column prop="joinedDate" label="*入职时间" width="200px">
          <template #header>
            <span>*入职时间</span>
            <el-popover
              v-if="selectRows.length > 0"
              :visible="batchVisible['joinedDate']"
              placement="bottom-end"
              :width="260"
              trigger="click"
            >
              <template #reference>
                <el-button type="" text="plain" @click="openBachPopover('joinedDate')">
                  操作已选 <el-icon> <ArrowDown /></el-icon
                ></el-button>
              </template>
              <div class="popover-list">
                <div>批量设置</div>
                <br />
                <el-form-item label="入职时间:">
                  <el-date-picker
                    v-model="batchForm['joinedDate']"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择入职时间"
                    style="width: 160px"
                  />
                </el-form-item>
                <div class="footer">
                  <el-button type="primary" @click.stop="submitPopover('joinedDate', '入职时间')"
                    >确定</el-button
                  ><el-button @click="batchVisible['joinedDate'] = false">取消</el-button>
                </div>
              </div>
            </el-popover>
            <el-button v-else type="" text="plain" @click="openBachPopover('joinedDate')">
              操作已选 <el-icon> <ArrowDown /></el-icon
            ></el-button>
          </template>
          <template #default="{ row }">
            <el-date-picker
              v-model="row.joinedDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择入职时间"
              style="width: 160px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="isAccommodation" label="*是否住宿" width="200px">
          <template #header>
            <span>*是否住宿</span>
            <el-popover
              v-if="selectRows.length > 0"
              :visible="batchVisible['isAccommodation']"
              placement="bottom-end"
              :width="null"
              trigger="click"
            >
              <template #reference>
                <el-button type="" text="plain" @click="openBachPopover('isAccommodation')">
                  操作已选 <el-icon> <ArrowDown /></el-icon
                ></el-button>
              </template>
              <div class="popover-list">
                <div>批量设置</div>
                <br />
                <el-form-item label="是否住宿:">
                  <el-select v-model="batchForm['isAccommodation']" placeholder="请选择">
                    <el-option value="是" label="是" />
                    <el-option value="否" label="否" />
                  </el-select>
                </el-form-item>
                <div class="footer">
                  <el-button
                    type="primary"
                    @click.stop="submitPopover('isAccommodation', '是否住宿')"
                    >确定</el-button
                  ><el-button @click="batchVisible['isAccommodation'] = false">取消</el-button>
                </div>
              </div>
            </el-popover>
            <el-button v-else type="" text="plain" @click="openBachPopover('isAccommodation')">
              操作已选 <el-icon> <ArrowDown /></el-icon
            ></el-button>
          </template>
          <template #default="{ row }">
            <el-select v-model="row.isAccommodation" placeholder="请选择是否住宿" clearable>
              <el-option value="是" label="是" />
              <el-option value="否" label="否" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="companyId" label="劳务公司" width="120">
          <template #default="{ row }">
            <el-select v-model="row.companyId" placeholder="请选择劳务公司" clearable disabled>
              <el-option
                v-for="(item, index) in companyList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="jobGradeDictCode" label="岗位" width="120">
          <template #default="{ row }">
            <el-select v-model="row.jobGradeDictCode" placeholder="请选择岗位" clearable disabled>
              <el-option
                v-for="(item, index) in dictMaps.DC_LABOR_POSITION || []"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="positionDictCode" label="岗位等级" width="120px">
          <template #default="{ row }">
            <el-select v-model="row.positionDictCode" placeholder="请选择等级" clearable disabled>
              <el-option
                v-for="(item, index) in grandList"
                :key="index"
                :value="item"
                :label="item"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { getLaborCompanyList } from '@/api/system/labor';
import Api from '@/api/index';
export default {
  name: 'JudgmentDialog',
  props: {
    mode: {
      type: String,
      default: 'BatchRecruitmentJudgment',
      validator: value => ['BatchRecruitmentJudgment'].includes(value),
    },
  },
  data() {
    return {
      loading: true,
      selectRows: [],
      batchVisible: {},
      batchForm: {},
      dictMaps: {},
      companyList: [],
      dialogVisible: false,
      dataList: [],
      grandList: ['大工', '中工', '小工'],
    };
  },
  watch: {
    batchVisible(val) {
      if (val) {
        this.batchForm = {};
      }
    },
  },
  computed: {
    dialogTitle() {
      return '批量入职';
    },
  },
  async mounted() {
    await this.getDict();
    await this.getLaborCompanyListFn();
    this.loading = false;
  },
  methods: {
    show(dataArray) {
      this.dataList = Array.isArray(dataArray)
        ? dataArray.map(item => ({
            ...item,
            // 初始化结论字段（如果不存在）
            joinedDate: this.$dayjs().format('YYYY-MM-DD'),
            isAccommodation: '是',
          }))
        : [];
      this.dialogVisible = true;
      setTimeout(() => {
        this.dataList.forEach(row => {
          this.$refs.tableRef.toggleRowSelection(row, true);
        });
      }, 100);
    },
    handleSelectionChange(val) {
      this.selectRows = val;
    },
    openBachPopover(key) {
      if (this.selectRows.length === 0) {
        this.$message.error('请先勾选要修改的行');
        return;
      }
      this.batchVisible[key] = true;
    },
    submitPopover(field, label) {
      if ([null, undefined, ''].includes(this.batchForm[field])) {
        this.$message.error(`请选择${label}`);
        return;
      }
      this.selectRows.forEach(row => (row[field] = this.batchForm[field]));
      this.batchVisible[field] = false;
    },
    changeCustomerRlist(val, row) {
      row.leaderId = val?.[0].deptLeaderId;
    },
    async getDict() {
      const res = await this.useAsyncCache([{ key: 'DC_LABOR_POSITION' }]);
      this.dictMaps = res;
    },

    getLaborCompanyListFn() {
      getLaborCompanyList({
        current: 1,
        size: 100000,
      }).then(res => {
        this.companyList = res.data.data.records.map(item => {
          return {
            value: item.id,
            label: item.name,
          };
        });
      });
    },

    handleSubmit() {
      const nullValue = [null, undefined, ''];
      const keys = ['deptId', 'leaderId', 'joinedDate', 'isAccommodation'];
      const isValid = this.dataList.every(row => {
        const find = keys.find(k => nullValue.includes(row[k]));
        return !find;
      });
      if (isValid) {
        this.loading = true;
        Api.labor.laborRegister
          .bulkOnboarding(
            this.dataList.map(row => {
              return {
                id: row.id,
                deptId: row.deptId,
                leaderId: row.leaderId,
                joinedDate: row.joinedDate,
                isAccommodation: row.isAccommodation,
              };
            })
          )
          .then(res => {
            this.loading = false;
            const { code, msg } = res?.data || {};
            if (code === 200) {
              this.$message.success(msg);
              this.$emit('submit', this.dataList);
              this.dialogVisible = false;
            } else {
              this.$message.error(msg);
            }
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.$message.error('请确保信息填写完整');
      }
    },

    handleClose() {
      this.dataList = [];
    },
  },
};
</script>
<style lang="scss" scoped>
.popover-list {
  width: 200px;

  .footer {
    text-align: center;
  }
}
:deep(.el-table .default) {
  width: 100%;
}
.ceil-users {
  border: 1px solid #dcdfe6;
  width: 100%;
  padding: 0 4px;
  display: inline-block;
  white-space: nowrap;
  word-wrap: break-all;
  overflow: hidden;
  height: 28px;
  border-radius: 2px;
  text-overflow: ellipsis;

  .placeholder {
    color: rgba(#333, 0.5);
  }
}
</style>
