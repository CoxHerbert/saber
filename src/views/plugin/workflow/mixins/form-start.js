import Api from '@/api/';
export default {
  data() {
    return {
      btn: {
        download: ['wireBom', 'wireChange'],
        upload: ['wireBom', 'wireChange'],
      },
      templateMaps: {
        wireBom:
          'https://static.eastwinbip.com/static/%E7%BA%BF%E6%9D%90bom%E5%AF%BC%E5%85%A56.3.xlsx',
        wireChange:
          'https://static.eastwinbip.com/static/%E7%BA%BF%E6%9D%90BOM%E5%8F%98%E6%9B%B46.10.xlsx',
      },
    };
  },
  methods: {
    doAction(action, val) {
      if (action === 'download') {
        this.downloadFileBlob(this.templateMaps[this.process.formKey], this.process.formKey);
      } else if (action === 'importData') {
        this.handleImportData(val);
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
  },
};
