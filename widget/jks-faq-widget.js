// widget/jks-faq-widget.js
;(function(){
  // helpers
  function elt(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    kids.forEach(c=> typeof c==='string' ? e.appendChild(document.createTextNode(c)) : e.appendChild(c));
    return e;
  }
  function normalize(str) {
    return (str||'').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function scoreMatch(question, target) {
    const qTokens = new Set(normalize(question).split(' ').filter(Boolean));
    const tTokens = new Set(normalize(target).split(' ').filter(Boolean));
    let common = 0;
    qTokens.forEach(tok => { if (tTokens.has(tok)) common++; });
    return common;
  }

  let prompts = [];
  const promptMap = {};

  // UI creation
  const bubble = elt('div',{ id:'jks-faq-bubble', 'aria-label':'FAQ Chatbot', role:'button', title:'FAQ Chatbot' }, '?');
  const panel = (() => {
    const header = elt('div',{ class:'header' }, 'Quick FAQ');
    const body = elt('div',{ class:'body' });
    const input = elt('input',{ type:'text', placeholder:'Ask a question (e.g. “How long is a laser session?”)' });
    const send = elt('button',{ class:'send' }, 'Search');
    const inputWrap = elt('div',{ class:'input-wrapper' }, input, send);
    const suggestions = elt('div',{ id:'faq-suggestions' });
    const panelEl = elt('div',{ id:'jks-faq-panel' }, header, body, inputWrap, suggestions);
    return { panelEl, body, input, send, suggestions };
  })();

  // inject
  (function waitForBody(){
    if (!document.body) return setTimeout(waitForBody, 50);
    document.body.appendChild(bubble);
    document.body.appendChild(panel.panelEl);
    bubble.addEventListener('click', ()=> panel.panelEl.classList.toggle('open'));
  })();

  function renderSuggestions() {
    panel.suggestions.innerHTML = '';
    if (!prompts.length) return;
    const container = elt('div',{}, elt('div',{}, 'Try one of:'));
    prompts.forEach(p => {
      const btn = elt('button',{ class:'faq-btn', 'data-key': p.key }, p.key.replace(/_/g,' '));
      btn.addEventListener('click', ()=> showAnswer(p.key));
      container.appendChild(btn);
    });
    panel.suggestions.appendChild(container);
  }

  function showAnswer(key) {
    const answer = promptMap[key];
    if (answer) {
      panel.body.innerHTML = answer;
    } else {
      panel.body.innerHTML = `<p style="color:orange;">No answer found for that. Try one of the suggestions below.</p>`;
      renderSuggestions();
    }
  }

  function searchAndShow(q) {
    if (!q || !q.trim()) {
      panel.body.innerHTML = `<p>Type something like “What are your payment options?” or click a suggestion below.</p>`;
      renderSuggestions();
      return;
    }
    let best = { key: null, score: 0 };
    prompts.forEach(p => {
      const s1 = scoreMatch(q, p.key);
      const s2 = scoreMatch(q, p.prompt);
      const total = s1 + s2;
      if (total > best.score) {
        best = { key: p.key, score: total };
      }
    });
    if (best.score > 0) {
      showAnswer(best.key);
    } else {
      panel.body.innerHTML = `<p>I couldn’t find a close match. Here are common questions:</p>`;
      renderSuggestions();
    }
  }

  panel.send.addEventListener('click', ()=> {
    searchAndShow(panel.input.value);
  });
  panel.input.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchAndShow(panel.input.value);
  });

  async function loadBundle() {
    try {
      if (window.JKS_FAQ_PROMPTS_ARRAY && Array.isArray(window.JKS_FAQ_PROMPTS_ARRAY)) {
        prompts = window.JKS_FAQ_PROMPTS_ARRAY;
      } else if (window.JKS_FAQ_PROMPTS && Array.isArray(window.JKS_FAQ_PROMPTS)) {
        prompts = window.JKS_FAQ_PROMPTS;
      } else {
        const resp = await fetch('https://cdn.jsdelivr.net/gh/markinatlanta/jks-faq-widget@main/prompts/faq_prompts_medspa.json');
        if (resp.ok) {
          prompts = await resp.json();
        }
      }
    } catch (e) {
      // ignore, will handle below
    }

    if (!Array.isArray(prompts)) prompts = [];

    prompts.forEach(p => {
      promptMap[p.key] = p.answer || '<p>No answer defined.</p>';
    });

    renderSuggestions();
    panel.body.innerHTML = '<p>Ask a question or click a common one below.</p>';
  }

  loadBundle();

  // expose for debug
  window.JKS_FAQ_Widget = window.JKS_FAQ_Widget || {};
  window.JKS_FAQ_Widget._internal = { prompts, promptMap };
})();
