/* ---------- ui helpers ---------- */
let undoFn = null,
  tt;
function toast(m, u) {
  $('#tmsg').textContent = m;
  undoFn = u;
  $('#tundo').hidden = !u;
  $('#toast').classList.add('on');
  clearTimeout(tt);
  tt = setTimeout(() => $('#toast').classList.remove('on'), 5000);
}
$('#tundo').onclick = () => {
  if (undoFn) undoFn();
  $('#toast').classList.remove('on');
};
function modal(h) {
  $('#mbox').innerHTML = h;
  $('#modal').classList.add('on');
}
const closeM = () => $('#modal').classList.remove('on');
$('#modal').addEventListener('click', e => {
  if (e.target.id === 'modal') closeM();
});
$('#scaleT').innerHTML = SCALE.map(
  ([a, b, d]) => `<tr><td class="n" style="text-align:left">${a}-${b}</td><td>${d}</td></tr>`
).join('');
const argOf = el => S && S.args.find(a => a.id === el.closest('[data-id]')?.dataset.id);
const clashOf = el => S && S.clashes.find(c => c.id === el.closest('[data-cid]')?.dataset.cid);
