const contactUrl = 'https://t.me/FORI_FLL';

function telegramDraft(message) {
  return contactUrl + '?text=' + encodeURIComponent(message);
}

document.querySelectorAll('[data-draft]').forEach((link) => {
  link.href = telegramDraft(link.dataset.draft);
});

document.querySelectorAll('.service-item').forEach((item) => {
  const service = item.querySelector('.service-trigger strong').textContent;
  item.querySelector('.service-body a').href = telegramDraft('Артём, здравствуйте! Хочу обсудить услугу «' + service + '».');
});

const cases = {
  refformat: {
    preview: 'work/refformat/index.html?v=original',
    description: 'Демо сайта стоматологии с записью на приём. Расписание в проекте демонстрационное.',
    features: ['Интерактивный 3D-элемент на первом экране', 'Выбор врача и свободного времени', 'Админ-панель для заявок, записей и расписания врачей'],
  },
  apartment: {
    preview: 'work/apartment/index.html',
    description: 'Концепт сайта посуточной аренды квартир с интерактивной сценой. Бронирование работает в режиме демо.',
    features: ['Интерактивные 3D-здания', 'Каталог и карточки квартир', 'Форма бронирования без отправки данных'],
  },
  baikal: {
    preview: 'work/baikal/index.html',
    description: 'Сайт тура по Байкалу, где можно изучить программу, посмотреть отзывы и полистать открытки.',
    features: ['Страница с программой тура', 'Отзывы из Telegram', 'Горизонтальная галерея открыток с поддержкой свайпа'],
  },
  semka: {
    preview: 'work/semka/index.html',
    description: 'Сайт-портфолио фотографа Семёна. В центре сайта — серии снимков и способы их просмотра.',
    features: ['Галерея работ', 'Анимированная фотолента', 'Адаптивная версия для телефона'],
  },
};

const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
const filterStatus = document.querySelector('#filter-status');
const dialog = document.querySelector('#case-dialog');
const caseTitle = document.querySelector('#case-title');
const caseType = document.querySelector('#case-type');
const caseImage = document.querySelector('#case-image');
const caseDescription = document.querySelector('#case-description');
const caseFeatures = document.querySelector('#case-features');
const caseContact = document.querySelector('#case-contact');

const search = document.querySelector('#project-search');
const sort = document.querySelector('#project-sort');
const listing = document.querySelector('.projects');
const listHeader = document.querySelector('.list-header');
const views = [...document.querySelectorAll('[name="view"]')];
const previous = document.querySelector('#previous-case');
const next = document.querySelector('#next-case');
const titleOf = (project) => project.querySelector('strong').textContent;
const featuredProject = projects.find((project) => project.querySelector('[data-case="apartment"]'));
let visibleProjects = projects;
let currentCase = 0;
let caseSequence = [];
const caseBody = dialog.querySelector('.dialog-body');
const previewFrame = document.querySelector('#case-frame');
const previewButton = document.querySelector('#case-demo');
const overviewButton = document.querySelector('#case-overview');
let previewUrl;

function setCaseView(preview) {
  overviewButton.setAttribute('aria-pressed', String(!preview));
  previewButton.setAttribute('aria-pressed', String(preview));
  dialog.classList.toggle('showing-preview', preview);
  previewFrame.hidden = !preview;
  caseImage.hidden = preview;
  caseBody.hidden = preview;
  if (preview && previewFrame.getAttribute('src') !== previewUrl) previewFrame.src = previewUrl;
}

