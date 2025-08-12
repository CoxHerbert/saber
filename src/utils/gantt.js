import dayjs from 'dayjs';

export function calculateChildPositions(parent) {
  const parentStart = dayjs(parent.start_date);

  const updatedChildren = parent.children.map(child => {
    const startDate = dayjs(child.start_date);
    const endDate = dayjs(child.end_date);

    return {
      ...child,
      start_position: startDate.diff(parentStart, 'day'), // 计算偏移天数
      total_days: endDate.diff(startDate, 'day') + 1, // 计算总天数
    };
  });

  return {
    ...parent,
    children: updatedChildren,
  };
}

export function adjustRowIndex(data) {
  // 初始化 rowIndex
  let previousEndDate = null;
  let previousRowIndex = 0;

  return data.map((item, index) => {
    // 默认 rowIndex 为 0
    let currentRowIndex = 0;

    // 比较当前数据的时间区间与前一条数据的时间区间
    if (previousEndDate && dayjs(item.start_date).isBefore(dayjs(previousEndDate).add(1, 'day'))) {
      // 如果有重叠，则 rowIndex 加 1
      currentRowIndex = previousRowIndex + 1;
    }

    // 更新 previousEndDate 和 previousRowIndex
    previousEndDate = item.end_date;
    previousRowIndex = currentRowIndex;
    // 返回修改后的数据
    return {
      ...item,
      rowIndex: currentRowIndex,
    };
  });
}

export function calculateChildPositionsV2(parent) {
  const parentStart = dayjs(parent.start_date);

  const updatedChildren = parent.children.map(child => {
    const startDate = dayjs(child.start_date);
    const endDate = dayjs(child.end_date);

    return {
      ...child,
      start_position: startDate.diff(parentStart, 'day'), // 计算偏移天数
      total_days: endDate.diff(startDate, 'day') + 1, // 计算总天数
    };
  });

  return {
    ...parent,
    children: updatedChildren,
  };
}

export function adjustRowIndexV2(data) {
  return data.map((item, index) => {
    // 返回修改后的数据
    return {
      ...item,
      rowIndex: index,
    };
  });
}

// 颜色转换
export const hexToRgba = (hex, alpha = 1) => {
  if (typeof hex !== 'string' || !hex) return;
  // 去除 # 符号
  hex = hex.trim().replace(/^#/, '');

  // 处理短格式颜色（如 #000 转换为 #000000）
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  // 提取 RGB 分量
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
