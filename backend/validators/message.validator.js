function validateMessage({ receiverId, body, senderId }) {
  if (!Number.isInteger(receiverId) || receiverId <= 0) return 'المستلم غير صحيح';
  if (receiverId === senderId) return 'لا يمكنك إرسال رسالة إلى نفسك';
  if (!body) return 'الرسالة فارغة';
  if (body.length > 2000) return 'الرسالة طويلة جداً';
  return null;
}
module.exports = { validateMessage };
