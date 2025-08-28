export default {
  data() {
    return {
      customFields: [
        {
          title: '通用配置',
          key: 'common',
          list: [
            {
              title: '选择器',
              list: [
                {
                  label: '单选多字段弹窗',
                  component: 'wf-select-single',
                  prop: 'a170668042091155472',
                },
                {
                  label: '单选多选弹窗',
                  component: 'wf-select-dialog',
                  prop: 'a170668042091155479',
                },
              ],
            },
            {
              title: '数据操作',
              list: [
                {
                  label: '导出',
                  component: 'wf-export-button', // 关联到导入导出组件
                  span: 2,
                  display: true,
                },
                {
                  label: '导入',
                  component: 'wf-import-button', // 关联到导入导出组件
                  span: 2,
                  display: true,
                },
              ],
            },
            {
              title: 'BladeX字典',
              list: [
                {
                  type: 'radio',
                  label: '单选框组',
                  icon: 'icon-radio',
                  tooltip: '请自行填写字典网址的code值',
                  dicData: [],
                  dicUrl: '/blade-system/dict/dictionary?code=',
                  props: {
                    label: 'dictValue',
                    value: 'dictKey',
                  },
                  dicOption: 'remote',
                  span: 24,
                  display: true,
                },
                {
                  type: 'checkbox',
                  label: '多选框组',
                  icon: 'icon-checkbox',
                  tooltip: '请自行填写字典网址的code值',
                  dicData: [],
                  dicUrl: '/blade-system/dict/dictionary?code=',
                  props: {
                    label: 'dictValue',
                    value: 'dictKey',
                  },
                  dicOption: 'remote',
                  span: 24,
                  display: true,
                },
                {
                  type: 'select',
                  label: '下拉选择器',
                  icon: 'icon-select',
                  tooltip: '请自行填写字典网址的code值',
                  dicData: [],
                  dicUrl: '/blade-system/dict/dictionary?code=',
                  props: {
                    label: 'dictValue',
                    value: 'dictKey',
                  },
                  dicOption: 'remote',
                  span: 24,
                  display: true,
                  cascader: [],
                },
              ],
            },
            {
              title: 'BladeX上传',
              list: [
                {
                  label: '操作',
                  component: 'wf-upload',
                  action: '/blade-resource/oss/endpoint/put-file',
                  display: true,
                  span: 24,
                  icon: 'icon-upload',
                  showFileList: true,
                  multiple: true,
                  limit: 10,
                  prop: 'a170668042091155472',
                  listType: 'picture-img',
                },
                {
                  label: '上传',
                  type: 'upload',
                  propsHttp: {
                    res: 'data',
                    url: 'link',
                    name: 'originalName',
                  },
                  action: '/blade-resource/oss/endpoint/put-file',
                  display: true,
                  span: 24,
                  icon: 'icon-upload',
                  showFileList: true,
                  multiple: true,
                  limit: 10,
                  headersConfig: [],
                  dataConfig: [],
                },
                {
                  type: 'ueditor',
                  label: '富文本',
                  icon: 'icon-richtext',
                  span: 24,
                  display: true,
                  options: {
                    action: '/blade-resource/oss/endpoint/put-file',
                    props: {
                      res: 'data',
                      url: 'link',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          title: '模板',
          key: 'template',
          type: 'template',
          span: 24,
          list: [
            {
              title: '省市区字段联动',
              icon: 'el-icon-link',
              column: [
                {
                  label: '省',
                  prop: 'province',
                  type: 'select',
                  span: 24,
                  dicUrl: '/blade-system/region/lazy-tree?parentCode=00',
                  props: {
                    label: 'title',
                    value: 'id',
                  },
                  cascader: ['city', 'area'],
                },
                {
                  label: '市',
                  prop: 'city',
                  type: 'select',
                  span: 24,
                  dicUrl: '/blade-system/region/lazy-tree?parentCode={{province}}',
                  props: {
                    label: 'title',
                    value: 'id',
                  },
                  cascader: ['area'],
                },
                {
                  label: '区',
                  prop: 'area',
                  type: 'select',
                  span: 24,
                  dicUrl: '/blade-system/region/lazy-tree?parentCode={{city}}',
                  props: {
                    label: 'title',
                    value: 'id',
                  },
                },
              ],
            },
            {
              label: '字段显隐/值改变联动',
              icon: 'el-icon-connection',
              column: [
                {
                  type: 'switch',
                  label: '控制显隐',
                  span: 24,
                  display: true,
                  value: '0',
                  dicData: [
                    {
                      label: '',
                      value: '0',
                    },
                    {
                      label: '',
                      value: '1',
                    },
                  ],
                  change: ({ value }) => {
                    const input = this.findObject(this.option.column, 'input1');
                    if (value == 0) {
                      input.display = false;
                    } else {
                      input.display = true;
                    }
                  },
                },
                {
                  type: 'input',
                  label: '单行文本',
                  span: 24,
                  display: true,
                  prop: 'input1',
                },
                {
                  type: 'select',
                  label: '值改变',
                  dicData: [
                    {
                      label: '一天',
                      value: '1',
                    },
                    {
                      label: '两天',
                      value: '2',
                    },
                    {
                      label: '三天',
                      value: '3',
                    },
                  ],
                  span: 24,
                  display: true,
                  props: {
                    label: 'label',
                    value: 'value',
                  },
                  change: ({ value }) => {
                    let text = value;
                    if (value) {
                      text = '请假 ' + value + ' 天';
                    }
                    this.form.input2 = text;
                  },
                },
                {
                  type: 'input',
                  label: '单行文本',
                  span: 24,
                  display: true,
                  prop: 'input2',
                },
              ],
            },
            {
              label: '值改变动态改变字典',
              icon: 'el-icon-switch',
              column: [
                {
                  label: '输入1, 下面的字典会变',
                  span: 24,
                  labelWidth: 200,
                  change: ({ value }) => {
                    if (value == '1') {
                      const radio = this.findObject(this.option.column, 'radio');
                      // 赋值静态字典
                      // radio.dicData = [
                      //   {
                      //     dictValue: '选项1',
                      //     dictKey: 1
                      //   },
                      //   {
                      //     dictValue: '选项2',
                      //     dictKey: 2
                      //   }
                      // ]

                      // 若是赋值dicUrl远程字典可用以下方法更新字典
                      radio.dicUrl = '/blade-system/dict/dictionary?code=notice';
                      // 更新全部字典
                      // this.$refs.form.init(true)

                      // 更新某一字段字典
                      this.$refs.form.initDict('radio');
                    }
                  },
                },
                {
                  label: '字典',
                  type: 'radio',
                  prop: 'radio',
                  span: 24,
                  dicData: [],
                  dicUrl: '/blade-system/dict/dictionary?code=sex',
                  props: {
                    label: 'dictValue',
                    value: 'dictKey',
                  },
                },
              ],
            },
            {
              title: 'Select选择请求接口回填数据',
              icon: 'el-icon-paperclip',
              column: [
                {
                  label: '员工',
                  type: 'select',
                  display: true,
                  span: 24,
                  props: {
                    label: 'realName',
                    value: 'id',
                  },
                  dicUrl: '/blade-system/search/user',
                  dicFormatter: res => {
                    return res.data.data.records;
                  },
                  filterable: true,
                  change: ({ value }) => {
                    if (value) {
                      this.$axios({
                        method: 'get',
                        url: `/blade-workflow/process/user/detail?id=${value}`,
                      }).then(res => {
                        const { phone, email } = res.data.data;
                        this.form.phone = phone;
                        this.form.email = email;
                      });
                    }
                  },
                },
                {
                  label: '手机',
                  prop: 'phone',
                  readonly: true,
                },
                {
                  label: '邮箱',
                  prop: 'email',
                  readonly: true,
                },
              ],
            },
            {
              label: '员工简历示例模板',
              icon: 'el-icon-user',
              column: [
                {
                  type: 'table',
                  label: '表格',
                  showLabel: false,
                  span: 24,
                  display: true,
                  labelWidth: '0px',
                  rows: [
                    {
                      cols: [
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '姓名',
                              prop: 'a170668032833631069',
                            },
                          ],
                          prop: 'a170668036447243552',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                            width: '80px',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '姓名',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'name',
                              required: true,
                              rules: [
                                {
                                  required: true,
                                  message: '姓名必须填写',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '年龄',
                              prop: 'a17066803308326418',
                            },
                          ],
                          prop: 'a170668086450117399',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                            width: '80px',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'number',
                              label: '年龄',
                              icon: 'icon-number',
                              controls: false,
                              span: 24,
                              display: true,
                              prop: 'age',
                            },
                          ],
                        },
                        {
                          column: [
                            {
                              label: '上传',
                              type: 'upload',
                              propsHttp: {
                                res: 'data',
                                url: 'link',
                                name: 'originalName',
                              },
                              action: '/blade-resource/oss/endpoint/put-file',
                              display: true,
                              span: 24,
                              icon: 'icon-upload',
                              showFileList: true,
                              multiple: true,
                              limit: 10,
                              prop: 'a170668042091155472',
                              listType: 'picture-img',
                            },
                          ],
                          colspan: 1,
                          rowspan: 3,
                          prop: 'a170668037193737753',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                      ],
                    },
                    {
                      cols: [
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '民族',
                              prop: 'a17066803295582304',
                            },
                          ],
                          prop: 'a170668090247982808',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '民族',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'nation',
                            },
                          ],
                        },
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '邮箱',
                              prop: 'a170668033227939843',
                            },
                          ],
                          prop: 'a170668090518365872',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '邮箱',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'email',
                            },
                          ],
                        },
                        {
                          column: [],
                          colspan: 1,
                          rowspan: 0,
                        },
                      ],
                    },
                    {
                      cols: [
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '手机',
                              prop: 'a170668048131073666',
                            },
                          ],
                          prop: 'a170668090987068341',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '手机',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'tel',
                            },
                          ],
                        },
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '住址',
                              prop: 'a170668069926050371',
                            },
                          ],
                          prop: 'a170668090736385286',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '住址',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'address',
                            },
                          ],
                        },
                        {
                          column: [],
                          colspan: 1,
                          rowspan: 0,
                        },
                      ],
                    },
                    {
                      cols: [
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '学历',
                              prop: 'a170668074885080754',
                            },
                          ],
                          prop: 'a170668072716370803',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '学历',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'education',
                            },
                          ],
                        },
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '身份证',
                              prop: 'a170668080643030504',
                            },
                          ],
                          prop: 'a170668091496941858',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'input',
                              label: '身份证',
                              icon: 'icon-input',
                              span: 24,
                              display: true,
                              prop: 'idcard',
                            },
                          ],
                          prop: 'a170668081066887817',
                          type: 'td',
                          colspan: 2,
                        },
                        {
                          column: [],
                          colspan: 0,
                          rowspan: 1,
                        },
                      ],
                    },
                    {
                      cols: [
                        {
                          column: [
                            {
                              type: 'title',
                              icon: 'icon-text',
                              span: 24,
                              display: true,
                              label: '文本',
                              labelWidth: '0px',
                              textValue: '工作经历',
                              prop: 'a170668084378093992',
                            },
                          ],
                          colspan: 1,
                          rowspan: 1,
                          prop: 'a170668082706171950',
                          type: 'td',
                          style: {
                            textAlign: 'center',
                          },
                        },
                        {
                          column: [
                            {
                              type: 'dynamic',
                              label: '子表单',
                              span: 24,
                              display: true,
                              labelPosition: 'top',
                              children: {
                                align: 'center',
                                headerAlign: 'center',
                                index: false,
                                addBtn: true,
                                delBtn: true,
                                column: [
                                  {
                                    type: 'input',
                                    label: '公司',
                                    span: 24,
                                    display: true,
                                    prop: 'a170668092508815265',
                                  },
                                  {
                                    type: 'daterange',
                                    label: '日期',
                                    span: 24,
                                    display: true,
                                    format: 'YYYY-MM-DD',
                                    valueFormat: 'YYYY-MM-DD',
                                    prop: 'a170668097144777856',
                                  },
                                  {
                                    type: 'input',
                                    label: '职位',
                                    span: 24,
                                    display: true,
                                    prop: 'a17066809260611908',
                                  },
                                  {
                                    type: 'input',
                                    label: '简介',
                                    span: 24,
                                    display: true,
                                    prop: 'a170668092713134154',
                                  },
                                ],
                              },
                              prop: 'a170668092343562155',
                              required: false,
                            },
                          ],
                          colspan: 4,
                          rowspan: 1,
                          prop: 'a170668083516176220',
                          type: 'td',
                        },
                        {
                          column: [],
                          colspan: 0,
                          rowspan: 1,
                        },
                        {
                          column: [],
                          colspan: 0,
                          rowspan: 1,
                        },
                        {
                          column: [],
                          colspan: 0,
                          rowspan: 1,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  },
};
