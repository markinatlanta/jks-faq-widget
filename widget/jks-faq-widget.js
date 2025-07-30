// widget/jks-faq-widget.js
;(function(){
  // create element helper
  function elt(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    kids.forEach(c=> typeof c==='string' ? e.appendChild(document.createTextNode(c)) : e.appendChild(c));
    return e;
  }

  // bubble & panel builders, but do NOT call them until body exists
  function createBubble() {
    return elt('div',{ id:'jks-faq-bubble' }, '?');
  }
  function createPanel() {
    const header = elt('div',{ class:'header' }, 'FAQ Bot');
    const body   = elt('div',{ class:'body' });
    const input  = elt('input',{ type:'text', placeholder:'Enter FAQ key' });
    const send   = elt('button',{ class:'send' }, 'Ask');
    const wrap   = elt('div',{ class:'input-wrapper' }, input, send);
    const panel  = elt('div',{ id:'jks-faq-panel' }, header, body, wrap);
    return { panel, body, input, send };
  }

  window.JKS_FAQ_Widget = {
    init(opts) {
      // wait until <body> is available
      (function waitForBody(){
        if (!document.body) {
          return setTimeout(waitForBody, 50);
        }
        // now safe to inject
        const { proxyEndpoint, promptBundle, position } = opts;
        // insert bubble and panel into the real body
        const bubble = createBubble();
        document.body.appendChild(bubble);
        const { panel, body, input, send } = createPanel();
        document.body.appendChild(panel);

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
              headers:{ 'Content-Type':'application/json' },
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
