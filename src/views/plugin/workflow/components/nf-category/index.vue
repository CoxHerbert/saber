<template>
  <div style="margin: 1.5px 0 10px">
    <el-input v-model="filterText" placeholder="搜索">
      <template #append>
        <el-button icon="el-icon-search" />
      </template>
    </el-input>
  </div>
  <el-tree
    ref="treeRef"
    :props="option.props"
    :data="data"
    :filter-node-method="filterNode"
    default-expand-all
    @node-click="handleNodeClick"
  ></el-tree>
</template>

<script>
import { tree } from '../../api/design/category.js';

export default {
  name: 'nf-category',
  emits: ['node-click', 'list-change'],
  data() {
    return {
      data: [],
      option: {
        size: 'default',
        menu: false,
        addBtn: false,
        props: {
          label: 'name',
          value: 'id',
        },
      },
      filterText: '',
    };
  },
  watch: {
    filterText(val) {
      this.$refs.treeRef.filter(val);
    },
  },
  mounted() {
    this.getCategoryList();
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.includes(value);
    },
    handleNodeClick({ id }) {
      this.$emit('node-click', { id });
    },
    getCategoryList() {
      tree().then(res => {
        const data = res.data.data;
        this.$emit('list-change', this.deepClone(data));

        this.data = data;
        this.data.unshift({ id: '', name: '全部' });
      });
    },
  },
};
</script>

<style></style>