overviewButton.addEventListener('click', () => setCaseView(false));
previewButton.addEventListener('click', () => setCaseView(true));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const galleryDetails = document.querySelector('.gallery-details');
const galleryType = document.querySelector('#gallery-type');
const galleryTitle = document.querySelector('#gallery-title');
const galleryDescription = document.querySelector('#gallery-description');
const galleryFeatures = document.querySelector('#gallery-features');
const galleryOpen = document.querySelector('#gallery-open');
const galleryPrevious = document.querySelector('#gallery-prev');
const galleryNext = document.querySelector('#gallery-next');
const gallery = document.querySelector('.work-gallery');
const gallerySelector = document.querySelector('.gallery-selector');
const galleryProjects = document.querySelector('#gallery-projects');
const galleryNav = document.querySelector('.gallery-nav');
const galleryScreen = document.querySelector('.gallery-screen');
const galleryFrame = document.querySelector('#gallery-frame');
const screenName = document.querySelector('#screen-name');
let screenUrl;
const screenViewport = galleryFrame.parentElement;
const deviceButtons = [...document.querySelectorAll('[data-device]')];

function fitScreen() {
  const phone = galleryScreen.classList.contains('phone-preview');
  const width = screenViewport.clientWidth;
  const height = screenViewport.clientHeight;
  const scale = phone ? Math.min(width / 390, height / 760) : width / 1120;
  galleryFrame.style.setProperty('--frame-scale', scale);
  galleryFrame.style.setProperty('--frame-offset', phone ? (width - 390 * scale) / 2 + 'px' : '0px');
}
new ResizeObserver(fitScreen).observe(screenViewport);
deviceButtons.forEach((button) => button.addEventListener('click', () => {
  deviceButtons.forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
  galleryScreen.classList.toggle('phone-preview', button.dataset.device === 'phone');
  fitScreen();
}));

galleryFrame.addEventListener('load', () => {
  if (galleryFrame.getAttribute('src') === screenUrl) galleryScreen.classList.add('frame-ready');
});
function loadGalleryFrame() {
  if (!screenUrl || dialog.open || galleryFrame.getAttribute('src') === screenUrl) return;
  galleryScreen.classList.remove('frame-ready');
  galleryFrame.src = screenUrl;
}
let galleryVisible = false;
new IntersectionObserver(([entry]) => {
  galleryVisible = entry.isIntersecting;
  if (galleryVisible) loadGalleryFrame();
}, { rootMargin: '100px' }).observe(gallery);
let galleryIndex = 0;

function updateGallery() {
  const active = visibleProjects[galleryIndex];
  visibleProjects.forEach((project, index) => {
    const position = (index - galleryIndex + visibleProjects.length) % visibleProjects.length;
    project.style.setProperty('--position', position);
    project.toggleAttribute('data-current', project === active);
    project.inert = !listing.classList.contains('list-view') && position !== 0;
  });
  const showScreen = Boolean(active) && !listing.classList.contains('list-view');
  galleryScreen.hidden = !showScreen;
  if (!showScreen) {
    screenUrl = undefined;
    galleryFrame.removeAttribute('src');
  }
  [...galleryProjects.children].forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === galleryIndex));
  });
  if (!active) return;
  const button = active.querySelector('[data-case]');
  const project = cases[button.dataset.case];
  const selectedTitle = titleOf(active);
  const changed = galleryTitle.textContent !== selectedTitle;
  galleryTitle.textContent = selectedTitle;
  if (showScreen) {
    screenName.textContent = selectedTitle;
    const cover = button.querySelector('img').getAttribute('src');
    screenViewport.style.setProperty('--cover', 'url("' + cover + '")');
    screenUrl = button.dataset.case === 'semka' ? project.preview + '?cover=1' : project.preview;
    if (galleryVisible) loadGalleryFrame();
  }
  galleryType.textContent = button.querySelector('.type').textContent;
  galleryDescription.textContent = project.description;
  galleryFeatures.replaceChildren(...project.features.map((feature) => {
    const item = document.createElement('li');
    item.textContent = feature;
    return item;
  }));
  if (changed && showScreen && !reduceMotion.matches) {
    const copy = galleryDetails.querySelector('.gallery-copy');
    [galleryScreen, copy].forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel());
      element.animate([{ opacity: .35, translate: '0 12px' }, { opacity: 1, translate: '0 0' }],
        { duration: 520, easing: 'cubic-bezier(.18,.7,.25,1)' });
    });
  }
  galleryPrevious.disabled = galleryNext.disabled = visibleProjects.length < 2;
}

