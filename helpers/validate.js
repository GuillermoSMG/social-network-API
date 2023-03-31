const validator = require("validator");

const validate = (params) => {
  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES");

  let nickname =
    !validator.isEmpty(params.nickname) &&
    validator.isLength(params.nickname, { min: 2, max: 32 });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password = !validator.isEmpty(params.password);

  if (!name || !nickname || !email || !password) {
    throw new Error("No se ha superado al validación.");
  }
};

module.exports = { validate };
