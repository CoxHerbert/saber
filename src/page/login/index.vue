<template>
  <div class="login-page-container">
    <div class="login-container_logo">
      <img class="logo-icon" src="/img/logo-v2.png" />
      <!-- <div class="logo-title">深圳联合东创科技有限公司</div> -->
    </div>

    <div class="login-form-container">
      <div class="login-form_title">深圳联合东创科技有限公司</div>

      <div class="tabs-container">
        <el-tabs v-model="activeName" style="width: 100%" @tab-change="handleClick">
          <el-tab-pane label="账户登录" name="first">
            <div class="login-main">
              <userLogin
                v-if="activeNameOne === 'user'"
                @login-by-phone="changeMode('code')"
              ></userLogin>
              <codeLogin
                v-else-if="activeNameOne === 'code'"
                @login-by-count="changeMode('user')"
              ></codeLogin>
              <thirdLogin v-else-if="activeNameOne === 'third'"></thirdLogin>
            </div>
          </el-tab-pane>
          <el-tab-pane label="企业微信登录" name="second">
            <div class="WeChat">
              <div v-if="isFailed" id="wx_reg"></div>
              <div v-else><img src="/img/loginImages/kong.png" alt="" /></div>
            </div>
          </el-tab-pane>
          <!-- <el-tab-pane label="账户密码" name="first">
            <div class="login-main">
              <userLogin v-if="activeNameOne === 'user'"></userLogin>
              <codeLogin v-else-if="activeNameOne === 'code'"></codeLogin>
              <thirdLogin v-else-if="activeNameOne === 'third'"></thirdLogin>
            </div>
          </el-tab-pane>
          <el-tab-pane label="验证码登录" name="third">
            <div class="login-main">
              <codeLogin></codeLogin>
            </div>
          </el-tab-pane>
          <el-tab-pane label="企业微信" name="second">
            <div class="WeChat">
              <div v-if="isFailed" id="wx_reg"></div>
              <div v-else><img src="/img/loginImages/kong.png" alt="" /></div>
            </div>
          </el-tab-pane> -->
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import userLogin from './userlogin.vue';
import codeLogin from './codelogin.vue';
import thirdLogin from './thirdlogin.vue';
import topLang from '@/page/index/top/top-lang.vue';
import { mapGetters } from 'vuex';
import { validatenull } from '@/utils/validate';
import { getQueryString, getTopUrl, isExternalUrl } from '@/utils/util';
import website from '@/config/website';
import Api from '@/api/index';