function moveGallery(step) {
  galleryIndex = (galleryIndex + step + visibleProjects.length) % visibleProjects.length;
  updateGallery();
}

galleryPrevious.addEventListener('click', () => moveGallery(-1));
galleryNext.addEventListener('click', () => moveGallery(1));
gallery.addEventListener('keydown', (event) => {
  if (!gallery.classList.contains('has-stack') || visibleProjects.length < 2) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    moveGallery(event.key === 'ArrowLeft' ? -1 : 1);
    if (event.target.closest('.projects')) galleryOpen.focus({ preventScroll: true });
  }
});
let swipeStart;
listing.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') swipeStart = [event.clientX, event.clientY];
});
listing.addEventListener('pointercancel', () => { swipeStart = undefined; });
listing.addEventListener('pointerup', (event) => {
  if (!swipeStart || event.pointerType !== 'touch') return;
  const dx = event.clientX - swipeStart[0];
  const dy = event.clientY - swipeStart[1];
  swipeStart = undefined;
  if (!gallery.classList.contains('has-stack') || Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
  const suppressClick = (click) => click.stopPropagation();
  listing.addEventListener('click', suppressClick, { capture: true, once: true });
  setTimeout(() => listing.removeEventListener('click', suppressClick, true), 0);
  moveGallery(dx < 0 ? 1 : -1);
});
galleryOpen.addEventListener('click', () => {
  caseSequence = visibleProjects;
  showCase(galleryIndex);
});

function updateCatalog() {
  const category = filters.find((filter) => filter.getAttribute('aria-pressed') === 'true').dataset.filter;
  const query = search.value.trim().toLocaleLowerCase('ru');
  const ordered = [...projects];
  if (sort.value === 'title') ordered.sort((a, b) => titleOf(a).localeCompare(titleOf(b), 'ru'));
  visibleProjects = ordered.filter((project) => {
    const button = project.querySelector('[data-case]');
    const description = cases[button.dataset.case].description;
    return (category === 'all' || project.dataset.category === category) &&
      (titleOf(project) + ' ' + button.querySelector('.type').textContent + ' ' + description)
        .toLocaleLowerCase('ru').includes(query);
  });
  const isList = views.find((view) => view.checked).value === 'list';
  listing.classList.toggle('list-view', isList);
  gallery.classList.toggle('has-stack', !isList && Boolean(visibleProjects.length));
  galleryDetails.hidden = isList || !visibleProjects.length;
  gallerySelector.hidden = galleryDetails.hidden;
  galleryNav.hidden = galleryDetails.hidden || visibleProjects.length < 2;
  galleryProjects.replaceChildren(...visibleProjects.map((project, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button outline';
    button.textContent = titleOf(project);
    button.addEventListener('click', () => {
      galleryIndex = index;
      updateGallery();
    });
    return button;
  }));
  listHeader.hidden = !isList || !visibleProjects.length;
  ordered.forEach((project) => {
    project.hidden = !visibleProjects.includes(project);
    listing.append(project);
  });
  galleryIndex = Math.max(0, visibleProjects.indexOf(featuredProject));
  updateGallery();
  filterStatus.classList.toggle('sr-only', Boolean(visibleProjects.length));
  filterStatus.textContent = visibleProjects.length ? 'Найдено проектов: ' + visibleProjects.length :
    'Проекты не найдены. Попробуйте другой запрос или категорию.';
}

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
    updateCatalog();
  });
});
search.addEventListener('input', updateCatalog);
sort.addEventListener('change', updateCatalog);
views.forEach((view) => view.addEventListener('change', updateCatalog));

const burn = dialog.querySelector('.case-burn');
const caseContent = dialog.querySelector('.case-content');
const closeCase = dialog.querySelector('form button');
let burnAnimation;

