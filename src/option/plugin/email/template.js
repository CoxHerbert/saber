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
  column: [
    {
      label: "模版类型",
      prop: "category",
      span: 24,
      search: true,
      type: "radio",
      dicUrl: "/api/blade-system/dict/dictionary?code=template_category",
      props: {
        label: "dictValue",
        value: "dictKey"
      },
      rules: [
        {
          required: true,
          message: "请选择模版类型",
          trigger: "blur"
        }
      ]
    },
    {
      label: "模版名称",
      prop: "name",
      span: 24,
      search: true,
      rules: [
        {
          required: true,
          message: "请输入模版名称",
          trigger: "blur"
        }
      ]
    },
    {
      label: "模版描述",
      prop: "remark",
      span: 24,
    },
    {
      label: "模版内容",
      prop: "content",
      type: 'textarea',
      hide: true,
      minRows: 6,
      span: 24,
      rules: [
        {
          required: true,
          message: "请输入模版内容",
          trigger: "blur"
        }
      ]
    }
  ]
}
