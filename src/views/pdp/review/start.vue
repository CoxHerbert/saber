<template>
  <div class="app-container">
    <div v-loading="loading" class="table-container">
      <div class="review-group">
        <div
          class="review-card"
          :style="{ backgroundColor: item.dimensionColor }"
          v-for="(item, index) in dataList"
          :key="index"
          @click="tikUrl(item.id)"
        >
          <div class="icon-box">
            <img :src="item.dimensionIcon" alt="" />
          </div>
          <div class="review-right">
            <div class="review-name">
              {{ item.dimensionName }}
            </div>
            <div class="review-desc">
              {{ item.dimensionDesc }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const pageData = reactive({
  loading: false,
  dataList: [],
});

const { loading, dataList } = toRefs(pageData);

onMounted(() => {
  getData();
  if (route.query.businessId) {
    router.push({
      path: `/pdp/review/steps/${route.query.businessId}`,
    });
  } else if (route.query.dimensionId && route.query.planId) {
    router.push({
      path: `/pdp/review/steps/create`,
      query: {
        dimensionId: route.query.dimensionId,
        planId: route.query.planId,
      },
    });
    // Api.pdp.dcReview
    //   .submit({
    //     dimensionId: route.query.dimensionId,
    //     planId: route.query.planId,
    //   })
    //   .then(res => {
    //     const { code, data } = res.data;
    //     if (code === 200) {
    //       router.push({
    //         path: `/pdp/review/steps/${data.id}`,
    //       });
    //     }
    //   });
  }
});

const tikUrl = id => {
  proxy
    .$confirm('确定创建评审？', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      router.push({
        path: `/pdp/review/steps/create`,
        query: {
          dimensionId: id,
        },
      });
    })
    // .then(() =>
    //   Api.pdp.dcReview.submit({
    //     dimensionId: id,
    //   })
    // )
    // .then(res => {
    //   const { code, data } = res.data;
    //   if (code === 200) {
    //     router.push({
    //       path: `/pdp/review/steps/${data.id}`,
    //     });
    //   }
    // })
    .catch(() => {
      proxy.$message({
        message: '取消成功',
        type: 'warning',
      });
    });
};

const getData = async () => {
  loading.value = true;
  const res = await Api.pdp.dcReviewDimension.list();
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data;
  }
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.table-container {
  .review-group {
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
    gap: 16px;
    .review-card {
      width: calc(33% - 12px);
      display: flex;
      padding: 40px 20px;
      border-radius: 8px;
      cursor: pointer;
      .icon-box {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 56px;
        height: 56px;
        background: #fff;
        border-radius: 6px;
      }
      .review-right {
        margin-left: 12px;
        flex: 1;
        .review-name {
          font-weight: 600;
          font-size: 20px;
          color: #333;
        }
        .review-desc {
          font-weight: 400;
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
}
</style>
