import dayjs from 'dayjs';

export const dataJSON = [
  {
    groupName: '23',
    groupCode: '23',
    bars: [
      {
        id: 2,
        isDelete: 0,
        createUserId: 40,
        updateUserId: 252,
        projectNumber: '101',
        billNumber: '1232',
        processTime: 14400,
        dayProcessTime: 264,
        startDate: '2024-10-24',
        endDate: '2024-10-26',
        dailyWorkHour: 4800,
        colorCode: '#e5e5e5',
        ganttBarConfig: {
          hasHandles: true,
          id: '1232',
        },
      },
      {
        id: 5,
        isDelete: 0,
        createUserId: 678,
        updateUserId: 633,
        projectNumber: '101',
        billNumber: '1235',
        processTime: 14400,
        dayProcessTime: 867,
        startDate: '2024-10-26',
        endDate: '2024-10-28',
        dailyWorkHour: 3600,
        colorCode: '#111',
        ganttBarConfig: { hasHandles: true, id: '1235' },
      },
      {
        id: 6,
        isDelete: 0,
        createUserId: 190,
        updateUserId: 701,
        projectNumber: '101',
        billNumber: '1250',
        processTime: 7200,
        dayProcessTime: 548,
        startDate: '2024-10-28',
        endDate: '2024-11-05',
        dailyWorkHour: 2400,
        colorCode: '#222',
        ganttBarConfig: { hasHandles: true, id: '1250' },
      },
      {
        id: 9,
        isDelete: 0,
        createUserId: 190,
        updateUserId: 701,
        projectNumber: '101',
        billNumber: '1239',
        processTime: 10800,
        dayProcessTime: 548,
        startDate: '2024-11-02',
        endDate: '2024-11-04',
        dailyWorkHour: 2400,
        colorCode: '#333',
        ganttBarConfig: { hasHandles: true, id: '1239' },
      },
      {
        id: 10,
        isDelete: 0,
        createUserId: 190,
        updateUserId: 701,
        projectNumber: '101',
        billNumber: '1240',
        processTime: 7200,
        dayProcessTime: 548,
        startDate: '2024-11-05',
        endDate: '2024-11-08',
        dailyWorkHour: 2400,
        colorCode: '#444',
        ganttBarConfig: { hasHandles: true, id: '1240' },
      },
    ],
    standardWorkeHours: [],
  },
];
// 获取组的所有bar每日工时总和的集合
export const getDailyWorkHours = data => {
  const result = {};
  data.forEach(item => {
    const start = dayjs(item.startDate);
    const end = dayjs(item._endDate).subtract(1, 'day');

    for (let date = start; date.isBefore(end) || date.isSame(end); date = date.add(1, 'day')) {
      const dateStr = date.format('YYYY-MM-DD');

      // 累加对应日期的 dayWorkHour
      if (!result[dateStr]) {
        result[dateStr] = { dayTotalWorkHour: 0 };
      }
      result[dateStr].dayTotalWorkHour += item.dayWorkHour;
    }
  });
  return result;
};

// 初始化图表数据
export const initChartData = data => {
  const { dataList, format } = data;

  dataList.forEach(groupItem => {
    const { bars } = groupItem;
    bars.forEach(barItem => {
      barItem.startDate = dayjs(barItem.startDate).format(format);
      barItem.endDate = dayjs(barItem.endDate).format(format);
      barItem._endDate = dayjs(barItem.endDate).add(1, 'day').format('YYYY-MM-DD');
      // 处理视图显示少一天
      barItem._endDate = dayjs(barItem.endDate).add(1, 'day').format('YYYY-MM-DD');
      // 平均工时
      barItem.dayWorkHour = getBarDayWorkHour(barItem);
      barItem.processTime = secondToHour(barItem.processTime);
      barItem.totalDays = getTotalDays(barItem.startDate, barItem._endDate);

      barItem.ganttBarConfig = {
        hasHandles: true,
        id: barItem.id,
        style: {
          background: getColorByDate(barItem._endDate),
        },
        html: `<div class="bar-desc ellipsis">
        ${barItem.billNumber}
        ${barItem.materialName}
        ${barItem.processTime}H
        工期${barItem.totalDays}天
      </div>`,
      };
    });
    Object.keys(groupItem.standardWorkeHours).forEach(key => {
      groupItem.standardWorkeHours[key].workHour = secondToHour(
        groupItem.standardWorkeHours[key].workHour
      );
      groupItem.standardWorkeHours[key].materialHour = secondToHour(
        groupItem.standardWorkeHours[key].materialHour
      );
    });

    Object.keys(groupItem.standardWorkeHours).forEach(key => {
      let workItem = groupItem.standardWorkeHours[key];
      workItem.floatMaterialHour = workItem.materialHour;
      workItem.floatExtraCount = workItem.extraCount;
      groupItem.standardWorkeHours[dayjs(key).format('YYYY-MM-DD')] = workItem;
    });
    groupItem.maxIndex = assignRowIndexes(bars);
  });
};

// 获取条的颜色
export const getColorByDate = inputDate => {
  const today = dayjs().startOf('day');
  const input = dayjs(inputDate).startOf('day');

  const diffDays = input.diff(today, 'day');
  if (diffDays <= 0) {
    return '#E12137';
  } else if (diffDays <= 2) {
    return '#dd901d';
  } else {
    return '#23C69F';
  }
};

// 计算bar每日平均工时
export const getBarDayWorkHour = ({ startDate, _endDate, processTime }) => {
  const start = dayjs(startDate);
  const end = dayjs(_endDate);

  const days = end.diff(start, 'day');
  const dayWorkHour = processTime / days;
  return dayWorkHour;
};

// 计算区间天数
export const getTotalDays = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const daysDiff = end.diff(start, 'day');
  return daysDiff;
};

function isOverlap(bar1, bar2) {
  const start1 = dayjs(bar1.startDate);
  const end1 = dayjs(bar1._endDate);
  const start2 = dayjs(bar2.startDate);
  const end2 = dayjs(bar2._endDate);

  const overlaps =
    start1.isBefore(end2) && end1.isAfter(start2) && !(end1.isSame(start2) || start1.isSame(end2));
  const contains =
    (start1.isBefore(start2) && end1.isAfter(end2)) ||
    (start2.isBefore(start1) && end2.isAfter(end1));

  return overlaps || contains;
}

// 动态计算每条数据的行数（rowIndex）并更新数据
export function assignRowIndexes(bars) {
  const rows = [];
  bars.forEach(bar => {
    let rowIndex = 0;
    while (rowIndex < rows.length) {
      if (!rows[rowIndex].some(existingBar => isOverlap(bar, existingBar))) {
        rows[rowIndex].push(bar);
        break;
      }
      rowIndex++;
    }
    if (rowIndex === rows.length) {
      rows.push([bar]);
    }
    bar.rowIndex = rowIndex + 1;
  });
  return Math.max(...bars.map(bar => bar.rowIndex));
}

// 秒转小时
export const secondToHour = seconds => {
  return Math.ceil(seconds / 3600);
};
