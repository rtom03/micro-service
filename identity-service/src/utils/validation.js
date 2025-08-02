import joi from "joi";

export const validateInput = (data) => {
  const schema = joi.object({
    username: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
  });

  return schema.validate(data);
};
