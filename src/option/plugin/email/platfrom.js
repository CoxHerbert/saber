export default {
  height:'auto',
  calcHeight: 30,
  tip: false,
  searchShow: true,
  searchMenuSpan: 6,
  border: true,
  index: true,
  viewBtn: true,
  selection: true,
  dialogClickModal: false,  
  // labelWidth: 135,
  searchLabelWidth: 90,
  column: [            
    {
      label: "邮箱简称",
      prop: "name",
      search: true,
      rules: [{
        required: true,
        message: "请输入邮箱简称",
        trigger: "blur"
      }]
    },
    {
      label: "用户名",
      prop: "user",
      display: false
    },
    {
      label: "Smtp域名",
      prop: "host",
      display: false
    },
    {
      label: "是否启用",
      prop: "statusName",
      slot: true,
      display: false,
    },
    {
      label: "是否启用",
      type: "select",
      prop: "status",
      dataType: "number",
      dicUrl: "/api/blade-system/dict/dictionary?code=yes_no",
      props: {
        label: "dictValue",
        value: "dictKey"
      },
      search: true,
      display: false,
      hide: true,
      showColumn: false,
    },
  ],
  group: [
    {
      label: '基础信息',
      prop: 'detailInfo',
      icon: 'el-icon-user-solid',
      column: [
        {
          label: "发件人",
          prop: "from",
          search: true,
          tip: "发件人必须填写正确，否则导致发送失败",
          placeholder: "请输入 发件人，例如：1xxxxx@qq.com",
          rules: [{
            required: true,
            message: "请输入发件人",
            trigger: "blur"
          }]
        },
        {
          label: "用户名",
          prop: "user",
          search: true,
          tip: "发件人必须填写正确，否则导致发送失败",
          placeholder: "请输入 发件人，例如：1xxxxx@qq.com",
          rules: [{
            required: true,
            message: "请输入发件人",
            trigger: "blur"
          }]
        },
        {
          label: "密码",
          prop: "password",
          type: "password",
          hide: true,
          tip: "请注意，某些邮箱需要单独设置授权码，详情查看对应邮箱相关帮助",
          rules: [{
            required: true,
            message: "请输入密码",
            trigger: "blur"
          }]
        },        
      ]
    },
    {
      label: '发送配置',
      prop: 'detailInfo',
      icon: 'el-icon-s-order',
      column: [
        {
          label: "Smtp域名",
          prop: "host",
          tip: "发送邮件服务器",
          rules: [{
            required: true,
            message: "请输入SMTP域名",
            trigger: "blur"
          }]
        },
        {
          label: "开启SSL",
          prop: "enableSsl",              
          type: "select",
          dataType: "number",
          value: 1,
          dicUrl: "/api/blade-system/dict/dictionary?code=yes_no",
          props: {
            label: "dictValue",
            value: "dictKey"
          },
          rules: [{
            required: true,
            message: "请选择开启SSL",
            trigger: "blur"
          }]
        },
        {
          label: "端口",
          prop: "port",
          rules: [{
            required: true,
            message: "请输入邮箱端口",
            trigger: "blur"
          }]
        },
      ]
    },
  ]
};
