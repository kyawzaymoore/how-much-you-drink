(function () {
  const STORAGE_KEY = 'how-much-you-drink:people';

  const form = document.getElementById('add-form');
  const nameInput = document.getElementById('name-input');
  const list = document.getElementById('people');
  const totalEl = document.getElementById('total');
  const emptyEl = document.getElementById('empty');
  const resetBtn = document.getElementById('reset-btn');

  let people = load();

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch (e) {
      // Storage unavailable (e.g. private mode); counts still work for this visit.
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addPerson(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = people.some(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(trimmed + ' is already on the list.');
      return;
    }
    people.push({ id: newId(), name: trimmed, count: 0 });
    save();
    render();
  }

  function changeCount(id, delta) {
    const person = people.find(p => p.id === id);
    if (!person) return;
    person.count = Math.max(0, person.count + delta);
    save();
    render();
  }

  function removePerson(id) {
    const person = people.find(p => p.id === id);
    if (!person || !confirm('Remove ' + person.name + '?')) return;
    people = people.filter(p => p.id !== id);
    save();
    render();
  }

  function resetAll() {
    if (!confirm('Reset everyone\'s count to 0?')) return;
    people.forEach(p => { p.count = 0; });
    save();
    render();
  }

  function beerIcons(count) {
    if (count === 0) return 'No beers yet';
    if (count > 12) return '🍺'.repeat(12) + ' +' + (count - 12);
    return '🍺'.repeat(count);
  }

  function rankIcon(index, count) {
    if (count === 0) return '';
    return ['🥇', '🥈', '🥉'][index] || (index + 1);
  }

  function button(className, text, title, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = text;
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.addEventListener('click', onClick);
    return btn;
  }

  function render() {
    // Leaderboard: most beers first, ties keep the order people were added.
    const sorted = people
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p.count - a.p.count || a.i - b.i)
      .map(x => x.p);

    list.innerHTML = '';
    sorted.forEach((person, index) => {
      const li = document.createElement('li');

      const rank = document.createElement('div');
      rank.className = 'rank';
      rank.textContent = rankIcon(index, person.count);

      const info = document.createElement('div');
      info.className = 'info';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = person.name;
      const beers = document.createElement('div');
      beers.className = 'beers';
      beers.textContent = beerIcons(person.count);
      info.append(name, beers);

      const count = document.createElement('div');
      count.className = 'count';
      count.textContent = person.count;

      li.append(
        rank,
        info,
        button('small', '−', 'Remove one beer from ' + person.name, () => changeCount(person.id, -1)),
        count,
        button('plus', '+1 🍺', 'Add one beer for ' + person.name, () => changeCount(person.id, 1)),
        button('small del', '✕', 'Remove ' + person.name, () => removePerson(person.id))
      );
      list.appendChild(li);
    });

    const total = people.reduce((sum, p) => sum + p.count, 0);
    totalEl.textContent = total;
    emptyEl.hidden = people.length > 0;
    resetBtn.hidden = total === 0;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    addPerson(nameInput.value);
    nameInput.value = '';
    nameInput.focus();
  });

  resetBtn.addEventListener('click', resetAll);

  render();
})();
