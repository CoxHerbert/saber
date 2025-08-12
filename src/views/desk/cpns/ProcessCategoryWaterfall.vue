<template>
  <div ref="box" class="waterfall-container">
    <template v-for="category in categories">
      <div v-if="category.inited" :style="category.style" class="category-item" :key="category">
        <div class="title-box">
          <span class="icon">
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M25.3332 29.3337H6.6665C4.45737 29.3337 2.6665 27.5429 2.6665 25.3337V4.00033C2.6665 3.26395 3.26346 2.66699 3.99984 2.66699H22.6665C23.4029 2.66699 23.9998 3.26395 23.9998 4.00033V20.0003H29.3332V25.3337C29.3332 27.5429 27.5424 29.3337 25.3332 29.3337ZM23.9998 22.667V25.3337C23.9998 26.0701 24.5968 26.667 25.3332 26.667C26.0696 26.667 26.6665 26.0701 26.6665 25.3337V22.667H23.9998ZM21.3332 26.667V5.33366H5.33317V25.3337C5.33317 26.0701 5.93013 26.667 6.6665 26.667H21.3332ZM7.99984 9.33366H18.6665V12.0003H7.99984V9.33366ZM7.99984 14.667H18.6665V17.3337H7.99984V14.667ZM7.99984 20.0003H14.6665V22.667H7.99984V20.0003Z"
              />
            </svg>
          </span>
          <span class="title"
            >{{ category.name
            }}<span v-if="category.processDefs?.length > 0"
              >({{ category.processDefs?.length }})</span
            ></span
          >
        </div>
        <div v-if="category.processDefs?.length > 0" class="item-list">
          <div class="item" v-for="(item, j) in category.processDefs" :key="j">
            <div class="item-title" @click.stop="handleClickProcessItem(category.processDefs[j])">
              {{ category.processDefs[j].name }}
            </div>
            <div v-if="item.menu" class="record">
              <el-button type="text" @click="handleClickHistory(item.menu)">历史</el-button>
            </div>
            <div class="sc">
              <el-button
                @click.stop="handleClickColection(category.processDefs[j])"
                class="icon-btn"
                :class="{
                  selected: collectionIds.includes(category.processDefs[j].key),
                }"
                type="default"
                circle
              >
                <el-icon v-if="!collectionIds.includes(category.processDefs[j].key)"
                  ><Star
                /></el-icon>
                <el-icon v-else><StarFilled /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import exForm from '../../plugin/workflow/mixins/ex-form';

function responsiveWaterfall(container, items, minColumnWidth = 350, gap = 16) {
  const containerWidth = container.offsetWidth;
  if (!container) {
    return;
  }
  const columnCount = Math.max(1, Math.floor(containerWidth / minColumnWidth));
  const itemWidth = Math.ceil((containerWidth - (columnCount - 1) * gap) / columnCount);
  const columnHeights = new Array(columnCount).fill(24);
  items.forEach(item => {
    const minHeight = Math.min(...columnHeights);
    const columnIndex = columnHeights.indexOf(minHeight);
    const itemHeight = 100 + (item.processDefs?.length || 0) * 40;
    item.style = item.style || {};
    item.style['--item-color'] = item.color || '#1D65F3';
    item.style.position = 'absolute';
    item.style.height = `${itemHeight}px`;
    item.style.width = `${itemWidth}px`;
    item.style.left = `${columnIndex * (itemWidth + gap)}px`;
    item.style.top = `${minHeight}px`;
    columnHeights[columnIndex] += itemHeight + gap;
    item.inited = true;
  });

  return columnCount;
}

export default {
  mixins: [exForm],
  name: 'ProcessCategoryWaterfall',
  props: {
    collectionIds: {
      type: Array,
      default() {
        return [];
      },
    },
    categories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  watch: {
    categories: {
      handler(newValue) {
        if (newValue) {
          this.calcWaterFull();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      timer: null,
    };
  },
  mounted() {
    window.addEventListener('resize', this.calcSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calcSize);
  },
  methods: {
    calcSize() {
      responsiveWaterfall(this.$refs.box, this.categories, 350, 16);
    },
    calcWaterFull() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        responsiveWaterfall(this.$refs.box, this.categories, 350, 16);
      }, 1000);
    },
    handleClickColection(item) {
      this.$emit('collectionData', item);
    },
    handleClickProcessItem(item) {
      this.dynamicRoute({ ...item, parentMenuId: '1869590102110900226' }, 'start');
    },
    handleClickHistory(menu) {
      this.$router.push({
        path: menu.path,
        query: {
          hasTagReturnBtn: true,
          parentMenuId: '1869590102110900226',
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.waterfall-container {
  background: #fff;
  position: relative;
  width: 100%;
}
.category-item {
  position: absolute;
  width: 24%;
  margin-right: 16px;
  border-style: solid;
  background: #f6f8fa;
  border-color: var(--item-color);
  border-width: 8px 2px 2px 2px;
  border-radius: 8px 8px 8px 8px;
  padding: 0 20px;
  &:hover {
    background-color: #fff;
    box-shadow: 4px 4px 12px 0px rgba(0, 0, 0, 0.1);
  }

  svg {
    fill: var(--item-color);
  }

  .title-box {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 24px;
    .icon {
      margin-right: 6px;
      svg {
        display: inline-block;
        width: 32px;
        height: 32px;
      }
    }
  }

  .title {
    font-weight: 500;
    font-size: 20px;
    color: #333333;
    line-height: 32px;
    text-align: left;
    font-style: normal;
    text-transform: none;
  }

  .item-list {
    .item {
      cursor: pointer;
      display: flex;
      &:hover {
        background-color: rgba(246, 248, 250, 1);
      }
      .item-title {
        box-sizing: border-box;
        padding-left: 24px;
        margin-right: 8px;
        line-height: 32px;
        width: calc(100% - 42px);
        flex: 1;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .icon-btn {
        background: transparent;
        border: none;
        &.selected :deep(.el-icon) {
          color: #f78431;
          font-size: 18px;
        }
        span {
          background-color: transparent;
        }
      }
    }
  }
}
</style>
