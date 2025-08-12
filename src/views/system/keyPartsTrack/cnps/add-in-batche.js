const options = () => {
  return {
    columns: [
      {
        type: 'edit',
        width: 60,
        align: 'center',
      },
      {
        prop: 'createSize',
        label: '创建数量',
        type: 'input',
        align: 'center',
        required: true,
        props: {
          type: 'number',
        },
      },
      {
        prop: 'sourceNo',
        label: '关键项',
        type: 'dict',
        align: 'center',
        dictKey: 'DC_SIP_CHECK_ITEM',
        required: true,
        props: {
          type: 'select',
        },
      },
    ],
  };
};

export default options;
