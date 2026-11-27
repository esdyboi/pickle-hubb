const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const dateInput = $('#date');
dateInput.min = new Date().toISOString().slice(0, 10);
dateInput.value = dateInput.min;

const pickleballImages = {
  'Pickleball paddle and ball on a court': 'https://images.unsplash.com/photo-1665855031742-a87f5964adf1?auto=format&fit=crop&w=1200&q=85',
  'Indoor pickleball court': 'assets/pickleball-court-overhead.jpg',
  'Pickleball court net': 'assets/pickleball-action.jpg',
  'Outdoor sports court': 'assets/pickleball-court-action.jpg',
  'Pickleball paddles': 'assets/pickleball-paddle.png',
  Pickleballs: 'assets/pickleball-ball.png',
  'Paddle and pickleball set': 'assets/paddle-ball-set.png'
};

$$('img').forEach((image) => {
  if (pickleballImages[image.alt]) {
    image.src = pickleballImages[image.alt];
  }
});

// Remove the old template marker left inside the court selector.
$('.court-options').childNodes.forEach((node) => {
  if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('${')) {
    node.remove();
  }
});

const money = (amount) => `₱${amount.toLocaleString('en-PH')}`;
const selectedCourt = () => $('input[name="court"]:checked');
const equipmentTotal = () => $$('.add').reduce(
  (total, button) => total + (Number(button.dataset.qty) || 0) * Number(button.dataset.price),
  0
);

function updateTotal() {
  const courtTotal = Number(selectedCourt().dataset.price) * Number($('#duration').value);
  $('#total').textContent = money(courtTotal + equipmentTotal());
}

$$('input[name="court"], #duration').forEach((control) => {
  control.addEventListener('change', updateTotal);
});

$('.menu').addEventListener('click', () => {
  $('.navlinks').classList.toggle('open');
});

const toast = $('#toast');

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

$$('.add').forEach((button) => {
  button.addEventListener('click', () => {
    button.dataset.qty = (Number(button.dataset.qty) || 0) + 1;
    button.textContent = `Added ×${button.dataset.qty}`;
    button.style.background = '#789326';
    updateTotal();
    notify(`${button.dataset.name} added to your reservation`);
  });
});

$$('.select').forEach((button) => {
  button.addEventListener('click', () => {
    const courtOption = [...$$('input[name="court"]')].find(
      (input) => input.value === button.dataset.court
    );

    if (courtOption) {
      courtOption.checked = true;
      updateTotal();
    }

    $('#booking').scrollIntoView({ behavior: 'smooth' });
  });
});

let booking = {};

function openModal(selector) {
  $(selector).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(element) {
  element.closest('.modal-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function buildSummary() {
  const formattedDate = new Date(`${dateInput.value}T12:00:00`).toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const duration = Number($('#duration').value);
  const courtSubtotal = Number(selectedCourt().dataset.price) * duration;
  const equipment = $$('.add')
    .filter((button) => Number(button.dataset.qty))
    .map((button) => `${button.dataset.name} ×${button.dataset.qty}`)
    .join(', ') || 'No equipment added';

  booking = {
    date: formattedDate,
    duration,
    court: selectedCourt().value,
    time: $('input[name="time"]:checked').value,
    total: courtSubtotal + equipmentTotal()
  };

  $('#summary').innerHTML = `
    <b>${booking.court} · ${booking.date}</b><br>
    ${booking.time} for ${duration} hour${duration > 1 ? 's' : ''}<br>
    Equipment: ${equipment}<br>
    <b>Total: ${money(booking.total)}</b>
  `;
}

$('#booking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  buildSummary();
  openModal('#details');
});

$('#details-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const customerName = $('#name').value.trim();
  const reference = `PH-${Math.floor(100000 + Math.random() * 900000)}`;

  $('#ref').textContent = reference;
  $('#confirmation').innerHTML = `
    <b>${customerName}</b><br>
    ${booking.court} · ${booking.date}<br>
    ${booking.time} · ${booking.duration} hour${booking.duration > 1 ? 's' : ''}<br>
    <b>Paid (simulated): ${money(booking.total)}</b>
  `;

  closeModal($('#details .close'));
  openModal('#success');
});

$$('.close').forEach((button) => {
  button.addEventListener('click', () => closeModal(button));
});

$('.close-success').addEventListener('click', () => closeModal($('.close-success')));
$('#account-btn').addEventListener('click', () => {
  notify('Account sign-in is coming soon — book as a guest for now.');
});

$$('.modal-bg').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

