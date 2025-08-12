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
  column: [
    {
      label: "名称",
      prop: "name",   
      span: 24,
      width: 180,
      search: true,
      rules: [{
        required: true,
        message: "请输入名称",
        trigger: "blur"
      }]
    },
    {
      label: "描述",
      prop: "remark",              
      hide: true,
      span: 24,
      rules: [{
        required: false,
        message: "请输入描述",
        trigger: "blur"
      }]
    },
    {
      label: "成员邮箱",
      prop: "member",
      span: 24,
      row: true,
      search: true,
      slot: true,
      formslot: true,   
      overHidden: true,
      rules: [{
        required: true,
        message: "请输入成员邮箱",
        trigger: "blur"
      }]
    },
  ]
}
