const collaborationConfig = {
  webhookUrl: "",
  fallbackMode: "demo",
  successMessage:
    "Gracias. La solicitud ha quedado registrada como demo y esta estructura ya está lista para conectar con automatización real."
};

const siteHeader = document.querySelector(".site-header");
const form = document.querySelector("[data-collaboration-form]");
const statusNode = document.querySelector("[data-form-status]");

function syncHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-compact", window.scrollY > 18);
}

function setStatus(message, type = "") {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.classList.remove("is-error", "is-success");
  if (type) {
    statusNode.classList.add(type);
  }
}

function buildPayload(formData) {
  return {
    brand: formData.get("brand")?.toString().trim() || "",
    contact: formData.get("contact")?.toString().trim() || "",
    channel: formData.get("channel")?.toString().trim() || "",
    businessType: formData.get("businessType")?.toString().trim() || "",
    goal: formData.get("goal")?.toString().trim() || "",
    location: formData.get("location")?.toString().trim() || "",
    timeline: formData.get("timeline")?.toString().trim() || "",
    budget: formData.get("budget")?.toString().trim() || "",
    message: formData.get("message")?.toString().trim() || "",
    source: "erika-palacios-landing"
  };
}

function validatePayload(payload) {
  const requiredFields = [
    ["brand", "Añade el nombre de la marca o negocio."],
    ["contact", "Indica la persona de contacto."],
    ["channel", "Deja un email o Instagram para responder."],
    ["businessType", "Selecciona el tipo de negocio."],
    ["goal", "Cuéntame el objetivo principal de la colaboración."],
    ["location", "Añade la ciudad o zona de referencia."]
  ];

  const failed = requiredFields.find(([key]) => !payload[key]);
  return failed ? failed[1] : "";
}

async function sendPayload(payload) {
  if (!collaborationConfig.webhookUrl) {
    return { ok: true, mode: collaborationConfig.fallbackMode, payload };
  }

  const response = await fetch(collaborationConfig.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar la solicitud.");
  }

  return response.json().catch(() => ({ ok: true }));
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const payload = buildPayload(formData);
    const validationMessage = validatePayload(payload);

    if (validationMessage) {
      setStatus(validationMessage, "is-error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      await sendPayload(payload);
      window.__lastCollaborationPayload = payload;
      form.reset();
      setStatus(collaborationConfig.successMessage, "is-success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Algo ha fallado al procesar la solicitud.";
      setStatus(message, "is-error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Solicitar colaboración";
      }
    }
  });
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });
