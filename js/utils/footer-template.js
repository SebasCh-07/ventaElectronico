/**
 * Template del footer para reutilizar en todas las páginas
 */

function createFooterHTML(basePath = '') {
  return `
    <footer class="site-footer">
        <div class="container">
            <div class="footer-content">
                <!-- Logo y contacto principal -->
                <div class="footer-section">
                    <div class="footer-logo">
                        <h3>H&B<span class="web-badge">web</span></h3>
                        <p class="footer-tagline">Importaciones</p>
                    </div>
                    <div class="footer-contact">
                        <p><span data-icon="headphones" style="width:16px;height:16px;display:inline-block;vertical-align:-2px;margin-right:8px"></span>¿Necesitas ayuda? ¡Contáctanos!</p>
                        <p class="contact-phone"><strong>(+593) 099-484-6405</strong></p>
                    </div>
                    <div class="footer-address">
                        <h4>Visítanos</h4>
                        <p>Quito - Ecuador</p>
                        <p>Av. Amazonas y República</p>
                    </div>
                </div>

                <!-- Encuentra rápido -->
                <div class="footer-section">
                    <h4>Encuéntralo rápido</h4>
                    <ul class="footer-links">
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}user/store.html">Laptops & Computadores</a></li>
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}user/store.html">Monitores</a></li>
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}user/store.html">Componentes</a></li>
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}user/store.html">Celulares & Tablets</a></li>
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}user/store.html">TVs & Proyectores</a></li>
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}user/store.html">Gaming</a></li>
                    </ul>
                </div>

                <!-- Atención al cliente -->
                <div class="footer-section">
                    <h4>Atención al cliente</h4>
                    <ul class="footer-links">
                        <li><a href="${basePath}${basePath ? '../' : 'src/'}auth/login.html">Mi Cuenta</a></li>
                        <li><a href="#" onclick="window.Helpers?.showToast('Próximamente disponible', 'info') || alert('Próximamente disponible')">Rastrea tu orden</a></li>
                        <li><a href="#" onclick="window.Helpers?.showToast('Próximamente disponible', 'info') || alert('Próximamente disponible')">Contáctanos</a></li>
                        <li><a href="#" onclick="window.Helpers?.showToast('Próximamente disponible', 'info') || alert('Próximamente disponible')">Preguntas frecuentes</a></li>
                        <li><a href="#" onclick="window.Helpers?.showToast('Próximamente disponible', 'info') || alert('Próximamente disponible')">Términos y condiciones</a></li>
                        <li><a href="#" onclick="window.Helpers?.showToast('Próximamente disponible', 'info') || alert('Próximamente disponible')">Política de privacidad</a></li>
                    </ul>
                </div>

                <!-- Redes sociales -->
                <div class="footer-section">
                    <h4>Síguenos</h4>
                    <div class="social-links">
                        <a href="#" class="social-link" title="Facebook"><span data-icon="facebook" style="width:24px;height:24px"></span></a>
                        <a href="#" class="social-link" title="WhatsApp"><span data-icon="whatsapp" style="width:24px;height:24px"></span></a>
                        <a href="#" class="social-link" title="Instagram"><span data-icon="instagram" style="width:24px;height:24px"></span></a>
                        <a href="#" class="social-link" title="TikTok"><span data-icon="tiktok" style="width:24px;height:24px"></span></a>
                    </div>
                    <div class="footer-newsletter">
                        <h5>Newsletter</h5>
                        <p>Recibe ofertas exclusivas</p>
                        <div class="newsletter-form">
                            <input type="email" placeholder="Tu email" class="newsletter-input">
                            <button class="newsletter-btn" onclick="handleNewsletterSubscription()">
                                <span data-icon="arrow-right" style="width:16px;height:16px"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Copyright -->
            <div class="footer-bottom">
                <p>© <span class="footer-year">${new Date().getFullYear()}</span> H&B Importaciones. Todos los derechos reservados.</p>
                <p class="footer-tagline">Tecnología que impulsa tu éxito</p>
            </div>
        </div>
    </footer>
  `;
}

function handleNewsletterSubscription() {
  const input = document.querySelector('.newsletter-input');
  if (input && input.value.trim()) {
    if (window.Helpers && window.Helpers.showToast) {
      window.Helpers.showToast('¡Gracias por suscribirte a nuestro newsletter!', 'success');
    } else {
      alert('¡Gracias por suscribirte!');
    }
    input.value = '';
  } else {
    if (window.Helpers && window.Helpers.showToast) {
      window.Helpers.showToast('Por favor ingresa un email válido', 'warning');
    } else {
      alert('Por favor ingresa un email válido');
    }
  }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.createFooterHTML = createFooterHTML;
  window.handleNewsletterSubscription = handleNewsletterSubscription;
}
