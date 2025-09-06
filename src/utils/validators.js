/**
 * Validatie utility - Consistent valideren van gebruikersinvoer
 */

// Regex patronen voor validatie
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  name: /^[a-zA-Z\s-']{2,50}$/,
  numbers: /^\d+$/,
  phone: /^(\+[0-9]{1,3})?[0-9]{9,}$/,
  url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
};

/**
 * Valideer een e-mailadres
 * @param {string} email - Het e-mailadres om te valideren
 * @returns {boolean} Of het een geldig e-mailadres is
 */
export function isValidEmail(email) {
  return patterns.email.test(String(email).toLowerCase());
}

/**
 * Valideer een wachtwoord (min 8 tekens, letters en cijfers)
 * @param {string} password - Het wachtwoord om te valideren
 * @returns {boolean} Of het een geldig wachtwoord is
 */
export function isValidPassword(password) {
  return patterns.password.test(String(password));
}

/**
 * Valideer een naam (2-50 tekens, letters, spaties, streepjes en apostrof)
 * @param {string} name - De naam om te valideren
 * @returns {boolean} Of het een geldige naam is
 */
export function isValidName(name) {
  return patterns.name.test(String(name));
}

/**
 * Controleer of een waarde tussen min en max ligt
 * @param {number} value - De waarde om te controleren
 * @param {number} min - Minimumwaarde
 * @param {number} max - Maximumwaarde
 * @returns {boolean} Of de waarde binnen het bereik valt
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Controleer of een string niet leeg is
 * @param {string} value - De string om te controleren
 * @returns {boolean} Of de string niet leeg is
 */
export function isNotEmpty(value) {
  return !!String(value).trim();
}

/**
 * Valideer een formulier met meerdere velden
 * @param {Object} formData - Object met formuliergegevens
 * @param {Object} rules - Validatieregels per veld
 * @returns {Object} Object met eventuele fouten
 */
export function validateForm(formData, rules) {
  const errors = {};
  
  Object.entries(rules).forEach(([field, validations]) => {
    const value = formData[field];
    
    if (validations.required && !isNotEmpty(value)) {
      errors[field] = `${field} is verplicht`;
    } else if (validations.email && !isValidEmail(value)) {
      errors[field] = 'Voer een geldig e-mailadres in';
    } else if (validations.password && !isValidPassword(value)) {
      errors[field] = 'Wachtwoord moet minimaal 8 tekens bevatten met ten minste één letter en één cijfer';
    } else if (validations.name && !isValidName(value)) {
      errors[field] = 'Voer een geldige naam in (2-50 tekens)';
    } else if (validations.min !== undefined && validations.max !== undefined) {
      if (!isInRange(value, validations.min, validations.max)) {
        errors[field] = `Waarde moet tussen ${validations.min} en ${validations.max} liggen`;
      }
    } else if (validations.match && value !== formData[validations.match]) {
      errors[field] = `${field} moet overeenkomen met ${validations.match}`;
    }
  });
  
  return errors;
}