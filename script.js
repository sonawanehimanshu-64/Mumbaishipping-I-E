
"use strict";

// Update the year in the footer.
document.getElementById("year").textContent =
  new Date().getFullYear();

// Mobile navigation.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Shipping inquiry form.
const quoteForm = document.getElementById("quoteForm");
const formMessage = document.getElementById("formMessage");

// IMPORTANT: Replace this with your WhatsApp number.
// Use country code + number, without +, spaces or dashes.
// Example format for India: 919876543210
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!quoteForm.reportValidity()) {
    return;
  }

  if (!/^91\d{10}$/.test(WHATSAPP_NUMBER)) {
    formMessage.textContent =
      "Website setup required: add your real WhatsApp number in script.js.";
    return;
  }

  const formData = new FormData(quoteForm);

  const message = [
    "Hello Mumbaishipping I&E,",
    "",
    "I would like to enquire about shipping.",
    "",
    `Name: ${formData.get("name")}`,
    `Business: ${formData.get("business") || "Not provided"}`,
    `Origin: ${formData.get("origin")}`,
    `Destination: ${formData.get("destination")}`,
    `Shipping method: ${formData.get("method")}`,
    `Cargo type: ${formData.get("cargo")}`,
    `Shipment details: ${formData.get("details") || "Not provided"}`,
    "",
    "Please share the available options and next steps."
  ].join("\n");

  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const whatsappWindow = window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );

  if (whatsappWindow) {
    formMessage.textContent =
      "WhatsApp opened. Review your message and press Send.";
  } else {
    formMessage.textContent =
      "If WhatsApp did not open, allow pop-ups and try again.";
  }
});
