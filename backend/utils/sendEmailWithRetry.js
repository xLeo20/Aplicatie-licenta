const sendEmail = require('./sendEmail');

// Wrapper peste sendEmail care reincearca trimiterea de cateva ori.
// Gmail poate respinge temporar mailurile trimise in rafala (throttling),
// iar un retry cu pauza progresiva rezolva majoritatea acestor esecuri tranzitorii.
const sendEmailWithRetry = async (options, retries = 3, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sendEmail(options);
      return true; // trimis cu succes
    } catch (error) {
      console.log(`Incercarea ${attempt}/${retries} de trimitere email a esuat:`, error.message);

      // Am epuizat incercarile -> propagam eroarea catre apelant.
      if (attempt === retries) {
        throw error;
      }

      // Backoff progresiv: 2s, 4s, 6s... ca sa lasam Gmail-ul sa se "racoreasca".
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

module.exports = sendEmailWithRetry;
