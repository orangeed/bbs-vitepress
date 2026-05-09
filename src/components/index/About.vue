<template>
  <a-layout>
    <a-layout id="about-index">
      <IndexHeader class="header" />
      <a-layout-content>
        <main class="about_content" :style="$store.state.collapsed ? 'width: 100%;' : 'width: 800px;'">
          <div style="background: #fff; margin-bottom: 10px">
            <section class="mission">
              <div class="inner">
                <div class="author-content">
                  <!-- <div class="title">作者</div> -->
                  <div class="sub">作者：橘子orange</div>
                </div>
                <div class="mission-content">
                  <!-- <div class="title">我们的使命</div> -->
                  <div class="sub">橘享论坛专注免费分享网盘资源，优质电影、剧集、动漫、书籍资料、学习教程、音乐音频应有尽有，更多内容等待你来发掘。</div>
                  <img title="微信" src="../../assets/img/weixin.png" width="200" />
                  <!-- <img title="QQ" src="https://aid.nansin.top/default/qq-mlns.jpg" width="200" /> -->
                </div>
              </div>
            </section>
          </div>
        </main>
      </a-layout-content>
      <FooterButtons v-if="!$store.state.collapsed" />
    </a-layout>
  </a-layout>
</template>

<script>
import IndexHeader from "@/components/index/head/IndexHeader";
import FooterButtons from "@/components/utils/FooterButtons";

export default {
  name: "About",

  components: { IndexHeader, FooterButtons },

  mounted() {
    // 滚动条恢复初始位置的方法
    this.$nextTick(() => {
      let dom = document.querySelector('#app');
      if (dom !== null) {
        dom.scrollTop = 0;
      }
    })
  }
};
</script>


<style lang="less">
#about-index {
  .header {
    position: fixed;
    width: 100%;
    z-index: 999;
    background: #fff;
    border-bottom: 1px solid #00000021;
  }

  .about_content {
    margin-top: 64px;
  }

  .ant-layout-header,
  .ant-layout-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-layout-header {
    background: #fff;
    height: auto;
    line-height: 2.3;
  }

  .mission {
    padding: 30px 30px;
    box-sizing: border-box;

    .title {
      font-size: 32px;
      font-weight: bold;
    }

    .sub {
      margin: 10px 0;
      font-size: 16px;
      color: #999;
    }
  }
}
</style>
