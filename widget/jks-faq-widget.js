<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/markinatlanta/jks-faq-widget@main/widget/jks-faq-widget.css" 
/>
<script
  src="https://cdn.jsdelivr.net/gh/markinatlanta/jks-faq-widget@main/widget/jks-faq-widget.js">
</script>
<script>
  (function waitForWidget() {
    if (window.JKS_FAQ_Widget?.init) {
      window.JKS_FAQ_Widget.init({
        proxyEndpoint: window.location.origin + "/_functions/openai",
        promptBundle: "https://cdn.jsdelivr.net/gh/markinatlanta/jks-faq-widget@main/prompts/faq_prompts_medspa.json",
        position: "bottom-right",
        brandName: "JKS Advisory"
      });
    } else {
      setTimeout(waitForWidget, 100);
    }
  })();
</script>
