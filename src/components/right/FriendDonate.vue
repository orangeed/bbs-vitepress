<template>
  <div id="friend-donate">
    <header class="user-block-header">{{ $t("common.friendDonate") }}</header>
    <a-divider style="margin: 10px 0 0 0;" />
    <p>
      <small class="text-warning">{{ $t("common.donateContent1") }}</small>
      <br>
      <small class="text-warning">{{ $t("common.donateContent2") }}</small>
    </p>
    <!-- 境外收款 -->
    <!-- <div style="line-height: 30px; padding: 0 15px" v-if="$store.state.locale !== 'zh_CN'">
      <li><b>Where can I send money?</b></li>
      <small style="color: #8a919f">Alipay Cooperative overseas remittance platform: </small>
      <a href="https://remit.alipay.com" target="_blank">https://remit.alipay.com</a>
      <li><b>What information should I fill in at the money transfer platform?</b></li>
      <small style="color: #8a919f">Alipay ID: </small>
      <span :style="{color: $store.state.themeColor}">m15680982093_1@163.com</span><br/>
      <small style="color: #8a919f">Last Name: </small>
      <span :style="{color: $store.state.themeColor}">MA</span><br/>
      <small style="color: #8a919f">First Name: </small>
      <span :style="{color: $store.state.themeColor}">LIANG</span>
    </div> -->
    <!-- 中文收款码 -->
    <div class="donate">
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" tab="随意">
          <!--我是土豪-->
          <div role="tabpanel" class="tab-pane" id="rmb-custom">
            <img src="../../assets/img/donate-weixin.jpg" alt="微信" style="width: 100%">
          </div>
        </a-tab-pane>
        <!-- <a-tab-pane key="2" tab="😏">
          <div role="tabpanel" class="tab-pane" id="rmb-99">
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="20 元" force-render>
          <div role="tabpanel" class="tab-pane" id="rmb-20">
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" tab="10 元">
          <div role="tabpanel" class="tab-pane active" id="rmb-10">
          </div>
        </a-tab-pane> -->
      </a-tabs>
    </div>
  </div>
</template>

<script>

</script>

<style lang="less">
#friend-donate {
  padding-bottom: 10px;

  .user-block-header {
    padding: 15px 10px 0 15px;
  }

  p {
    padding: 15px 15px 0 15px;

    .text-warning {
      color: #8a6d3b;
      line-height: 30px;
    }

    .text-info {
      color: #31708f;
      line-height: 30px;
    }
  }
}

#friend-donate .ant-tabs-nav .ant-tabs-tab {
  margin: 0;
}
</style>
