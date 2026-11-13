import test from "node:test";
import assert from "node:assert/strict";
import { employeeApprovalSchema, registrationSchema } from "../src/lib/auth/schemas.ts";

const registration = {
  fullName: "Taylor Engineer",
  email: "taylor@example.com",
  password: "Secure-pass-92",
};

test("accepts valid employee registration details", () => {
  assert.equal(registrationSchema.safeParse(registration).success, true);
});

test("requires password length and character variety", () => {
  for (const password of ["short", "lowercasepassword", "UPPERCASE12345", "NoNumber!Pass"]) {
    assert.equal(registrationSchema.safeParse({ ...registration, password }).success, false, password);
  }
});

test("public registration schema cannot assign a role", () => {
  const result = registrationSchema.safeParse({ ...registration, role: "admin" });
  assert.equal(result.success, true);
  assert.equal(Object.hasOwn(result.data, "role"), false);
});

test("employee approval cannot grant the administrator role", () => {
  assert.equal(employeeApprovalSchema.safeParse({
    userId: "4ebda7ba-cc9a-43cb-8f5c-91c0850ab645",
    decision: "approved",
    role: "admin",
  }).success, false);
});
