const mongoose = require("../config/mongoose");
const { ValidationError } = require("./errors");

// A small Laravel-style validator so every endpoint keeps the same rules,
// the same casting and the same 422 error shape ({ message, errors: { field: [..] } })
// that the React forms already read.
//
// Rules: required, nullable, sometimes, string, email, numeric, integer, boolean,
//        min:n, max:n, in:a,b,c, date, after_or_equal:field,
//        exists:ModelName, unique:ModelName,field, confirmed

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const isId = (v) => (typeof v === "string" && OBJECT_ID.test(v)) || v instanceof mongoose.Types.ObjectId;
const label = (f) => f.replace(/_/g, " ");
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const parse = (r) => {
  const i = r.indexOf(":");
  return i === -1 ? [r, ""] : [r.slice(0, i), r.slice(i + 1)];
};
const isNumeric = (v) =>
  (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)));

async function validate(input, rules, { message } = {}) {
  input = input || {};
  const errors = {};
  const data = {};

  for (const [field, ruleList] of Object.entries(rules)) {
    const list = (Array.isArray(ruleList) ? ruleList : String(ruleList).split("|")).map(String);
    const names = list.map((r) => parse(r)[0]);
    const present = has(input, field);

    if (names.includes("sometimes") && !present) continue;

    const value = present ? input[field] : undefined;
    const empty = value === undefined || value === null;
    const nullable = names.includes("nullable");
    const required = names.includes("required");

    if (required && (empty || (typeof value === "string" && value.trim() === ""))) {
      errors[field] = [`The ${label(field)} field is required.`];
      continue;
    }
    if (!present && !required) continue; // absent optional field -> not validated, not returned
    if (empty && nullable) {
      data[field] = null;
      continue;
    }

    const numericRule = names.includes("numeric") || names.includes("integer");
    let out = value;
    let failure = null;

    for (const raw of list) {
      const [name, arg] = parse(raw);
      if (["required", "nullable", "sometimes"].includes(name)) continue;
      const attr = label(field);

      switch (name) {
        case "string":
          if (typeof out !== "string") failure = `The ${attr} field must be a string.`;
          break;
        case "email":
          if (typeof out !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out))
            failure = `The ${attr} field must be a valid email address.`;
          break;
        case "numeric":
          if (!isNumeric(out)) failure = `The ${attr} field must be a number.`;
          else out = Number(out);
          break;
        case "integer":
          if (!isNumeric(out) || !Number.isInteger(Number(out))) failure = `The ${attr} field must be an integer.`;
          else out = Number(out);
          break;
        case "boolean":
          if ([true, false, 1, 0, "1", "0", "true", "false"].includes(out)) out = out === true || out === 1 || out === "1" || out === "true";
          else failure = `The ${attr} field must be true or false.`;
          break;
        case "min": {
          const n = Number(arg);
          if (numericRule) {
            if (empty || Number(out) < n) failure = `The ${attr} field must be at least ${n}.`;
          } else if (typeof out !== "string" || out.length < n) failure = `The ${attr} field must be at least ${n} characters.`;
          break;
        }
        case "max": {
          const n = Number(arg);
          if (numericRule) {
            if (empty || Number(out) > n) failure = `The ${attr} field must not be greater than ${n}.`;
          } else if (typeof out !== "string" || out.length > n) failure = `The ${attr} field must not be greater than ${n} characters.`;
          break;
        }
        case "in":
          if (!arg.split(",").includes(String(out))) failure = `The selected ${attr} is invalid.`;
          break;
        case "date":
          if (empty || Number.isNaN(Date.parse(out))) failure = `The ${attr} field must be a valid date.`;
          else out = new Date(out);
          break;
        case "after_or_equal": {
          const other = input[arg];
          if (out && other && !Number.isNaN(Date.parse(other)) && new Date(out) < new Date(other))
            failure = `The ${attr} field must be a date after or equal to ${label(arg)}.`;
          break;
        }
        case "confirmed":
          if (input[`${field}_confirmation`] !== out) failure = `The ${attr} field confirmation does not match.`;
          break;
        case "exists": {
          const Model = mongoose.model(arg.split(",")[0]);
          if (empty || !isId(out) || !(await Model.exists({ _id: out }))) failure = `The selected ${attr} is invalid.`;
          break;
        }
        case "unique": {
          const [modelName, col] = arg.split(",");
          if (!empty && (await mongoose.model(modelName).exists({ [col || field]: out })))
            failure = `The ${attr} has already been taken.`;
          break;
        }
        default:
          break;
      }
      if (failure) break;
    }

    if (failure) errors[field] = [failure];
    else data[field] = out;
  }

  if (Object.keys(errors).length) throw new ValidationError(errors, message);
  return data;
}

module.exports = { validate, isId };