function renderCase(index) {
  currentCase = index;
  const button = caseSequence[index].querySelector('[data-case]');
  const project = cases[button.dataset.case];
  previewUrl = project.preview;
  previewButton.hidden = !previewUrl;
  if (previewFrame.getAttribute('src') !== previewUrl) previewFrame.removeAttribute('src');
  setCaseView(Boolean(previewUrl));
  caseTitle.textContent = titleOf(caseSequence[index]);
  caseContact.href = telegramDraft('Артём, здравствуйте! Посмотрел кейс «' + caseTitle.textContent + '» и хочу обсудить похожий проект.');
  document.querySelector('#case-name').textContent = caseTitle.textContent;
  dialog.setAttribute('aria-label', caseTitle.textContent);
  caseType.textContent = button.querySelector('.type').textContent;
  caseImage.src = button.querySelector('img').src;
  caseDescription.textContent = project.description;
  caseFeatures.replaceChildren(...project.features.map((feature) => {
    const item = document.createElement('li');
    item.textContent = feature;
    return item;
  }));
  if ((index === 0 && document.activeElement === previous) ||
      (index === caseSequence.length - 1 && document.activeElement === next)) closeCase.focus();
  previous.disabled = index === 0;
  next.disabled = index === caseSequence.length - 1;
  previous.title = previous.disabled ? '' : titleOf(caseSequence[index - 1]);
  next.title = next.disabled ? '' : titleOf(caseSequence[index + 1]);
  previewFrame.title = previewButton.textContent + ' ' + caseTitle.textContent;
  caseContent.scrollTop = 0;
}

async function showCase(index, direction = 1) {
  if (burnAnimation || !caseSequence[index]) return;
  const opening = !dialog.open;
  if (opening) {
    renderCase(index);
    dialog.showModal();
    galleryScreen.classList.remove('frame-ready');
    galleryFrame.removeAttribute('src');
    closeCase.focus({ preventScroll: true });
  }
  if (reduceMotion.matches || !burn.animate) {
    if (!opening) renderCase(index);
    return;
  }

  // The opaque layer hides the content swap. Its torn edge then uncovers the case.
  burn.hidden = false;
  burn.classList.toggle('reverse', direction < 0);
  const travel = direction < 0 ? '-116%' : '116%';
  const approach = direction < 0 ? '116%' : '-116%';
  caseContent.inert = true;
  try {
    if (!opening) {
      burnAnimation = burn.animate([{ translate: approach + ' 0' }, { translate: '0 0' }],
        { duration: 240, easing: 'ease-in', fill: 'forwards' });
      await burnAnimation.finished;
      renderCase(index);
    }
    const cover = burnAnimation;
    burnAnimation = burn.animate([{ translate: '0 0' }, { translate: travel + ' 0' }],
      { duration: 780, easing: 'cubic-bezier(.38,.05,.23,1)', fill: 'both' });
    cover?.cancel();
    await burnAnimation.finished;
  } catch {
    // Closing the dialog cancels the transition.
  } finally {
    burn.hidden = true;
    burnAnimation?.cancel();
    burnAnimation = undefined;
    caseContent.inert = false;
  }
}

dialog.addEventListener('close', () => {
  burnAnimation?.cancel();
  previewFrame.removeAttribute('src');
  setCaseView(false);
  if (galleryVisible) loadGalleryFrame();
});

projects.forEach((project) => {
  project.querySelector('button').addEventListener('click', () => {
    caseSequence = visibleProjects;
    showCase(caseSequence.indexOf(project));
  });
});
previous.addEventListener('click', () => showCase(currentCase - 1, -1));
next.addEventListener('click', () => showCase(currentCase + 1, 1));
updateCatalog();

