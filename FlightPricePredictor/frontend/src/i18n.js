import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Flight Price Predictor",
      airline: "Airline",
      source: "Source Airport",
      destination: "Destination Airport",
      stops: "Stops",
      depart: "Departure",
      predict: "Predict Price",
      estimated: "Estimated Price",
      check_backend: "Backend not responding — check server"
    },
  },
  es: {
    translation: {
      title: "Predicción de Precio de Vuelo",
      airline: "Aerolínea",
      source: "Aeropuerto de Origen",
      destination: "Aeropuerto de Destino",
      stops: "Escalas",
      depart: "Salida",
      predict: "Predecir Precio",
      estimated: "Precio Estimado",
      check_backend: "El servidor no responde — comprueba el backend"
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
