export const bars = [
  {
    endDate: '2024-11-21 00:00:00',
    id: '1859073825667473410',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113684966932482',
  },
  {
    endDate: '2024-11-26 00:00:00',
    id: '1859073825667473411',
    duration: 0,
    order: '',
    parent: '1859073825604558849',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685231173634',
  },
  {
    endDate: '2024-11-21 00:00:00',
    id: '1859404587442921473',
    duration: 0,
    order: '',
    parent: '1859073825667473411',
    progress: 0.0,
    startDate: '2024-11-20 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685361197057',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859073825730387970',
    duration: 0,
    order: '',
    parent: '1859073825604558849',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685428305922',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921474',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685562523650',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921475',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685629632514',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921476',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685763850242',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921477',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685830959105',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921478',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113685960982529',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921479',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113686023897089',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921480',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113686153920514',
  },
  {
    endDate: '2024-11-28 00:00:00',
    id: '1859404587442921481',
    duration: 0,
    order: '',
    parent: '1859073825730387970',
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: '1859113686221029379',
  },
  {
    endDate: '2024-11-26 00:00:00',
    id: '1859073825604558849',
    duration: 0,
    order: '',
    parent: 0,
    progress: 0.0,
    startDate: '2024-11-19 00:00:00',
    text: 'YCF2408098',
    scheduleId: -1,
  },
];

export const generateData = () => {
  const startDate = new Date('2024-11-09');
  const endDate = new Date('2024-12-08');
  const result = {};

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
    result[dateStr] = {
      workDate: dateStr,
      workHour: 360000,
      workCount: Math.floor(Math.random() * 100), // 随机生成 0-99 的整数
      extraCount: Math.floor(Math.random() * 100),
    };

    // 日期递增
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

export const groupList = [
  {
    key: '1',
    label: '小组1',
    workHours: generateData(),
  },
  {
    key: '2',
    label: '小组2',
    workHours: generateData(),
  },
  {
    key: '3',
    label: '小组3',
    workHours: generateData(),
  },
];

export const groupList2 = [
  {
    key: '1',
    label: '小组1',
    workHours: generateData(),
  },
  {
    key: '2',
    label: '小组2',
    workHours: generateData(),
  },
  {
    key: '3',
    label: '小组3',
    workHours: generateData(),
  },
];
