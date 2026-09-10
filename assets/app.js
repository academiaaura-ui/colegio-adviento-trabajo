
const menu = document.getElementById('menuBtn');
const nav = document.getElementById('navLinks');
if(menu && nav){
  menu.addEventListener('click',()=>nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
}

async function getMaterials(){
  const r = await fetch('data/materiales.json');
  if(!r.ok) throw new Error('No se pudo cargar materiales.json');
  return await r.json();
}

async function initGradePage(){
  const library = document.getElementById('library');
  if(!library) return;

  const params = new URLSearchParams(location.search);
  const grade = params.get('g') || '1';
  const names = {
    '1':'1.º de Secundaria','2':'2.º de Secundaria','3':'3.º de Secundaria',
    '4':'4.º de Secundaria','5':'5.º de Secundaria'
  };

  document.getElementById('gradeTitle').textContent = names[grade] || 'Secundaria';
  document.getElementById('gradeBadge').textContent = grade + '.º';

  let items = [];
  try{
    items = (await getMaterials()).filter(x=>x.grado===grade);
  }catch(e){
    library.innerHTML='<div class="empty">No se pudo cargar el contenido.</div>';
    return;
  }

  const categories = ['clases','tareas','libros','practicas','evaluaciones'];
  categories.forEach(cat=>{
    const n = document.querySelector(`[data-count="${cat}"]`);
    if(n) n.textContent = items.filter(x=>x.categoria===cat).length;
  });

  function render(cat){
    const filtered = items.filter(x=>x.categoria===cat);
    if(!filtered.length){
      library.innerHTML='<div class="empty">Todavía no hay contenido publicado en esta sección.</div>';
      return;
    }

    library.innerHTML = filtered.map(x=>{
      const href = x.tipoArchivo==='pdf'
        ? `visor.html?file=${encodeURIComponent(x.enlace)}&title=${encodeURIComponent(x.titulo)}&g=${grade}`
        : x.enlace;

      return `<article class="resource" data-course="${x.curso}">
        <div class="icon">${x.icono||'📄'}</div>
        <div>
          <small>${x.curso} · ${x.tipo}</small>
          <h3>${x.titulo}</h3>
          <p>${x.descripcion||''}</p>
        </div>
        <a href="${href}">${x.accion||'Abrir →'}</a>
      </article>`;
    }).join('');
  }

  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    render(tab.dataset.category);
  }));

  render('clases');
}

document.addEventListener('DOMContentLoaded',initGradePage);
