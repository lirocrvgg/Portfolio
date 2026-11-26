// EDITE AQUI OS LINKS DO PORTFÓLIO
// Estes endereços aparecem no menu Redes sociais e na seção Contato.
// Para ativar o LinkedIn depois, acrescente LinkedIn e a URL do perfil neste objeto.
const perfis = {
  GitHub: 'https://github.com/lirocrvgg',
  Instagram: 'https://www.instagram.com/murilo9z/',
  'E-mail': 'mailto:mhfn1@aluno.ifal.edu.br'
};

const menu = document.querySelector('#menu');
const social = document.querySelector('#social');
function fechar() {
  menu.hidden = true;
  social.setAttribute('aria-expanded', 'false');
}
social.onclick = () => {
  menu.hidden = !menu.hidden;
  social.setAttribute('aria-expanded', String(!menu.hidden));
};
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !social.contains(event.target)) fechar();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { fechar(); social.focus(); }
});
// Ícones vetoriais locais para que os contatos também funcionem offline.
const icones = {
  GitHub: '<path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.51-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.24.93.1-.72.39-1.21.71-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.14-3-.11-.28-.49-1.42.11-2.95 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.67.11 2.95.71.78 1.14 1.78 1.14 3 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.06v3.05c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z"/>',
  LinkedIn: '<rect width="24" height="24" rx="3" fill="currentColor"/><path fill="white" d="M4 9h3.5v11H4zm5.7 0H13v1.5c.6-1.1 1.8-1.8 3.4-1.8 3.4 0 4.1 2.1 4.1 5V20H17v-5.7c0-1.4 0-3-1.9-3s-2.1 1.5-2.1 3V20H9.7Z"/><circle cx="5.75" cy="5.5" r="2" fill="white"/>',
  'E-mail': '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></g>',
  Instagram: '<g fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="6"/><circle cx="12" cy="12" r="4.5"/></g><circle cx="18" cy="6" r="1.3" fill="currentColor"/>'
};
for (const area of [menu, document.querySelector('#links')]) {
  for (const [nome, url] of Object.entries(perfis)) {
    const item = document.createElement('a');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = icones[nome];
    item.append(icon, document.createTextNode(nome));
    item.href = url;
    area.append(item);
  }
}

const marca = document.querySelector('.brand');
let fimDoPulso;
marca.addEventListener('click', () => {
  marca.classList.add('energizada');
  clearTimeout(fimDoPulso);
  fimDoPulso = setTimeout(() => marca.classList.remove('energizada'), 1200);
});

const voltarTopo = document.querySelector('.voltar-topo');
new IntersectionObserver(([cabecalho]) => {
  voltarTopo.hidden = cabecalho.isIntersecting;
}).observe(document.getElementById('topo'));
