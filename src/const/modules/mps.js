export default {
  // 排程状态编码  未排程,已排程,锁定
  schedulingStatus: [
    {
      label: '未排程',
      value: 0,
      textColor: '#E12137',
      bgColor: 'rgba(225, 33, 55, 0.10)',
    },
    {
      label: '已排程',
      value: 1,
      textColor: '#23C69F',
      bgColor: 'rgba(35, 198, 159, 0.10)',
    },
    {
      label: '暂停',
      value: 2,
      textColor: '#F2B046',
      bgColor: 'rgba(242, 176, 70, 0.10)',
    },
    {
      label: '已重排',
      value: 3,
      textColor: '#F2B046',
      bgColor: 'rgba(242, 176, 70, 0.10)',
    },


  ],
  // 领料状态 未领料,部分领料,全部领料
  materialReguisitionStatus: [
    {
      label: '未领料',
      value: 0,
      textColor: '#E12137',
      bgColor: 'rgba(225, 33, 55, 0.10)',
    },
    {
      label: '部分领料',
      value: 1,
      textColor: '#F2B046',
      bgColor: 'rgba(242, 176, 70, 0.10)',
    },
    {
      label: '全部领料',
      value: 2,
      textColor: '#23C69F',
      bgColor: 'rgba(35, 198, 159, 0.10)',
    },
  ],
  // 领料状态 未领料,部分领料,全部领料
  splitStatus: [
    {
      label: '待拆分',
      value: 0,
      textColor: '#E12137',
      bgColor: 'rgba(225, 33, 55, 0.10)',
    },
    {
      label: '部分拆分',
      value: 1,
      textColor: '#F2B046',
      bgColor: 'rgba(242, 176, 70, 0.10)',
    },
    {
      label: '全部拆分',
      value: 2,
      textColor: '#23C69F',
      bgColor: 'rgba(35, 198, 159, 0.10)',
    },
  ],
};
