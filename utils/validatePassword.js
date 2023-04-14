export const validatePassword = (password) => {
  // Regular expressions to match password criteria
  const regex = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>_-]/,
  };

  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  if (
    password.length < 8 ||
    !regex.uppercase.test(password) ||
    !regex.lowercase.test(password) ||
    !regex.number.test(password) ||
    !regex.special.test(password)
  ) {
    return false;
  }

  return true;
};
