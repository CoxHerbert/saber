import Api from '@/api/index';

const options = isUpdate => {
  if (!!isUpdate) {
    return {
      columns: [
        {
          name: '基本信息',
          classList: 'form-basic-group',
          renderType: 'form',
          showToggleExpand: true,
          prop: 'basic',
          items: [
            {
              prop: 'projectId',
              type: 'wf-select-dialog',
              label: '项目',
              required: true,
              props: {
                objectName: 'pdpProject',
                placeholder: '请点击选择项目',
                disabled: true,
              },
            },
            {
              prop: 'materialId',
              type: 'wf-select-dialog',
              label: '所属物料',
              props: {
                type: 'input',
                objectName: 'scmMaterial',
                placeholder: '请点击选择所属物料',
                query: {
                  orgId: '100006',
                },
                disabled: true,
              },
            },
            {
              prop: 'projectNumber',
              type: 'remote-select',
              label: '专案号',
              props: {
                dataCallback() {
                  return res => {
                    return res.data.data.records;
                  };
                },
                action: Api.erp.feign.list,
                labelKey: 'billNo',
                valueKey: 'billNo',
                disabled: true,
              },
            },
            {
              prop: 'fileTypeCode',
              label: '文件类型',
              type: 'el-cascader',
              dictKey: 'DC_PDP_PROJECT_FILE',
              required: true,
              props: {
                style: {
                  width: '100%',
                },
                props: {
                  value: 'dictKey',
                  label: 'dictValue',
                  emitPath: false,
                },
                clearable: true,
                disabled: true,
              },
            },
            {
              prop: 'materialVersionCode',
              label: '物料版本',
              type: 'input',
              props: {
                placeholder: '物料版本需填从A-Z',
                disabled: true,
              },
            },
            {
              prop: 'roleIds',
              label: '共享给',
              type: 'input',
              type: 'el-tree-select',
              dictKey: 'ROLES',
              labelKey: 'roleName',
              valueKey: 'id',
              props: {
                placeholder: '请选择需要共享的角色',
                multiple: true,
                checkOnClickNode: true,
                nodeKey: 'id',
                props: {
                  value: 'id',
                  label: 'roleName',
                },
                clearable: true,
              },
            },
            {
              prop: 'file',
              label: '附件',
              type: 'upload',
              required: true,
              props: {
                limit: 1,
                style: 'width: 100%',
              },
            },
            {
              prop: 'options',
              slot: '',
              type: 'actions',
              fixed: 'right',
              children: [
                {
                  type: 'button',
                  label: '升版',
                  action: 'submitData',
                  props: {
                    type: 'primary',
                  },
                },
                {
                  type: 'button',
                  label: '重置',
                  action: 'resetData',
                },
              ],
            },
          ],
        },
        {
          name: '明细信息',
          classList: 'form-detail-group',
          renderType: 'table',
          showToggleExpand: false,
          prop: 'tableList',
          items: [
            {
              type: 'selection',
              fixed: 'left',
              width: '55',
            },
            {
              type: 'index',
              prod: 'dataIndex',
              fixed: 'left',
              width: '55',
            },
            {
              prop: 'attachIds',
              minWidth: '90px',
              type: 'file',
              label: '文件格式',
            },
            {
              prop: 'attachIds',
              minWidth: '160px',
              type: 'file-name',
              label: '文件名称',
            },
            {
              prop: 'versionCode',
              minWidth: '120px',
              type: 'common',
              is: 'el-input',
              label: '文件版本',
              props: {
                disabled: true,
                placeholder: '',
              },
            },
            {
              prop: 'fileTypeCode',
              label: '文件类型',
              minWidth: '160px',
              type: 'el-cascader',
              dictKey: 'DC_PDP_PROJECT_FILE',
              labelKey: 'dictValue',
              valueKey: 'dictKey',
              required: true,
              props: {
                clearable: true,
                disabled: true,
                props: {
                  value: 'dictKey',
                  label: 'dictValue',
                  emitPath: false,
                },
              },
            },
            {
              prop: 'projectNumber',
              minWidth: '120px',
              type: 'common',
              is: 'el-input',
              label: '专案号',
              props: {
                disabled: true,
                placeholder: '',
              },
            },
            {
              prop: 'projectCode',
              minWidth: '120px',
              type: 'common',
              is: 'el-input',
              label: '项目编码',
              props: {
                disabled: true,
                placeholder: '',
              },
            },
            {
              prop: 'materialCode',
              minWidth: '160px',
              type: 'common',
              is: 'el-input',
              props: {
                disabled: true,
                placeholder: '',
              },
              label: '物料编码',
            },
            {
              prop: 'materialName',
              minWidth: '160px',
              type: 'common',
              is: 'el-input',
              props: {
                disabled: true,
                placeholder: '',
              },
              label: '物料名称',
            },
            {
              prop: 'roleIds',
              label: '共享给',
              type: 'input',
              type: 'el-tree-select',
              dictKey: 'ROLES',
              labelKey: 'roleName',
              valueKey: 'id',
              props: {
                placeholder: '请选择需要共享的角色',
                multiple: true,
                checkOnClickNode: true,
                nodeKey: 'id',
                props: {
                  value: 'id',
                  label: 'roleName',
                },
                clearable: true,
                disabled: true,
              },
            },
            {
              prop: 'options',
              width: 140,
              label: '操作',
              slot: '',
              type: 'actions',
              fixed: 'right',
              children: [
                {
                  type: 'button',
                  label: '编辑',
                  action: 'edit',
                },
                {
                  type: 'button',
                  label: '升版',
                  action: 'updatedVersion',
                },
              ],
            },
          ],
        },
      ],
    };
  }
  return {
    columns: [
      {
        name: '基本信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: true,
        prop: 'basic',
        items: [
          {
            prop: 'projectId',
            type: 'dc-select-dialog-v2',
            label: '项目',
            required: true,
            props: {
              type: 'input',
              objectName: 'pdpProject',
              placeholder: '请点击选择项目',
              multiple: false,
              'multiple-limit': 1,
            },
          },
          {
            prop: 'materialId',
            type: 'dc-select-dialog',
            label: '所属物料',
            props: {
              type: 'input',
              objectName: 'scmMaterial',
              placeholder: '请点击选择所属物料',
              multiple: false,
              'multiple-limit': 1,
              params: {
                orgId: '100006',
              },
            },
          },
          {
            prop: 'projectNumber',
            type: 'remote-select',
            label: '专案号',
            props: {
              dataCallback() {
                return res => {
                  return res.data.data.records;
                };
              },
              action: Api.erp.feign.list,
              labelKey: 'billNo',
              valueKey: 'billNo',
            },
          },
          {
            prop: 'fileTypeCode',
            label: '文件类型',
            type: 'el-cascader',
            dictKey: 'DC_PDP_PROJECT_FILE',
            required: true,
            props: {
              clearable: true,
              style: {
                width: '100%',
              },
              props: {
                value: 'dictKey',
                label: 'dictValue',
                emitPath: false,
              },
            },
          },
          {
            prop: 'materialVersionCode',
            label: '物料版本',
            type: 'input',
            props: {
              placeholder: '物料版本需填从A-Z',
            },
          },
          {
            prop: 'roleIds',
            label: '共享给',
            type: 'el-tree-select',
            dictKey: 'ROLES',
            labelKey: 'roleName',
            valueKey: 'id',

            props: {
              placeholder: '请选择需要共享的角色',
              multiple: true,
              checkOnClickNode: true,
              nodeKey: 'id',
              props: {
                value: 'id',
                label: 'roleName',
              },
              clearable: true,
            },
          },
          {
            prop: 'file',
            label: '附件',
            type: 'upload',
            required: true,
            props: {
              limit: 1,
              style: 'width: 100%',
            },
          },
          {
            prop: 'options',
            slot: '',
            type: 'actions',
            fixed: 'right',
            children: [
              {
                type: 'button',
                label: '确认提交',
                action: 'submitData',
                props: {
                  type: 'primary',
                },
              },
              {
                type: 'button',
                label: '重置',
                action: 'resetData',
                props: {},
              },
            ],
          },
        ],
      },
      {
        name: '明细信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'tableList',
        items: [
          {
            type: 'selection',
            fixed: 'left',
            width: '55',
          },
          {
            type: 'index',
            prod: 'dataIndex',
            fixed: 'left',
            width: '55',
          },
          {
            prop: 'attachIds',
            minWidth: '90px',
            type: 'file',
            label: '文件格式',
          },
          {
            prop: 'attachIds',
            minWidth: '160px',
            type: 'file-name',
            label: '文件名称',
          },
          {
            prop: 'versionCode',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '文件版本',
            props: {
              disabled: true,
              placeholder: '',
            },
          },
          {
            prop: 'fileTypeCode',
            label: '文件类型',
            minWidth: '160px',
            type: 'el-cascader',
            dictKey: 'DC_PDP_PROJECT_FILE',
            labelKey: 'dictValue',
            valueKey: 'dictKey',
            required: true,
            props: {
              disabled: true,
              props: {
                value: 'dictKey',
                label: 'dictValue',
                emitPath: false,
              },
              clearable: true,
            },
          },
          {
            prop: 'projectNumber',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '专案号',
            props: {
              disabled: true,
              placeholder: '',
            },
          },
          {
            prop: 'projectCode',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '项目编码',
            props: {
              disabled: true,
              placeholder: '',
            },
          },
          {
            prop: 'materialCode',
            minWidth: '160px',
            type: 'common',
            is: 'el-input',
            props: {
              disabled: true,
              placeholder: '',
            },
            label: '物料编码',
          },

          {
            prop: 'materialName',
            minWidth: '160px',
            type: 'common',
            is: 'el-input',
            props: {
              disabled: true,
              placeholder: '',
            },
            label: '物料名称',
          },
          {
            prop: 'roleIds',
            label: '共享给',
            type: 'input',
            type: 'el-tree-select',
            dictKey: 'ROLES',
            labelKey: 'roleName',
            valueKey: 'id',
            minWidth: '160px',
            props: {
              placeholder: '请选择需要共享的角色',
              multiple: true,
              checkOnClickNode: true,
              nodeKey: 'id',
              props: {
                value: 'id',
                label: 'roleName',
              },
              clearable: true,
              disabled: true,
            },
          },
          {
            prop: 'options',
            width: 140,
            label: '操作',
            slot: '',
            type: 'actions',
            fixed: 'right',
            children: [
              {
                type: 'button',
                label: '编辑',
                action: 'edit',
              },
              {
                type: 'button',
                label: '升版',
                action: 'updatedVersion',
              },
            ],
          },
        ],
      },
    ],
  };
};
export default options;