export default {
  name: 'login',
  components: {
    userLogin,
    codeLogin,
    thirdLogin,
    topLang,
  },
  data() {
    return {
      activeName: 'first',
      website: website,
      time: '',
      activeNameOne: 'user',
      socialForm: {
        tenantId: '000000',
        source: '',
        code: '',
        state: '',
      },
      isFailed: false,
    };
  },

  watch: {
    $route() {
      this.handleLogin();
    },
  },
  created() {
    this.handleLogin();
    this.getTime();
  },
  computed: {
    ...mapGetters(['tagWel']),
  },
  props: [],
  methods: {
    changeMode(mode) {
      console.log('changeMode', mode);
      this.activeNameOne = mode;
    },
    async getWxReg() {
      try {
        this.isFailed = true;
        const res = await Api.wxReg.wxRegState();
        const { code, data } = res.data;
        if (code == 200) {
          new WwLogin({
            id: 'wx_reg',
            appid: 'ww79633eb64931f2e2',
            agentid: '1000043',
            redirect_uri: 'http%3a%2f%2fwww.eastwinbip.com%2foauth%2fredirect%2fwechat_enterprise',
            state: data,
            href: '',
            lang: 'zh',
          });
        } else {
          this.isFailed = false;
        }
      } catch (error) {
        this.isFailed = false;
      }
    },

    handleClick() {
      if (this.activeName == 'second') this.getWxReg();
    },

    getTime() {
      setInterval(() => {
        this.time = this.$dayjs().format('YYYY-MM-DD HH:mm:ss');
      }, 1000);
    },
    handleLogin() {
      const topUrl = getTopUrl();
      const redirectUrl = '/oauth/redirect/';
      const ssoCode = '?code=';
      this.socialForm.source = getQueryString('source');
      this.socialForm.code = getQueryString('code');
      this.socialForm.state = getQueryString('state');
      let callbackUrl = getQueryString('callbackUrl');
      if (validatenull(this.socialForm.source) && topUrl.includes(redirectUrl)) {
        let source = topUrl.split('?')[0];
        source = source.split(redirectUrl)[1];
        this.socialForm.source = source;
      }

      if (
        !validatenull(this.socialForm.source) &&
        !validatenull(this.socialForm.code) &&
        !validatenull(this.socialForm.state)
      ) {
        const loading = this.$loading({
          lock: true,
          text: '第三方系统登录中,请稍后',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        this.$store
          .dispatch('LoginBySocial', this.socialForm)
          .then(async () => {
            //加载工作流路由集
            this.loadFlowRoutes();
            const menus = await this.$store.dispatch('GetMenu');
            this.$router.$avueRouter.formatRoutes(menus, true);
            if (callbackUrl) {
              // 判断是否为外部连接
              if (isExternalUrl(callbackUrl)) {
                window.location.href = callbackUrl;
              } else {
                this.$router.push(callbackUrl);
              }
            } else {
              this.$router.push(this.tagWel);
            }
            loading.close();
          })
          .catch(() => {
            loading.close();
          });
      } else if (!validatenull(this.socialForm.code) && !validatenull(this.socialForm.state)) {
        const loading = this.$loading({
          lock: true,
          text: '单点系统登录中,请稍后',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        this.$store
          .dispatch('LoginBySso', this.socialForm)
          .then(async () => {
            //加载工作流路由集
            this.loadFlowRoutes();
            const menus = await this.$store.dispatch('GetMenu');
            this.$router.$avueRouter.formatRoutes(menus, true);
            if (callbackUrl) {
              // 判断是否为外部连接
              if (isExternalUrl(callbackUrl)) {
                window.location.href = callbackUrl;
              } else {
                this.$router.push(callbackUrl);
              }
            } else {
              this.$router.push(this.tagWel);
            }
            loading.close();
          })
          .catch(() => {
            loading.close();
          });
      }
    },
    loadFlowRoutes() {
      this.$store.dispatch('FlowRoutes').then(() => {});
    },
  },
};
</script>
<style lang="scss">
#wx_reg {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.login-page-container {
  .el-input {
    border: 1px solid #e5e5e5;
    &__wrapper {
      padding: 5px 3px;

      border: 0px;
    }
  }
  .login-form .el-form-item {
    margin-bottom: 18px;
  }
  .login-submit {
    width: 100%;
  }
}
</style>
<style lang="scss" scoped>
.login-page-container {
  width: 100%;
  height: 100%;
  background-image: url('https://static.eastwinbip.com/static/image/login-bg.webp');
  background-size: cover;
  .login-container_logo {
    height: 60px;
    position: relative;
    left: 36px;
    top: 20px;
    float: left;
    display: flex;
    align-items: center;
    .logo-icon {
      height: 60px;
    }
    .logo-title {
      font-weight: bold;
      font-size: 28px;
      color: #333;
      line-height: 27px;
    }
  }

  .login-form-container {
    position: absolute;
    top: 200px;
    right: 160px;
    padding: 56px 0 30px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    width: 500px;
    .login-form_title {
      font-weight: bold;
      font-size: 28px;
      color: #333333;
      line-height: 32px;
      text-align: center;
      font-style: normal;
      text-transform: none;
      margin: 0px 0px 16px 0px;
    }
    .tabs-container {
      width: 65%;
    }
  }
}
</style>
<style lang="scss">
@use '@/styles/login.scss';
</style>
