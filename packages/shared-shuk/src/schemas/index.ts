import { z } from "zod";
import { Gender } from "../types";

const nameRegex = /^[a-zA-Z\u0590-\u05FF\s'-]+$/;

// Reusable phone validation fields and logic
const phoneValidationFields = {
  countryCode: z
    .string()
    .min(1, "Zod.errors.countryCodeRequired")
    .default("+972"),
  phone: z
    .string()
    .regex(/^[1-9]\d{8,13}$/, "Zod.errors.phoneFormat")
    .trim()
    .default(""),
};

const createPhoneValidationRefine = (isOptional = false) => ({
  refine: (data: { countryCode?: string; phone?: string }) => {
    // If phone validation is optional and neither field is provided, it's valid
    if (isOptional && !data.phone && !data.countryCode) {
      return true;
    }

    // If phone is provided, countryCode must also be provided
    if (data.phone && !data.countryCode) {
      return false;
    }

    // If both phone and countryCode are provided, validate the combined format
    if (data.phone && data.countryCode) {
      const fullPhone = data.countryCode + data.phone;
      return /^\+[1-9]\d{1,14}$/.test(fullPhone);
    }

    return true;
  },
  message: "Zod.errors.phoneInvalid",
  path: ["phone"],
});

const SignupFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Zod.errors.firstNameRequired")
      .trim()
      .regex(nameRegex, "Zod.errors.nameFormat")
      .default(""),
    lastName: z
      .string()
      .min(2, "Zod.errors.lastNameRequired")
      .trim()
      .regex(nameRegex, "Zod.errors.nameFormat")
      .default(""),
    ...phoneValidationFields,
    gender: z.enum(Object.values(Gender)).default(Gender.OTHER),
    gym_id: z.number().min(1, "Zod.errors.gymRequired"),
  })
  .refine(createPhoneValidationRefine(false).refine, {
    message: createPhoneValidationRefine(false).message,
    path: createPhoneValidationRefine(false).path,
  });

const updateUserSchema = z
  .object({
    user_id: z.number().min(1, "Zod.errors.userIdRequired"),
    first_name: z.string().min(2, "Zod.errors.firstNameRequired"),
    last_name: z.string().min(2, "Zod.errors.lastNameRequired"),
    email: z.email({ message: "Zod.errors.emailInvalid" }).optional(),
    countryCode: phoneValidationFields.countryCode.optional(),
    phone: phoneValidationFields.phone.optional(),
    gender: z.enum(Object.values(Gender)),
    birthday: z.date().optional(),
    is_active: z.boolean().default(true),
    is_coach: z.boolean().default(false),
    is_trainee: z.boolean().default(true),
    is_gym_admin: z.boolean().default(false),
  })
  .refine(createPhoneValidationRefine(true).refine, {
    message: createPhoneValidationRefine(true).message,
    path: createPhoneValidationRefine(true).path,
  });

const softDeleteUserSchema = z.number().min(1, "Zod.errors.userIdRequired");

export type SignupFormSchemaType = z.infer<typeof SignupFormSchema>;

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type softDeleteUserSchemaType = z.infer<typeof softDeleteUserSchema>;

export { SignupFormSchema, updateUserSchema, softDeleteUserSchema };