const hero = document.querySelector('.hero');
const starStage = hero.querySelector('.launch-stage');
const sky = hero.querySelector('.hero-sky');
const skyContext = sky.getContext('2d');
if (skyContext) {
  const stars = Array.from({ length: 250 }, (_, index) => {
    const x = Math.random();
    const y = index < 95
      ? .84 - x * .65 + (Math.random() + Math.random() - 1) * .28
      : Math.random();
    return { x, y, depth: Math.random(), alpha: .14 + Math.random() * .65 };
  });
  const target = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };
  let pointer;
  let meteor;
  let frame = 0;
  let width = 0;
  let height = 0;

  function draw(time) {
    frame = 0;
    offset.x += (target.x - offset.x) * .12;
    offset.y += (target.y - offset.y) * .12;
    skyContext.clearRect(0, 0, width, height);
    for (const star of stars) {
      const x = star.x * width + offset.x * star.depth;
      const y = star.y * height + offset.y * star.depth;
      const proximity = pointer ? Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 125) : 0;
      const radius = .45 + star.depth ** 3 * .95 + proximity * 1.65;
      skyContext.globalAlpha = Math.min(1, star.alpha + proximity * .65);
      skyContext.fillStyle = star.depth > .7 ? '#b1d2ff' : '#f4f7ff';
      skyContext.beginPath();
      skyContext.arc(x, y, radius, 0, Math.PI * 2);
      skyContext.fill();
      if (star.depth > .97) {
        skyContext.globalAlpha *= .46;
        skyContext.fillRect(x - radius * 2.6, y - .3, radius * 5.2, .6);
        skyContext.fillRect(x - .3, y - radius * 2.6, .6, radius * 5.2);
      }
    }
    skyContext.globalAlpha = 1;
    if (meteor) {
      const progress = Math.max(0, Math.min(1, (time - meteor.start) / 1050));
      const x = meteor.x + meteor.direction * width * .37 * progress;
      const y = meteor.y + height * .22 * progress;
      const tailX = x - meteor.direction * Math.min(175, width * .33);
      const tailY = y - 66;
      const trail = skyContext.createLinearGradient(tailX, tailY, x, y);
      trail.addColorStop(0, '#6f9eff00');
      trail.addColorStop(.72, '#71a8ffbf');
      trail.addColorStop(1, '#eff7ff');
      skyContext.globalAlpha = Math.sin(progress * Math.PI) ** .65;
      skyContext.strokeStyle = trail;
      skyContext.lineWidth = 2.5;
      skyContext.beginPath();
      skyContext.moveTo(tailX, tailY);
      skyContext.lineTo(x, y);
      skyContext.stroke();
      skyContext.fillStyle = '#eaf5ff';
      skyContext.beginPath();
      skyContext.arc(x, y, 2.6, 0, Math.PI * 2);
      skyContext.fill();
      skyContext.globalAlpha = 1;
      if (progress === 1) meteor = undefined;
    }
    if (meteor || Math.hypot(target.x - offset.x, target.y - offset.y) > .15) scheduleSky();
  }

  function scheduleSky() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function skyPoint(event) {
    const bounds = sky.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function releaseSky() {
    pointer = undefined;
    target.x = target.y = 0;
    scheduleSky();
  }

  function shoot(point) {
    if (reduceMotion.matches || !width || !height) return;
    meteor = { ...point, direction: point.x > width * .57 ? -1 : 1, start: performance.now() };
    scheduleSky();
  }

  hero.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches || event.pointerType === 'touch' || !width || !height) return;
    pointer = skyPoint(event);
    target.x = (pointer.x / width - .5) * 64;
    target.y = (pointer.y / height - .5) * 48;
    scheduleSky();
  }, { passive: true });
  hero.addEventListener('pointerleave', releaseSky);
  hero.addEventListener('click', (event) => {
    if (!event.target.closest('a, button') && window.getSelection()?.isCollapsed) shoot(skyPoint(event));
  });
  function updateSkyMotion() {
    if (!reduceMotion.matches) return;
    meteor = undefined;
    offset.x = offset.y = 0;
    releaseSky();
  }
  reduceMotion.addEventListener('change', updateSkyMotion);
  updateSkyMotion();

  new ResizeObserver(([entry]) => {
    ({ width, height } = entry.contentRect);
    const density = Math.min(devicePixelRatio, 2);
    sky.width = Math.ceil(width * density);
    sky.height = Math.ceil(height * density);
    skyContext.setTransform(density, 0, 0, density, 0, 0);
    scheduleSky();
  }).observe(sky);
}

