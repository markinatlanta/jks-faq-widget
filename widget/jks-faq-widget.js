// widget/jks-faq-widget.js
;(function(){
  // helper to create elements
  function elt(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    kids.forEach(c=>{
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  // bubble + panel creators, unchanged
  function createBubble() {
    const b = elt('div',{ id:'jks-faq-bubble' }, '?');
    document.body.appendChild(b);
    return b;
  }
  function createPanel() {
    const header = elt('div',{class:'header'}, 'FAQ Bot');
    const body   = elt('div',{class:'body'});
    const input  = elt('input',{type:'text', placeholder:'Enter FAQ key'});
    const send   = elt('button',{class:'send'}, 'Ask');
    const wrap   = elt('div',{class:'input-wrapper'}, input, send);
    const panel  = elt('div',{ id:'jks-faq-panel' }, header, body, wrap);
    document.body.appendChild(panel);
    return { panel, body, input, send };
  }

  // the widget API
  window.JKS_FAQ_Widget = {
    init(opts) {
      // this function actually builds the UI — but only after DOM is ready
      const build = () => {
        const { proxyEndpoint, promptBundle, position, brandName } = opts;
        const bubble = createBubble();
        const { panel, body, input, send } = createPanel();
        if (position === 'bottom-left') {
          bubble.style.right = 'auto'; bubble.style.left = '20px';
          panel.style.right = 'auto'; panel.style.left  = '20px';
        }
        bubble.addEventListener('click', ()=> panel.classList.toggle('open'));
        send.addEventListener('click', async ()=>{
          const key = input.value.trim();
          if (!key) return;
          body.innerHTML = '<p>Loading…</p>';
          try {
            const res = await fetch(proxyEndpoint, {
              method: 'POST',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ promptKey: key })
            });
            const { answer } = await res.json();
            body.innerHTML = answer;
          } catch (e) {
            body.innerHTML = `<p style="color:red;">${e.message}</p>`;
          }
        });
      };

      // defer to after DOMContentLoaded if still loading
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
      } else {
        build();
      }
    }
  };
})();
