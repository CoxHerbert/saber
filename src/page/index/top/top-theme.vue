<template>
  <div>
    <el-dialog title="选择" v-model="box" width="50%">
      <el-radio-group v-model="text" class="list">
        <el-row :span="24">
          <el-col v-for="(item, index) in list" :key="index" :md="4" :xs="12" :sm="4">
            <el-radio :label="item.value">{{ item.name }}</el-radio>
          </el-col>
        </el-row>
      </el-radio-group>
    </el-dialog>

    <span>
      <i class="icon-zhuti" @click="open"></i>
    </span>
  </div>
</template>

<script>
import { setTheme } from 'utils/util';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      box: false,
      text: '',
      list: [
        {
          name: '默认主题',
          value: 'default',
        },
      ],
    };
  },
  watch: {
    text: function (val) {
      this.$store.commit('SET_THEME_NAME', val);
      setTheme(val);
    },
  },
  computed: {
    ...mapGetters(['themeName', 'tagWel']),
  },
  mounted() {
    this.text = this.themeName;
    if (!this.text) {
      this.text = '';
    }
  },
  methods: {
    open() {
      this.box = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  width: 100%;
}
</style>
