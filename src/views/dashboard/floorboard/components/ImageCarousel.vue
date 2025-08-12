<template>
  <div class="carousel-container">
    <el-carousel
      :indicator-position="indicatorPosition"
      :height="carouselHeight"
      :autoplay="autoplay"
      :interval="interval"
      :arrow="arrow"
      @change="handleChange"
    >
      <!-- 轮播项 -->
      <el-carousel-item v-for="(item, index) in carouselData" :key="item.key || index">
        <div class="carousel-content">
          <!-- 使用栅格布局展示图片 -->
          <el-row :gutter="gutter">
            <el-col
              :span="24 / imagesPerSlide"
              v-for="(img, imgIndex) in item.images"
              :key="img.key || imgIndex"
            >
              <div class="image-item" @click="handleImageClick(img, index, imgIndex)">
                <img
                  :src="img.leaderImage"
                  class="carousel-image"
                  :loading="img.loading || 'lazy'"
                />
                <div class="userInfo">
                  <div class="user-title">
                    <div class="user-name">{{ img.currentNodeUserName }}</div>
                    <div class="user-dep">{{ img.leaderUserDept }}</div>
                  </div>
                  <div class="image-title" v-if="showImageTitle">{{ img.leaderUserPhone }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue';

const props = defineProps({
  // 轮播数据
  carouselData: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 轮播高度
  carouselHeight: {
    type: String,
    default: '720px',
  },
  // 指示器位置
  indicatorPosition: {
    type: String,
    default: 'outside',
    validator: value => ['outside', 'inside', 'none'].includes(value),
  },
  // 是否自动轮播
  autoplay: {
    type: Boolean,
    default: true,
  },
  // 轮播间隔时间
  interval: {
    type: Number,
    default: 3000,
  },
  // 箭头显示时机
  arrow: {
    type: String,
    default: 'never',
    validator: value => ['always', 'hover', 'never'].includes(value),
  },
  // 图片间距
  gutter: {
    type: Number,
    default: 30,
  },
  // 每页显示图片数量
  imagesPerSlide: {
    type: Number,
    default: 3,
    validator: value => value >= 1 && value <= 6,
  },
  // 是否显示图片标题
  showImageTitle: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits([
  'change', // 轮播切换时触发
  'image-click', // 图片点击时触发
]);

// 轮播切换处理
const handleChange = currentIndex => {
  emits('change', currentIndex);
};

// 图片点击处理
const handleImageClick = (image, carouselIndex, imageIndex) => {
  emits('image-click', {
    image,
    carouselIndex,
    imageIndex,
  });
};

// 组件挂载后执行
onMounted(() => {
  console.log('ImageCarousel component mounted');
});
</script>

<style scoped>
.carousel-container {
  width: 100%;
}

.carousel-content {
  padding: 10px;
  box-sizing: border-box;
}
.userInfo {
  padding-top: 10px;
}

.image-item {
  border-radius: 10px;
  background-color: #fff;
  overflow: hidden;
  height: 100%;
  padding: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.carousel-image {
  width: 100%;
  height: 560px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.5s ease;

  /* border: 10px solid #fff; */
}

/* .image-item:hover .carousel-image {
  transform: scale(1.05);
} */
.user-title {
  display: flex;
  justify-content: center;
  align-items: center;
}
.user-name {
  font-family: 'MyCustomFont', sans-serif;
  font-weight: 400;
  font-size: 48px;
  color: #333333;
  line-height: 48px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.user-dep {
  /* width: 120px;
  height: 40px; */
  font-size: 28px;
  padding: 3px 10px;
  margin-left: 10px;
  color: #fff;
  background: linear-gradient(90deg, rgba(225, 33, 55, 0.7) 0%, rgba(242, 147, 70, 0.45) 100%);
}
.image-title {
  text-align: center;
  font-size: 32px;
  color: #606266;
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
