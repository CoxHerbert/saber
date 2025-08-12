import { computed } from 'vue';
import Const from '@/const/index';

export function usePermission() {
  const { proxy } = getCurrentInstance();

  // 获取用户信息
  const userInfo = computed(() => proxy.$store.getters.userInfo);

  // 创建角色映射
  const roleMaps = computed(() => {
    const maps = {};
    Const.roles.forEach(role => {
      maps[`${role.name}_${role.id}`] = role;
    });
    return maps;
  });

  // 判断用户是否拥有某个角色
  const isRole = roleNames => {
    try {
      // 检查 roleNames 是否是数组
      if (!Array.isArray(roleNames)) {
        throw new Error('roleNames should be an array');
      }

      // 获取对应的角色 ID 数组
      const roleIds = roleNames.map(roleName => {
        const role = roleMaps.value[roleName];
        if (!role) {
          throw new Error(`Role "${roleName}" not found`);
        }
        return role.id;
      });

      // 获取用户的角色 ID 并拆分为数组
      const roleId = userInfo.value.role_id.split(',');

      // 判断用户是否拥有任意一个角色
      const exists = roleId.some(role => roleIds.includes(role));
      return exists;
    } catch (error) {
      console.error('Error in isRole function:', error.message);
      return false;
    }
  };

  return {
    isRole,
  };
}