const wall = document.querySelector('.project-wall');
const wallCards = wall.querySelector('.wall-cards');
function makeProjectCard(project, className, loading) {
  const card = project.querySelector('button').cloneNode(true);
  card.className = className;
  card.setAttribute('aria-label', 'Полистать сайт ' + titleOf(project));
  card.querySelector('img').loading = loading;
  card.querySelector('.open').remove();
  card.addEventListener('click', () => {
    caseSequence = projects;
    showCase(projects.indexOf(project));
  });
  return card;
}
wallCards.append(...projects.map((project) => makeProjectCard(project, 'wall-card', 'lazy')));
const introScreen = document.querySelector('#site-intro');
const skipIntro = document.querySelector('#skip-intro');
const pauseIntro = document.querySelector('#pause-intro');
const introProgress = introScreen.querySelector('.intro-track > div');
let hasSeenIntro = false;
try {
  hasSeenIntro = sessionStorage.getItem('fori-intro') === 'seen';
} catch {
  // The intro still works when storage is unavailable.
}
const replayIntro = new URLSearchParams(location.search).get('intro') === '1';
if (introProgress.animate && !reduceMotion.matches && (replayIntro || (!location.hash && !hasSeenIntro))) {
  const reel = introScreen.querySelector('.intro-reel');
  projects.forEach((project, index) => {
    const shot = document.createElement('div');
    const image = project.querySelector('img').cloneNode();
    const caption = document.createElement('span');
    shot.className = 'intro-shot';
    shot.style.setProperty('--shot-index', index);
    image.loading = 'eager';
    const isDemo = project.querySelector('.type').textContent.startsWith('Демо');
    caption.textContent = titleOf(project) + (isDemo ? ' · Демо' : '');
    shot.append(image, caption);
    reel.append(shot);
  });
  introScreen.hidden = false;
  const pageContent = document.querySelectorAll('body > header, body > main, body > footer');
  pageContent.forEach((element) => { element.inert = true; });
  skipIntro.focus({ preventScroll: true });

  const timing = introProgress.animate([{ scale: '0 1' }, { scale: '1 1' }], {
    duration: projects.length * 1100,
    fill: 'both',
  });
  timing.onfinish = finishIntro;
  reduceMotion.addEventListener('change', finishIntro, { once: true });
  skipIntro.addEventListener('click', finishIntro, { once: true });
  introScreen.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finishIntro();
  });
  pauseIntro.addEventListener('click', () => {
    const paused = introScreen.classList.toggle('intro-paused');
    pauseIntro.textContent = paused ? 'Продолжить' : 'Пауза';
    if (paused) timing.pause();
    else timing.play();
  });

  function finishIntro() {
    if (introScreen.classList.contains('intro-exit')) return;
    timing.cancel();
    reduceMotion.removeEventListener('change', finishIntro);
    try {
      sessionStorage.setItem('fori-intro', 'seen');
    } catch {
      // Storage is optional for the intro.
    }
    introScreen.classList.add('intro-exit');
    introScreen.inert = true;
    if (!reduceMotion.matches) hero.classList.add('hero-enter');
    window.setTimeout(() => {
      introScreen.hidden = true;
      pageContent.forEach((element) => { element.inert = false; });
      document.querySelector('.masthead .brand').focus({ preventScroll: true });
    }, reduceMotion.matches ? 0 : 740);
  }
} else if (!reduceMotion.matches && (!location.hash || location.hash === '#top')) {
  hero.classList.add('hero-enter');
}

const masthead = document.querySelector('.masthead');
const menuToggle = document.querySelector('.portfolio-menu-toggle');
const siteMenu = document.querySelector('#portfolio-menu');
const menuPanel = siteMenu.querySelector('.portfolio-menu-panel');
const sectionLinks = [...siteMenu.querySelectorAll('nav a')];
let menuOpening = [];
let menuClosing = false;

