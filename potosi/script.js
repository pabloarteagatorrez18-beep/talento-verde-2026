const GOOGLE_SCRIPT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzR475n2GOl_DX_-M1MQDSaK4svzoBt9iAKAWcdzWqsG-1QB7wAYq8GlFNpTWekLPQ/exec";

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const agendaItems = document.querySelectorAll(".agenda-list details");
const forms = document.querySelectorAll(".registration-form");

const instituteCards = document.querySelectorAll(".institute-grid article");
const instituteLogos = [
  { src: "assets/logo-nuevo-amanecer.svg", alt: "Instituto Tecnológico Superior Nuevo Amanecer" },
  { src: "assets/logo-instituto-potosi.svg", alt: "Instituto Tecnológico Superior Potosí" },
];

instituteCards.forEach((card, index) => {
  const logo = instituteLogos[index];
  if (!logo) return;

  const frame = document.createElement("div");
  frame.className = "institute-logo-frame";

  const img = document.createElement("img");
  img.src = logo.src;
  img.alt = logo.alt;
  img.loading = "lazy";

  frame.appendChild(img);
  card.prepend(frame);
});

const instituteStyles = document.createElement("style");
instituteStyles.textContent = `
  .institute-grid article {
    min-height: 235px;
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 28px 24px !important;
  }
  .institute-logo-frame {
    width: 100%;
    max-width: 310px;
    height: 104px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .institute-logo-frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
  .institute-grid article strong {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  @media (max-width: 700px) {
    .institute-grid article { min-height: 220px; }
    .institute-logo-frame { max-width: 280px; height: 94px; }
  }
`;
document.head.appendChild(instituteStyles);

menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader?.classList.toggle("menu-open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader?.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

agendaItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    agendaItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const status = form.querySelector(".form-status");
    const originalText = button?.textContent || "Enviar registro";

    if (!GOOGLE_SCRIPT_ENDPOINT) {
      if (status) {
        status.textContent = "Formulario listo. Falta conectar la URL final de Google Apps Script.";
        status.classList.add("is-error");
      }
      return;
    }

    const formData = new FormData(form);
    formData.append("fecha_registro", new Date().toISOString());

    button.disabled = true;
    button.textContent = "Enviando...";
    if (status) {
      status.textContent = "";
      status.classList.remove("is-error");
    }

    try {
      await fetch(GOOGLE_SCRIPT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      form.reset();
      button.textContent = "Registro recibido";
      if (status) status.textContent = "Gracias. Sus datos fueron enviados correctamente.";

      window.setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        if (status) status.textContent = "";
      }, 3200);
    } catch (error) {
      button.textContent = "Intentar nuevamente";
      button.disabled = false;
      if (status) {
        status.textContent = "No se pudo enviar el registro. Revise su conexión e inténtelo nuevamente.";
        status.classList.add("is-error");
      }
    }
  });
});
