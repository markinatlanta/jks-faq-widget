// widget/jks-faq-widget.js
;(function(){
  function elt(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    kids.forEach(c=>{
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  function createBubble() {
    const b = elt('div',{ id:'jks-faq-bubble' }, '?');
    document.body.appendChild(b);
    return b;
  }

  function createPanel() {
    const header = elt('div',{ class:'header' }, 'FAQ Bot');
    const body   = elt('div',{ class:'body' });
    const input  = elt('input',{ type:'text', placeholder:'Enter FAQ key' });
    const send   = elt('button',{ class:'send' }, 'Ask');
    const wrap   = elt('div',{ class:'input-wrapper' }, input, send);
    const panel  = elt('div',{ id:'jks-faq-panel' }, header, body, wrap);
    document.body.appendChild(panel);
    return { panel, body, input, send };
  }

  window.JKS_FAQ_Widget = {
    init(opts) {
      // Wait for document.body to exist
      (function waitForBody(){
        if (!document.body) {
          return setTimeout(waitForBody, 50);
        }
        // Now safe to build UI
        const { proxyEndpoint, promptBundle, position, brandName } = opts;
        const bubble = createBubble();
        const { panel, body, input, send } = createPanel();

        // Position override
        if (position === 'bottom-left') {
          bubble.style.right = 'auto'; bubble.style.left  = '20px';
          panel.style.right  = 'auto'; panel.style.left   = '20px';
        }

        bubble.addEventListener('click', ()=> panel.classList.toggle('open'));
        send.addEventListener('click', async ()=>{
          const key = input.value.trim();
          if (!key) return;
          body.innerHTML = '<p>Loading…</p>';
          try {
            const res = await fetch(proxyEndpoint, {
              method: 'POST',
              headers: { 'Content-Type':'application/json' },
              body: JSON.stringify({ promptKey: key })
            });
            const { answer } = await res.json();
            body.innerHTML = answer;
          } catch (e) {
            body.innerHTML = `<p style="color:red;">Error: ${e.message}</p>`;
          }
        });
      })();
    }
  };
})();
