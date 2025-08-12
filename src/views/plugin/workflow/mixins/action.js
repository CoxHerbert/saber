import Api from '@/api/';
export default {
  data() {
    return {
      btn: {
        download: ['wireBom', 'wireChange'],
        upload: ['wireBom', 'wireChange'],
      },
      drawingMatchType: {
        wireBom: {
          templateFile:
            'https://static.eastwinbip.com/static/%E7%BA%BF%E6%9D%90bom%E5%AF%BC%E5%85%A56.3.xlsx',
          api: Api.mps.wireBomItem.drawingMatch,
          paramsCallBack(data) {
            return {
              bomId: data.id,
            };
          },
        },
        wireChange: {
          templateFile:
            'https://static.eastwinbip.com/static/%E7%BA%BF%E6%9D%90BOM%E5%8F%98%E6%9B%B46.10.xlsx',
          api: Api.mps.wireChange.wireChange,
          paramsCallBack(data) {
            return {
              id: data.id,
            };
          },
        },
      },
    };
  },
  methods: {
    doAction(action, val) {
      if (action === 'download') {
        this.downloadFileBlob(
          this.drawingMatchType[this.process.formKey].templateFile,
          this.process.formKey
        );
        return;
      } else if (action === 'importData') {
        this.handleImportData(val);
      } else if (action === 'drawingMatch') {
        handleDrawingMatch();
      }
    },
    // 图纸匹配
    handleDrawingMatch() {
      switch (this.process.businessId) {
        case 'wireBom':
        case 'wireChange':
          this.$confirm(`确定进行图纸匹配吗？`, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              this.loading = true;
              const drawingMatch = this.drawingMatchType[this.process.businessId];
              return this.handleHttpPost({
                api: drawingMatch.api,
                data: drawingMatch.paramsCallBack(this.form),
              });
            })
            .then(res => {
              const { code } = res.data;
              if (code === 200) {
                this.$confirm('图纸匹配成功，确定是否提交？', {
                  confirmButtonText: '提交',
                  type: 'success',
                })
                  .then(() => this.handleExamine(true))
                  .catch(() => {});
              }
            })
            .catch(err => {
              this.loading = false;
            });
          return;
      }
    },
    handleImportData(file) {
      const formData = new FormData();
      formData.append('file', file.raw);
      switch (this.process.formKey) {
        case 'wireBom':
          this.loading = true;
          Api.mps.wireBomItem
            .upload(formData)
            .then(res => {
              const data = res.data.data.map(item => {
                Object.keys(item).forEach(key => {
                  if ([null, undefined].includes(item[key])) {
                    item[key] = '';
                  }
                });
                return item;
              });
              this.form.wireBomItem = [...data, ...this.form.wireBomItem];
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
            });
          return;
        case 'wireChange':
          this.loading = true;
          Api.mps.wireChange
            .upload(formData)
            .then(res => {
              const data = res.data.data.map(item => {
                Object.keys(item).forEach(key => {
                  if ([null, undefined].includes(item[key])) {
                    item[key] = '';
                  }
                });
                return item;
              });
              this.form.changeItem = [...data, ...this.form.changeItem];
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
            });
          return;
      }
    },
    handleHttpPost({ api, data }) {
      return api(data);
    },
  },
};
