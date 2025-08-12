<template>
  <div class="comp-personal-information" v-loading="loading">
    <div class="info-wrap">
      <div class="info-wrap-left">
        <div class="info-wrap-left-top">
          <img class="avatar" :src="handleAvatar(userInfo.avatar)" />
          <div class="user-sign" @click="doAction('sign')">
            <el-icon><Refresh /></el-icon>
            {{ sentence || '-' }}
          </div>
        </div>
        <div class="dept-name">
          {{ userInfo.deptName }}
        </div>
      </div>

      <div class="weather" @click="doAction('weather')">
        <span class="weather-info">
          <img
            v-if="weatherImg"
            class="weather-img"
            :src="weatherImg"
            alt=""
            :onerror="loadImgError"
            srcset=""
          />
          <div class="weather-text">
            {{ userDetail.weather || '-' }}
          </div>
        </span>
        <span class="address">
          <span class="addr"> {{ userDetail.adressName || '-' }} </span
          ><span class="temp"> {{ userDetail.temperature || '-' }}</span
          >°C
        </span>
      </div>
    </div>
    <div class="integral-wrap">
      <div class="integral-data">
        当前积分
        <div class="value">{{ userDetail.points || 0 }}</div>
      </div>
      <div class="view-details">
        查看明细<el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <div class="attendance-wrap">
      <div class="monthly-group">
        <div class="item">
          本月请假天数
          <div class="item-count">{{ userDetail.leaveDateCount || 0 }}</div>
        </div>
        <div class="item">
          本月出差天数
          <div class="item-count">{{ userDetail.travelDateCount || 0 }}</div>
        </div>
        <div class="item">
          本月加班
          <div class="item-count">{{ userDetail.overDateCount || 0 }}小时</div>
        </div>
      </div>
      <div class="punch-card-title">今日打卡明细</div>
      <div class="punch-card-group">
        <div
          class="item-dete"
          v-for="(date, index) in userDetail?.punchCardDetail || []"
          :key="index"
        >
          {{ date }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { throttle } from 'lodash';
import Api from '@/api';

const { proxy } = getCurrentInstance();

const compData = reactive({
  loading: false,
  userDetail: {},
  sentence: '',
  weatherImg: null,
  localUrl: '',
});
const { loading, userDetail, sentence, weatherImg, localUrl } = toRefs(compData);

const userInfo = computed(() => proxy.$store.getters.userInfoAll);

const getData = params => {
  loading.value = true;
  Api.desk.home
    .getUserInfo(params)
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
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

const loadImgError = () => {
  weatherImg.value = localUrl.value;
};

const getLocal = () => {
  const params = { lng: '113.83', lat: '23.02' };
  getData(params);
};

const getRandomSentence = () => {
  Api.desk.home
    .getRandomSentence()
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        sentence.value = data;
      }
    })
    .catch(err => {
      console.error(err);
    });
};

const doAction = throttle(action => {
  if (action === 'sign') {
    getRandomSentence();
  } else if (action === 'weather') {
    getLocal();
  }
}, 1000);

const handleAvatar = avatar => {
  if (avatar === '/img/bg/img-logo.png' || !avatar) {
    return 'https://static.eastwinbip.com/static/image/logo.png';
  } else {
    return avatar;
  }
};

onMounted(() => {
  getRandomSentence();
  getLocal();
  // const params = { lng: '113.83', lat: '23.02' };
  // getData(params);
});
</script>
<style lang="scss" scoped>
.comp-personal-information {
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(346deg, rgba(247, 132, 49, 0) 0%, rgba(247, 132, 49, 0.25) 100%);
  margin-bottom: 16px;
  height: 350px;
  .info-wrap {
    display: flex;
    align-items: center;
    .info-wrap-left {
      display: flex;
      flex-direction: column;
      flex: 1;
      &-top {
        display: flex;
        width: 100%;
        .avatar {
          margin-right: 8px;
          width: 48px;
          height: 48px;
          border-radius: 36px;
          background-color: #fff;
          overflow: hidden;
        }
        .user-sign {
          flex: 1;
          font-weight: bold;
          font-size: 14px;
          color: #333333;
          line-height: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
      }
      .dept-name {
        display: flex;
        margin-top: 5px;
        font-weight: 400;
        font-size: 12px;
        color: #848488;
        line-height: 16px;
        gap: 5px;
      }
    }
    .weather {
      margin-top: -10px;
      margin-right: -3px;
      padding: 0 0 3px 22px;
      position: relative;
      font-weight: 400;
      font-size: 12px;
      color: #333333;
      cursor: pointer;
      &-info {
        .weather-img {
          width: 55px;
          height: 55px;
        }
      }
    }
  }
  .integral-wrap {
    padding-left: 17px;
    padding-right: 7px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 8px;
    height: 51px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 12px;
    border: 2px solid #ffffff;
    .integral-data {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      color: #333333;
      .value {
        margin-left: 16px;
        font-weight: bold;
        font-size: 20px;
        color: #f78431;
      }
    }
    .view-details {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #848488;
      line-height: 12px;
      text-align: right;
      font-style: normal;
      text-transform: none;
      user-select: none;
      cursor: pointer;
    }
  }
  .attendance-wrap {
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    height: 184px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 12px;
    border: 2px solid #ffffff;
    .monthly-group {
      display: flex;
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        &-count {
          margin-top: 12px;
          font-weight: bold;
          font-size: 20px;
          color: #333333;
          line-height: 20px;
        }
      }
    }
  }
  .punch-card-title {
    padding: 15px 10px;
    font-weight: 600;
    font-size: 14px;
    color: #333333;
    line-height: 14px;
  }
  .punch-card-group {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    padding: 15px;
    padding-top: 0;
    overflow: hidden;
    .item-dete {
      width: 33%;
      height: 50%;
      font-weight: 400;
      font-size: 12px;
      color: #848488;
    }
  }

  .address {
    .addr {
      font-size: 12px;
      font-weight: bold;
      margin-right: 4px;
    }

    .temp {
      font-size: 12px;
      font-weight: bold;
    }
  }
}
</style>
