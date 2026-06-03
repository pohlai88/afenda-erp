import { z } from "zod";

import { isPasswordPolicySatisfied } from "../policy/password-policy.shared";

export const devSignInSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  organizationName: z.string().trim().min(1).max(120),
});

export const switchOrganizationSchema = z.object({
  organizationId: z.string().trim().min(1).max(128),
});

export const credentialsSignInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const credentialsSignUpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(128).refine(isPasswordPolicySatisfied, {
    message: "Password does not meet the enterprise policy.",
  }),
});

export const organizationOnboardingSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128).refine(isPasswordPolicySatisfied, {
      message: "Password does not meet the enterprise policy.",
    }),
    confirmPassword: z.string().min(8).max(128),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New passwords must match.",
    path: ["confirmPassword"],
  });

export const requestPasswordResetSchema = z.object({
  email: z.email(),
});

export const completePasswordResetSchema = z
  .object({
    otp: z.string().trim().min(1).max(16),
    password: z.string().min(8).max(128).refine(isPasswordPolicySatisfied, {
      message: "Password does not meet the enterprise policy.",
    }),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
