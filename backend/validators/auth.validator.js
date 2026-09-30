function validateRegistration(input={}){
  const username=String(input.username??'').trim();
  const email=String(input.email??'').trim().toLowerCase();
  const password=String(input.password??'');
  if(username.length<3||username.length>30)return 'اسم المستخدم يجب أن يكون بين 3 و30 حرفاً';
  if(!email.includes('@')||!email.includes('.')||email.startsWith('@')||email.endsWith('@')||email.startsWith('.')||email.endsWith('.'))return 'الإيميل غير صحيح';
  if(password.length<6)return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  return null;
}
module.exports={validateRegistration};