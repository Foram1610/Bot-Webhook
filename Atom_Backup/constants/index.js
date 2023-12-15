const VALIDATION_ERROR = {
  LOGIN_ERROR: "Email or password is not correct",
  INVALID_PASSWORD: "Password must be at least 8 char long",
  INVALID_EMAIL: "This is not a valid email address",
  REQUIRED_FIELD: "This field is required",
  EXISTING_ACCOUNT: "This account already exists, please login instead",
  EXISTING_COMPANY: "Company with this name already exists",
  USER_NOT_FOUND: "Account not found",
  INVALID_CURRENT_PASSWORD: "Incorrect current password",
  MISSING_CURRENT_PASSWORD: "Old password is required",
  MISSING_NEW_PASSWORD: "New password is required",
  MISSING_CONFIRM_PASSWORD: "Please provide a valid confirm password",
  INVALID_ACC_SECRET: "Invalid account secret",
  INVALID_BOT_TOKEN: "Oops, seems like bot with this token doesn;t exists",
  INVALID_DATA: "Missing or invalid data",
  BOT_NOT_FOUND: "Bot not found",
  MESSAGES_NOT_FOUND: "Messages not found",
  USERS_NOT_FOUND: "Users not found",
  TENANTS_NOT_FOUND: "Tenant not found",
  UPLOAD_FAIL: "Upload failed",
  INVALID_MSG: "Msg must be a string",
  INVALID_BOOLEAN: "value must be a boolean"
};
const INFO_MSG = {
  VERIFICATION_EMAIL_SENT:
    "We have sent a verification link to your email address. Please click the link to verify your account",
};
module.exports = {
  VALIDATION_ERROR,
  INFO_MSG,
};
