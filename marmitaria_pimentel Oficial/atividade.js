// Marmitaria Pimentel - funções compartilhadas entre as páginas
const deliveryFee = 5.00;
let clientData = JSON.parse(localStorage.getItem('pimentelClientData') || '{"name":"","phone":"","address":""}');
let cart = JSON.parse(localStorage.getItem('pimentelCart') || '[]');

function persistState() {
  localStorage.setItem('pimentelClientData', JSON.stringify(clientData));
  localStorage.setItem('pimentelCart', JSON.stringify(cart));
}

function saveClientData(event) {
  event.preventDefault();
  clientData = {
    name: document.getElementById('client-name').value.trim(),
    phone: document.getElementById('client-phone').value.trim(),
    address: document.getElementById('client-address').value.trim()
  };
  persistState();
  alert(`Cadastro realizado com sucesso, ${clientData.name}! Redirecionando para o cardápio...`);
  window.location.href = 'cardapio.html';
}

function addToCart(title, price) {
  const existing = cart.find(item => item.title === title);
  if (existing) existing.quantity += 1;
  else cart.push({title, price, quantity: 1});
  persistState();
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  if (countEl) countEl.innerText = cart.reduce((sum,item) => sum + item.quantity, 0);
  if (itemsEl) {
    if (!cart.length) itemsEl.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
    else itemsEl.innerHTML = cart.map(item =>
      `<div class="cart-item-row"><span>${item.title} (x${item.quantity})</span><span>R$ ${(item.price*item.quantity).toFixed(2).replace('.', ',')}</span></div>`
    ).join('');
  }
  calculateTotal();
}

function calculateTotal() {
  const totalEl = document.getElementById('cart-total');
  if (!totalEl) return;
  const selected = document.querySelector('input[name="orderType"]:checked');
  const subtotal = cart.reduce((sum,item) => sum + item.price*item.quantity, 0);
  const total = subtotal + (selected && selected.value === 'entrega' && cart.length ? deliveryFee : 0);
  totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
  updateCartUI();
}

function checkoutWhatsApp() {
  if (!cart.length) { alert('Seu carrinho está vazio!'); return; }
  const selected = document.querySelector('input[name="orderType"]:checked');
  const orderType = selected ? selected.value : 'retirada';
  let message = '*--- NOVO PEDIDO: MARMITARIA PIMENTEL ---*\\n\\n';
  if (clientData.name) {
    message += `*Cliente:* ${clientData.name}\\n*Telefone:* ${clientData.phone}\\n\\n`;
  }
  message += '*Itens do Pedido:*\\n';
  cart.forEach(item => message += `• ${item.title} (x${item.quantity}) - R$ ${(item.price*item.quantity).toFixed(2).replace('.', ',')}\\n`);
  const subtotal = cart.reduce((sum,item) => sum + item.price*item.quantity, 0);
  message += `\\n*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (orderType === 'entrega') {
    message += `\\n*Taxa de Entrega (Motoboy):* R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    message += `\\n*Total:* R$ ${(subtotal+deliveryFee).toFixed(2).replace('.', ',')}`;
    message += '\\n\\n*Modalidade:* ENTREGA VIA MOTOBOY';
    if (clientData.address) message += `\\n*Endereço:* ${clientData.address}`;
  } else {
    message += `\\n*Total:* R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    message += '\\n\\n*Modalidade:* RETIRADA NA LOJA FÍSICA';
  }
  // Troque pelo WhatsApp real da Marmitaria (país + DDD + número).
  const phone = '5511999999999';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  const name = document.getElementById('client-name');
  const phone = document.getElementById('client-phone');
  const address = document.getElementById('client-address');
  if (name) name.value = clientData.name || '';
  if (phone) phone.value = clientData.phone || '';
  if (address) address.value = clientData.address || '';
  updateCartUI();
});
