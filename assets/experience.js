const prompts={
  friend:{quote:'“You don’t have to figure everything out alone. Want to talk?”',tip:'Make room to listen. A calm check-in can open a conversation without asking someone to share more than they want to.'},
  family:{quote:'“You can come to me with a hard question. I’ll listen first.”',tip:'Choose a quiet moment. Ask open questions and keep the conversation respectful, even when the topic feels uncomfortable.'},
  community:{quote:'“How can we make it easier for young people to ask for support?”',tip:'Start with listening. Share trusted resources and invite others to learn about prevention with you.'}
};
document.querySelectorAll('[data-audience]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-audience]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const p=prompts[button.dataset.audience];document.getElementById('conversation-quote').textContent=p.quote;document.getElementById('conversation-tip').textContent=p.tip;
  document.getElementById('copy-status').textContent='';
}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let count=0;document.querySelectorAll('.resource[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++;});
  document.getElementById('resource-count').textContent=`${count} trusted resource${count===1?'':'s'} shown`;
}));
async function copyText(text,status){try{await navigator.clipboard.writeText(text);status.textContent='Copied. Ready to share.';}catch{status.textContent='Copy isn’t available here. Select and copy the text above.';}}
document.getElementById('copy-conversation').addEventListener('click',()=>copyText(document.getElementById('conversation-quote').textContent,document.getElementById('copy-status')));
document.getElementById('copy-resources').addEventListener('click',()=>copyText('Learn the signs. Start a conversation. Share trusted help.\nCDC overdose response: https://www.cdc.gov/stop-overdose/response/index.html\nFind treatment: https://findtreatment.gov/\nCrisis support: https://988lifeline.org/',document.getElementById('share-status')));
document.getElementById('motion-toggle').addEventListener('click',event=>{const paused=document.documentElement.classList.toggle('motion-paused');event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.textContent=paused?'Resume animation':'Pause animation';});
