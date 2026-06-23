export default function validateForm(componentType, formSubmit, componentFormSchema) {
  const schema = componentFormSchema[componentType];
  let errors = null;

  Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
    const value = formSubmit[fieldName];

    // Required validation
    if (fieldConfig.required && (value === "" || value === null || value === undefined)) {
      errors={};
      errors[fieldName] = `${fieldConfig.display} is required`;
      return;
    }

    // Skip empty optional fields
    if (value === "" || value === null || value === undefined) {
      return;
    }

    // Text validation
    if (fieldConfig.type === "text") {
      if (typeof value !== "string") {
        errors={};
        errors[fieldName] = `${fieldConfig.display} must be text`;
      }
      return;
    }

    // Select validation
    if (fieldConfig.type === "select") {
      if (!fieldConfig.options.includes(value)) {
        errors={};
        errors[fieldName] = `${fieldConfig.display} has invalid value`;
      }
      return;
    }

    // Number validation
    if (fieldConfig.type === "number") {
      const numberValue = Number(String(value).replace(",", "."));

      if (Number.isNaN(numberValue)) {
        errors={};
        errors[fieldName] = `${fieldConfig.display} must be a number`;
        return;
      }

      if (fieldConfig.exclusiveMin === true) {
        if (numberValue <= fieldConfig.min) {
          errors={};
          errors[fieldName] = `${fieldConfig.display} must be greater than ${fieldConfig.min}`;
          return;
        }
      } else if (fieldConfig.min !== undefined && numberValue < fieldConfig.min) {
        errors={};
        errors[fieldName] = `${fieldConfig.display} must be at least ${fieldConfig.min}`;
        return;
      }

      if (fieldConfig.max !== undefined && numberValue > fieldConfig.max) {
        errors={};
        errors[fieldName] = `${fieldConfig.display} must be at most ${fieldConfig.max}`;
        return;
      }
    }
  });

  return errors;
}