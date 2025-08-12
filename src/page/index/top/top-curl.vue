<template>
  <span class="curl" @click="open = true">CURL</span>
  <el-dialog v-model="open" title="CURL列表" destroy-on-close append-to-body>
    <el-table :data="curlData">
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column prop="curl" label="curl" align="center">
        <template #default="scoped">
          <span class="ellipsis" @click="func.copyText(scoped.row.curl)">
            {{ scoped.row.curl }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import { fullscreenToggel, listenfullscreen } from 'utils/util';
import func from '@/utils/func';

export default {
  data() {
    return {
      open: false,
      func,
    };
  },
  computed: {
    ...mapGetters(['isFullScren', 'curlData']),
  },
  mounted() {
    listenfullscreen(this.setScreen);
  },
  methods: {
    setScreen() {
      this.$store.commit('SET_FULLSCREN');
    },
    handleScreen() {
      fullscreenToggel();
    },
  },
};
</script>
<style lang="scss" scoped>
.curl {
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}
</style>
