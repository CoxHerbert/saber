export default {
  // MAP
  CUSTOMER_MAP_CACHE: { url: 'customer', type: 'map' },
  USER_MAP_CACHE: { url: 'bip-blade-user', type: 'map' },
  DEPT_MAP_CACHE: { url: 'bip-blade-dept', type: 'map' },
  CUSTOMER_CONTACTS_MAP_CACHE: { url: 'customer-contacts', type: 'map' },
  FOUNDRY_MAP_CACHE: { url: 'foundry', type: 'map' },
  ORG_MAP_CACHE: { url: 'org', type: 'map' },
  PROCESS_CORRELATION_MAP: {
    url: 'process-correlation',
    type: 'map',
  },
  PMS_FLIE_MANGER: { url: 'pms-file-manager', type: 'map' },
  OPPS_MAP_MANGER: { url: 'opps', type: 'map' },
  PROJECT_MAP_CACHE: { url: 'project', type: 'map' },
  PLAN_ITEM_MAP_CACHE: { url: 'plan-item', type: 'map' },
  CUSTOMER_RLIST_MAP_CACHE: { url: 'customer-rlist', type: 'map' },
  CRMCUSTOMERAREA_MAP_CACHE: { url: 'CrmCustomerArea', type: 'map' },

  // LIST

  SCMORG_LIST_CACHE: {
    url: 'ScmOrg',
    type: 'list',
    keys: {
      id: 'orgId',
      label: 'orgName',
      value: 'orgId',
    },
  },

  ORG_LIST_CACHE: {
    url: 'org',
    type: 'list',
    keys: {
      id: 'orgId',
      label: 'orgName',
      value: 'orgId',
    },
  },

  USER_LIST_CACHE: {
    url: 'bip-blade-user',
    type: 'list',
    keys: {
      id: 'id',
      label: 'name',
      value: 'id',
    },
  },
  CUSTOMER_LIST_CACHE: {
    url: 'customer',
    type: 'list',
    keys: {
      id: 'id',
      label: 'fullname',
      value: 'id',
    },
  },
  OPPS_LIST_CACHE: {
    url: 'opps',
    type: 'list',
    keys: {
      id: 'id',
      label: 'oppsName',
      value: 'id',
    },
  },
  DEPT_LIST_CACHE: {
    url: 'bip-blade-dept',
    type: 'list',
    keys: {
      id: 'id',
      label: 'deptName',
      value: 'id',
    },
  },
  PLAN_ITEM_LIST_CACHE: {
    url: 'plan-item',
    type: 'list',
    keys: {
      id: 'id',
      label: 'deptName',
      value: 'id',
    },
  },
};
