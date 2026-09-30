function validateRegistration({ username, email, password }) {
  if (username.length < 3 || username.length > 30) return 'اسم المستخدم يجب أن يكون بين 3 و30 حرفاً';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'الإيميل غير صحيح';
  if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  return null;
}
module.exports = { validateRegistration };
