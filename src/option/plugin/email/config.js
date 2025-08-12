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
      label: "发件人",
      prop: "from",
      search: true,
      display: false
    },
    {
      label: "协议",
      prop: "protocolTypeName",
      display: false,
      hide: true,
      showColumn: false,
    },
    {
      label: "协议",
      type: "select",            
      prop: "protocolType",
      dataType: "number",
      search: true,
      display: false,
      dicData: [
        {
          label: "POP3",
          value: 1
        },
        {
          label: "IMAP",
          value: 2
        },
      ],
    },
    {
      label: "Host域名",
      prop: "receiveHost",
      display: false
    },
    {
      label: "Smtp域名",
      prop: "smtpHost",
      display: false
    },
    {
      label: "同步状态",
      prop: "initStatusName",
      slot: true,
      display: false,
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
          tip: "用户名，默认为发件人邮箱前缀，必须填写正确，否则导致发送失败",
          placeholder: "请输入 用户名，例如：1xxxxx",
          rules: [{
            required: true,
            message: "请输入用户名",
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
      label: '接收配置',
      prop: 'baseInfo',
      icon: 'el-icon-s-order',
      column: [
        {
          label: "协议",
          type: "radio",            
          prop: "protocolType",
          dataType: "number",
          slot: true,
          value: 2,
          row: true,
          labelTip: 'POP3不支持判断邮件是否为已读',
          dicData: [
            {
              label: "POP3",
              value: 1
            },
            {
              label: "IMAP",
              value: 2
            },
          ],        
          rules: [{
            required: true,
            message: "请选择分类",
            trigger: "blur"
          }]
        },
        {
          label: "Host域名",
          prop: "receiveHost",
          tip: "邮件接收服务器域名",
          rules: [{
            required: true,
            message: "请输入域名Host",
            trigger: "blur"
          }]
        },
        {
          label: "开启SSL",
          prop: "receiveSsl",
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
          prop: "receivePort",
          rules: [{
            required: true,
            message: "请输入邮箱端口",
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
          prop: "smtpHost",
          tip: "发送邮件服务器",
          rules: [{
            required: true,
            message: "请输入SMTP域名",
            trigger: "blur"
          }]
        },
        {
          label: "开启SSL",
          prop: "smtpSsl",              
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
          prop: "smtpPort",
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