menuToggle.addEventListener('click', () => {
  siteMenu.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
  if (reduceMotion.matches || !siteMenu.animate) return;
  const timing = { duration: 440, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'backwards' };
  menuOpening = [
    siteMenu.animate([{ opacity: 0 }, { opacity: 1 }], timing),
    menuPanel.animate([{ translate: '0 16px' }, { translate: '0 0' }], timing),
  ];
});

async function closeMenu(afterClose) {
  if (!siteMenu.open || menuClosing) return;
  menuClosing = true;
  if (!reduceMotion.matches && siteMenu.animate) {
    const opacity = getComputedStyle(siteMenu).opacity;
    const translate = getComputedStyle(menuPanel).translate;
    menuOpening.forEach((animation) => animation.cancel());
    const timing = { duration: 280, easing: 'cubic-bezier(.4,0,.45,1)', fill: 'both' };
    const fade = siteMenu.animate([{ opacity }, { opacity: 0 }], timing);
    const move = menuPanel.animate([{ translate }, { translate: '0 10px' }], timing);
    await Promise.allSettled([fade.finished, move.finished]);
    siteMenu.close();
    fade.cancel();
    move.cancel();
  } else {
    siteMenu.close();
  }
  menuToggle.setAttribute('aria-expanded', 'false');
  menuClosing = false;
  afterClose?.();
}

siteMenu.querySelector('[data-menu-close]').addEventListener('click', () => closeMenu());
siteMenu.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeMenu();
});
sectionLinks.forEach((link) => link.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  closeMenu(() => {
    const section = document.querySelector(link.hash);
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
    if (location.hash === link.hash) section.scrollIntoView();
    else location.hash = link.hash;
  });
}));

siteMenu.querySelectorAll('[data-menu-case]').forEach((button) => {
  button.addEventListener('click', () => closeMenu(() => {
    caseSequence = projects;
    const index = projects.findIndex((project) => project.querySelector('[data-case]').dataset.case === button.dataset.menuCase);
    showCase(index);
  }));
});

const services = [...document.querySelectorAll('.service-trigger')];
services.forEach((button) => button.addEventListener('click', () => {
  const activate = button.getAttribute('aria-expanded') !== 'true';
  services.forEach((service) => {
    const expanded = service === button && activate;
    service.setAttribute('aria-expanded', String(expanded));
    document.getElementById(service.getAttribute('aria-controls')).inert = !expanded;
  });
}));

const processTrack = document.querySelector('.process-track');
const mascot = processTrack.querySelector('.process-mascot');
const stops = [...processTrack.querySelectorAll('.step-icon')];
let stop = 0;
let direction = 1;
let hopTimer;
function placeMascot() {
  const target = stops[stop].getBoundingClientRect();
  const origin = processTrack.getBoundingClientRect();
  mascot.style.left = target.left - origin.left + target.width / 2 + 'px';
  mascot.style.top = target.top - origin.top + 'px';
}
new ResizeObserver(placeMascot).observe(processTrack);
new IntersectionObserver(([entry]) => {
  clearInterval(hopTimer);
  if (!entry.isIntersecting || reduceMotion.matches) return;
  hopTimer = setInterval(() => {
    if (reduceMotion.matches) return;
    stop += direction;
    if (stop === 0 || stop === stops.length - 1) direction *= -1;
    placeMascot();
    mascot.animate([{ translate: '-50% -100%' }, { translate: '-50% calc(-100% - 25px)' }, { translate: '-50% -100%' }],
      { duration: 700, easing: 'ease-in-out' });
  }, 1800);
}, { threshold: .2 }).observe(processTrack);

