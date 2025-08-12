<template>
  <div
    class="floor-container"
    :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
  >
    <div class="content">
      <div class="floorTit">
        <wf-select-dialog
          placeholder="请选择关联项目"
          objectName="floorleaderdevice"
          type="input"
          returnType="object"
          :multiple="false"
          :multiple-limit="1"
          :initChangeable="true"
          :clearable="true"
          :useSlot="true"
          :query="{
            enabled: true,
          }"
          @change="hanleLeaderDevice"
        >
          <template #default>
            <div class="floorLogo">
              <el-image style="width: 88px; height: 88px" :src="logo"></el-image>
              <div class="floorText">
                {{ floorLeader.smartboxBswz }}（{{ floorLeader.smartboxZpqyCode || '选择楼层' }}）
              </div>
            </div>
          </template>
        </wf-select-dialog>

        <div class="floorLogo">
          <div style="width: 250px">
            <div class="floorTime">{{ currentTime }}</div>
            <div class="floorDate">{{ currentDate }} {{ currentWeekday }}</div>
          </div>
          <div style="width: 200px">
            <div class="floorDate">{{ userDetail.weather || '-' }}</div>
            <div class="floorDate">
              {{ userDetail.adressName || '-' }} {{ userDetail.temperature || '-' }}°C
            </div>
          </div>
          <div style="width: 100px">
            <img class="weather-img" :src="localUrl" alt="" :onerror="loadImgError" srcset="" />
            <!-- <el-image style="width: 88px; height: 88px" :src="logo"></el-image> -->
          </div>
        </div>
      </div>

      <div class="floorCarouel">
        <ImageCarousel :carouselData="apiSlides" :interval="5000" />
      </div>

      <div class="floor-footerBg">
        <span style="color: #666">每日励志名言:</span>
        <span style="color: #333; margin-left: 4px">
          {{ randomSentenceValue }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ImageCarousel from './components/ImageCarousel.vue';
import { useResponsiveResize } from './hooks/useResponsiveResize';
import logo from './image/logo.png';
import dayjs from 'dayjs';
import Api from '@/api/index';
import 'dayjs/locale/zh-cn'; // 确保导入中文语言包
import { useRoute } from 'vue-router';
const apiSlides = ref([]);
const route = useRoute();

const getApi = async () => {
  try {
    let params = {
      equipmentId: route.query.equipmentId || 1,
    };
    const res = await Api.floor.floorid.getfloorleader(params);
    const { code, data } = res.data;
    if (code == 200) {
      // 将接口返回数据转换为productSlides格式，最多3个元素
      if (data && data.length > 0) {
        const chunks = [];
        for (let i = 0; i < data.length; i += 3) {
          chunks.push(data.slice(i, i + 3));
        }
        apiSlides.value = chunks.map((chunk, chunkIndex) => ({
          key: `slide${chunkIndex + 1}`,
          images: chunk.map((item, index) => ({
            leaderImage: item.leaderImage,
            currentNodeUserName: item.currentNodeUserName,
            leaderUserPhone: item.leaderUserPhone || '',
            leaderUserDept: item.leaderUserDept || '',
          })),
        }));
      } else {
        ElMessage.error(error.message);
      }
    }
  } catch (error) {
    ElMessage.error(error.message);
  }
};

// 天气
const compData = reactive({
  loading: false,
  userDetail: {},
  sentence: '',
  weatherImg: null,
  localUrl: '',
});
const { loading, userDetail, sentence, weatherImg, localUrl } = toRefs(compData);
const getData = params => {
  loading.value = true;
  Api.desk.home
    .getWeather(params)
    .then(res => {
      const { status, data } = res;
      console.log(data);

      if (status === 200) {
        userDetail.value = data;
        weatherImg.value = `https://static.eastwinbip.com/static/weather/${userDetail.value?.weatherCode}.svg`;
        localUrl.value = `/img/weather_pic/${
          /^[dn]/.test(userDetail.value?.weatherCode || '') ? '' : 'n'
        }${userDetail.value?.weatherCode}.png`;
      }
      loading.value = false;
    })
    .catch(err => {
      console.error(err);
      loading.value = false;
    });
};
const getLocal = () => {
  const params = { lng: '113.83', lat: '23.02' };
  getData(params);
};

dayjs.locale('zh-cn'); // 全局设置中文环境
// 时间相关响应式变量
const currentTime = ref('');
const currentDate = ref('');
const currentWeekday = ref('');

// 更新时间函数（使用dayjs）
const updateTime = () => {
  const now = dayjs();
  // 格式化时间 HH:MM:SS
  currentTime.value = now.format('HH:mm:ss');
  // 格式化日期 YYYY-MM-DD
  currentDate.value = now.format('YYYY-MM-DD');
  // 获取星期几（中文）
  currentWeekday.value = now.format('dddd');
};
// 使用响应式缩放 Hook
const { scale } = useResponsiveResize(1920, 1080);
console.log(scale.value);
// 初始化
const randomSentenceValue = ref('');
const init = async () => {
  if (localStorage.getItem('floorLeader')) {
    floorLeader.value = JSON.parse(localStorage.getItem('floorLeader'));
    getApi();
  } else {
    apiSlides.value = productSlides;
  }

  const res = await Api.floor.floorid.randomSentence();
  const { code, data } = res.data;
  if (code === 200) {
    randomSentenceValue.value = data;
  }
};
// 组件挂载时初始化并监听窗口变化
onMounted(() => {
  updateTime(); // 立即执行一次
  const timer = setInterval(updateTime, 1000); // 每秒更新一次
  // 添加每30分钟刷新数据的定时器 (30分钟 = 30 * 60 * 1000 = 1800000毫秒)

  // 保存定时器ID以便卸载时清除
  // 保存定时器ID以便卸载时清除
  window.timeUpdateTimer = timer;
  getLocal();
  init();
  getApi();
});

// 组件卸载时移除监听
onUnmounted(() => {
  clearInterval(window.timeUpdateTimer);
});

// //  选择楼层
// const dialogFormVisible = ref(false);
// const radio1 = ref('F1');
const floorLeader = ref({});

const hanleLeaderDevice = value => {
  if (value) {
    floorLeader.value = value;
    localStorage.setItem('floorLeader', JSON.stringify(value)); // 永久缓存 floorLeader 数据
    apiSlides.value = [];
    getApi();
  }
};
// const ConfirmData = () => {
//   floorNum.value = radio1.value;
//   dialogFormVisible.value = false;
// };
const productSlides = [
  {
    key: 'slide1',
    images: [
      {
        leaderImage: 'https://picsum.photos/400/300?random=1',
        currentNodeUserName: '海洋',
        leaderUserPhone: '13945678910',
        leaderUserDept: '开发部',
      },
      {
        leaderImage: 'https://picsum.photos/400/300?random=2',
        currentNodeUserName: '海洋',
        leaderUserPhone: '16845678910',
        leaderUserDept: '开发部',
      },
      {
        leaderImage: 'https://picsum.photos/400/300?random=3',
        currentNodeUserName: '海洋',
        leaderUserPhone: '15845678910',
        leaderUserDept: '开发部',
      },
    ],
  },

  // 更多轮播数据...
];
// const logoUrl = ref("'./image/logo.png'");
// 这里可以添加组件逻辑
</script>
<style>
.floor-container .el-dialog__body {
  height: 10vh;
}
</style>
<style scoped>
.floor-container {
  position: relative;
  width: 1920px; /* 设计稿宽度 */
  height: 1080px; /* 设计稿高度 */
  overflow: hidden;
  transition: transform 0.3s ease;
  margin: 0 auto;
}

.floor-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-image: url('./image/bg.png'); /* 示例背景图 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}
.content {
  position: relative;
  z-index: 1;
}

.content .floorTit {
  max-width: 1920px;
  height: 160px;
  background: linear-gradient(
    90deg,
    rgba(225, 33, 55, 0.1) 0%,
    rgba(242, 147, 70, 0.2) 43%,
    rgba(242, 147, 70, 0.05) 100%
  );
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
}
.floorLogo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.floorText {
  font-family: 'MyCustomFont', sans-serif;
  font-weight: 400;
  font-size: 48px;
  color: #333333;
  letter-spacing: 8px;
  text-align: justified;
  font-style: normal;
  text-transform: none;
}
.floorTime {
  /* font-family: 'MyCustomFont', sans-serif; */
  /* font-family: 'Source Han Sans CN', Source Han Sans CN; */
  font-weight: 500;
  font-size: 56px;
  color: #f78431;
  line-height: 48px;
  text-align: center;
  font-style: normal;
  text-transform: none;
}
.floorDate {
  /* font-family: 'Source Han Sans CN', Source Han Sans CN; */
  font-weight: 500;
  font-size: 24px;
  color: #333333;
  line-height: 48px;
  text-align: center;
  font-style: normal;
  text-transform: none;
}
.floorCarouel {
  margin: 20px 189px;
}
.floor-footerBg {
  width: 1542px;
  min-height: 56px;
  line-height: 56px;
  padding-left: 10px;
  margin: 50px 189px 0 189px;
  background: linear-gradient(
    90deg,
    rgba(225, 33, 55, 0.1) 0%,
    rgba(242, 147, 70, 0.2) 43%,
    rgba(242, 147, 70, 0.05) 100%
  );
}

/* 响应式文本调整 */
@media (max-width: 768px) {
  .content {
    padding: 3rem;
  }

  h1 {
    font-size: 2.5rem !important;
  }

  p {
    font-size: 1.25rem !important;
  }
}
</style>
