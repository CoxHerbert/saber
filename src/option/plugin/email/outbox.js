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
  selection: true,
  addTitle: "新建邮件",
  addBtnText: "新建邮件",
  saveBtnText: "发 送",
  dialogClickModal: false,
  column: [
    {
      label: "主题",
      prop: "subject",
      search: true,      
      span: 24,
      rules: [{
        required: true,
        message: "请输入主题",
        trigger: "blur"
      }]
    },
    {
      label: "收件人",
      prop: "toUser",
      span: 24,
      row: true,
      search: true,
      slot: true,
      formslot: true,
      overHidden: true,
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
      slot: true,
      formslot: true,
      overHidden: true,
    },
    {
      label: "密送人",
      prop: "bccUser",
      span: 24,
      row: true,
      slot: true,
      formslot: true,
      overHidden: true,
    },
    {
      label: "发送时间",
      prop: "createTime",      
      span: 24,
      addDisplay: false,
    },
    {
      label: "邮件内容",
      prop: "content",
      component: 'AvueUeditor',
      options: {
        action: '/api/blade-resource/oss/endpoint/put-file',
        props: {
          res: "data",
          url: "link",
        }
      },
      hide: true,
      minRows: 6,
      span: 24,
    },
    {
      label: "附件",
      prop: "attachInfo",
      type: 'upload',
      span: 24,
      //fileSize: 10,
      multiple: true,
      hide: true,
      propsHttp: {
        res: 'data',
        url: "value",
        name: 'label'
      },
      tip: '附件大小不超过10M',
      action: '/api/blade-resource/oss/endpoint/put-file',
      uploadPreview:(file,column,done)=>{
        downloadFileBase64(file.url, file.name);
      },
      uploadError(error, column) {
        this.$message.error(error)
      },
    },
  ]
};