const pageSections = sectionLinks.map((link) => document.querySelector(link.hash));
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('revealed');
      reveal.unobserve(target);
    });
  }, { threshold: .08 });
  document.querySelectorAll('.wall-heading, .wall-card, .section-top, .work-gallery, .services-heading, .service-item, .service-list details, .process h2, .steps li, .faq-title, .about > div, .project-contact > div')
    .forEach((element) => {
      element.classList.add('reveal');
      reveal.observe(element);
    });
}
function updateCurrentSection() {
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const current = atBottom ? pageSections.at(-1) :
    pageSections.filter((section) => section.getBoundingClientRect().top <= 125).at(-1);
  sectionLinks.forEach((link) => {
    if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateCurrentSection, { passive: true });
window.addEventListener('resize', updateCurrentSection);
updateCurrentSection();

const bridge = document.querySelector('.portfolio-bridge');
const bridgeStage = bridge.querySelector('.bridge-stage');
function flightPhase(progress, start, end) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return value * value * (3 - 2 * value);
}

let lastStarProgress;
function paintStarFlight() {
  const bounds = starStage.getBoundingClientRect();
  const center = window.scrollY + bounds.top + bounds.height / 2;
  const start = Math.max(12, center - innerHeight * .61);
  const distance = Math.min(420, Math.max(245, innerHeight * .48));
  const progress = reduceMotion.matches ? 0 : Math.max(0, Math.min(1, (window.scrollY - start) / distance));
  if (progress === lastStarProgress) return;
  lastStarProgress = progress;

  const charge = flightPhase(progress, 0, .17) * (1 - flightPhase(progress, .2, .5));
  const flight = flightPhase(progress, .12, .91);
  const rays = flightPhase(progress, .13, .38) * (1 - flightPhase(progress, .54, .98));
  const wave = flightPhase(progress, .08, .26) * (1 - flightPhase(progress, .3, .86));
  const afterglow = flightPhase(progress, .52, .73) * (1 - flightPhase(progress, .81, 1));
  starStage.style.setProperty('--flight-drop', 86 * flight + 'px');
  starStage.style.setProperty('--star-scale', 1 + .09 * charge - .974 * flight);
  starStage.style.setProperty('--star-turn', 100 * flight + 'deg');
  starStage.style.setProperty('--star-opacity', 1 - flightPhase(progress, .79, 1));
  starStage.style.setProperty('--star-light', 1 + .72 * charge);
  starStage.style.setProperty('--trail-scale', .6 + 1.45 * flight);
  starStage.style.setProperty('--trail-opacity', rays);
  starStage.style.setProperty('--wave-scale', .44 + 1.8 * progress);
  starStage.style.setProperty('--wave-opacity', wave);
  starStage.style.setProperty('--afterglow', afterglow);
}

let scrollFrame;
function paintScroll() {
  scrollFrame = undefined;
  paintStarFlight();
  if (!reduceMotion.matches) {
    const range = bridge.getBoundingClientRect();
    const pinnedTravel = range.height - bridgeStage.offsetHeight;
    const progress = Math.max(0, Math.min(1, -range.top / Math.max(1, pinnedTravel)));
    const sweep = Math.max(0, Math.min(1, (progress - .05) / .68));
    bridge.style.setProperty('--burn-progress', sweep);
    bridge.classList.toggle('bridge-open', sweep > .97);
    const wallPosition = wall.getBoundingClientRect();
    if (wallPosition.bottom > 0 && wallPosition.top < innerHeight) {
      const wallProgress = (innerHeight - wallPosition.top) / (innerHeight + wallPosition.height);
      wall.style.setProperty('--wall-drift', (wallProgress - .5) * 56 + 'px');
    }
  }
  const pageRange = document.documentElement.scrollHeight - innerHeight;
  masthead.style.setProperty('--reading-progress', pageRange > 0 ? window.scrollY / pageRange : 0);
}
function scheduleScrollPaint() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll);
}
window.addEventListener('scroll', scheduleScrollPaint, { passive: true });
window.addEventListener('resize', scheduleScrollPaint);
reduceMotion.addEventListener('change', scheduleScrollPaint);
paintScroll();
