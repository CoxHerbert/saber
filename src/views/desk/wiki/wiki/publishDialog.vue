<template>
  <el-dialog class="dialog-ariticle-publish" title="发布设置" v-model="visible" width="600">
    <div class="content">
      <el-form
        ref="formRef"
        :model="formData"
        :label-suffix="':'"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="发布路径" prop="publishPath">
          <el-cascader v-model="formData.publishPath" :options="cascaderOptions" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="footer">
        <el-button type="primary" @click="doAction('submit')">确定</el-button>
        <el-button @click="doAction('cancel')">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import Api from '@/api';

export default {
  data() {
    return {
      rules: {
        publishPath: [
          {
            required: true,
            validator(rule, value, callback) {
              if (
                [null, undefined, ''].includes(value) ||
                (Array.isArray(value) && value?.[0].length === 0)
              ) {
                callback(new Error('发布路径不能为空'));
              } else {
                callback();
              }
            },
            //   message: '发布路径不能为空',
            trigger: ['blur', 'change'],
          },
        ],
      },
      cascaderOptions: [],
      formData: {},
      info: null,
      visible: false,
    };
  },
  //   mounted() {},
  methods: {
    show(info) {
      this.info = info;
      this.visible = true;
      this.loadOptions();
    },
    doAction(action) {
      if (action === 'submit') {
        this.$refs.formRef.validate(valid => {
          if (valid) {
            Api.desk.wiki
              .publishArticle({
                id: this.info.id,
                publishPath: this.formData.publishPath?.[0],
              })
              .then(res => {
                const { code, msg } = res.data;
                if (code === 200) {
                  this.$message.success(msg || '发布成功');
                  this.$emit('published');
                  this.close();
                }
              });
          }
        });
      } else if (action === 'cancel') {
        this.close();
      }
    },
    close() {
      this.formData = {};
      this.visible = false;
    },
    loadOptions() {
      let query = {
        path: '/ew-wiki',
        locale: 'zh',
      };

      Api.desk.wiki.getFolderTree(query).then(res => {
        const { code, data } = res.data;
        if (code == 200) {
          this.cascaderOptions = (data || [])
            .filter(d => d.isFolder)
            .map(d => {
              return {
                ...d,
                label: d.path,
                value: d.path,
              };
            });
        }
      });
    },
  },
};
</script>
<style lang="scss">
.dialog-ariticle-publish {
  .el-cascader {
    width: 100%;
  }

  .el-dialog__body {
    height: 100px;
    padding-top: 30px;
  }

  .footer {
    text-align: center;
  }
}
</style>
