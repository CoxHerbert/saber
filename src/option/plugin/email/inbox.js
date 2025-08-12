import { downloadFileBase64 } from "@/utils/util";

export default {
  height:'auto',
  calcHeight: 30,
  tip: false,
  searchShow: true,
  searchMenuSpan: 6,
  border: true,
  index: true,
  viewBtn: true,
  editBtn: false,
  addBtn: false,
  selection: true,
  dialogClickModal: false,
  column: [
    {
      label: "主题",
      prop: "subject",
      order: 1,
      search: true,
      rules: [{
        required: true,
        message: "请输入主题",
        trigger: "blur"
      }]
    },
    {
      label: "发件人",
      prop: "fromUser",
      span: 24,
      row: true,
      search: true,
    },
    {
      label: "收件人",
      prop: "toUser",
      span: 24,
      row: true,
      overHidden: true,
      dataType: "array",
      rules: [{
        required: true,
        message: "请输入收件人",
        trigger: "blur"
      }]
    },
    {
      label: "抄送人",
      prop: "ccUser",
      span: 24,
      row: true,
      hide: true,
      overHidden: true,
      dataType: "array",
      rules: [{
        required: true,
        message: "请输入抄送人",
        trigger: "blur"
      }]
    },
    {
      label: "收件时间",
      prop: "sendTime",
    },
    {
      label: "邮件内容",
      prop: "content",
      component: 'avue-ueditor',
      options: {
        action: '/api/blade-resource/oss/endpoint/put-file',
        props: {
          res: "data",
          url: "link",
        }
      },
      hide: true,
      minRows: 35,
      span: 24,
    },
    {
      label: "附件",
      prop: "attachInfo",
      type: 'upload',
      span: 24,
      hide: true,
      propsHttp: {
        res: 'data',
        url: "value",
        name: 'label'
      },
      uploadPreview:(file,column,done)=>{
        downloadFileBase64(file.url, file.name);
      },
      tip: '附件大小不超过50M',
    },
  ]
}