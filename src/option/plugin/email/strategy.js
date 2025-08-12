export default {
  height: "auto",
  calcHeight: 30,
  tip: false,
  searchShow: true,
  searchMenuSpan: 6,
  border: true,
  index: true,
  viewBtn: true,
  selection: true,
  dialogWidth: 880,
  column: [
    {
      label: "策略Code",
      prop: "code",
      span: 24,
      rules: [
        {
          required: true,
          message: "请输入策略Code",
          trigger: "blur"
        }
      ]
    },    
    {
      label: "主题",
      prop: "subject",
      span: 24,
      search: true,
      rules: [
        {
          required: true,
          message: "请输入主题",
          trigger: "blur"
        }
      ]
    },
    {
      label: "发件人",
      prop: "platMailId",
      span: 24,
      type: "select",      
      labelTip: "发件人若为空，则默认使用平台配置中已启用配置项进行发送",
      dicData: [],
      props: {
        label: "name",
        value: "id"
      },
      rules: [
        {
          required: false,
          message: '请选择上级机构',
          trigger: 'click',
        },
      ],
      hide: true,
    },
    {
      label: "接收人",
      prop: "toId",
      span: 24,
      type: "select",      
      all: true,
      multiple: true,
      dicData: [],
      props: {
        label: "name",
        value: "id"
      },
      hide: true,
      rules: [{
        required: true,
        message: "请选择接收人",
        trigger: "click"
      }]
    },
    {
      label: "抄送人",
      prop: "ccId",
      span: 24,
      type: "select",      
      all: true,
      multiple: true,
      dicData: [],
      props: {
        label: "name",
        value: "id"
      },
      hide: true
    },    
    {
      label: "密送人",
      prop: "bccId",
      span: 24,
      type: "select",      
      all: true,
      multiple: true,
      dicData: [],
      props: {
        label: "name",
        value: "id"
      },
      hide: true
    },    
    {
      label: "模版",
      prop: "templateId",
      span: 24,
      type: "select",
      dicUrl: "/api/blade-email/template/select",
      props: {
        label: "name",
        value: "id"
      },
      rules: [
        {
          required: true,
          message: "请选择模版",
          trigger: "blur"
        }
      ]
    }
  ]
}
