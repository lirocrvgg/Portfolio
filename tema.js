(() => {
  const sistema = matchMedia('(prefers-color-scheme: dark)');
  const chave = 'portfolio-tema';
  let escolha;
  try { escolha = localStorage.getItem(chave); } catch {}
  function aplicar() {
    const escuro = escolha === 'escuro' || (escolha !== 'claro' && sistema.matches);
    document.documentElement.dataset.tema = escuro ? 'escuro' : 'claro';
    document.querySelector('#tema')?.setAttribute('aria-pressed', String(escuro));
    document.dispatchEvent(new Event('mudanca-de-tema'));
  }
  aplicar();
  sistema.addEventListener('change', aplicar);
  document.addEventListener('DOMContentLoaded', () => {
    aplicar();
    document.querySelector('#tema').addEventListener('click', () => {
      escolha = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
      try { localStorage.setItem(chave, escolha); } catch {}
      aplicar();
    });
  });
})();
