const nodemailer = require('nodemailer');
require('dotenv').config();
 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
 
const sendResetEmail = async (toEmail, resetToken) => {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
 
  const mailOptions = {
    from: `"SOS Campus" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Réinitialisation de votre mot de passe — SOS Campus',
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #FDF2F5; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3D0A1E, #B02252); padding: 40px 32px; text-align: center;">
          <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.15); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 28px;">🆘</span>
          </div>
          <h1 style="color: white; font-size: 26px; margin: 0;">SOS Campus</h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 6px 0 0;">Réinitialisation de mot de passe</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #3D0A1E; font-size: 16px; margin-bottom: 12px;">Bonjour,</p>
          <p style="color: #5a3040; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
            Vous avez demandé à réinitialiser votre mot de passe SOS Campus. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #8B1A42, #B02252); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 500; display: inline-block;">
              Réinitialiser mon mot de passe →
            </a>
          </div>
          <p style="color: #8B5567; font-size: 13px; text-align: center; margin-bottom: 8px;">
            Ce lien expire dans <strong>1 heure</strong>.
          </p>
          <p style="color: #8B5567; font-size: 12px; text-align: center;">
            Si vous n'avez pas fait cette demande, ignorez cet email.
          </p>
        </div>
        <div style="background: #FAE5EC; padding: 16px 32px; text-align: center;">
          <p style="color: #B02252; font-size: 11px; margin: 0;">© 2024 SOS Campus — ENS Marrakech</p>
        </div>
      </div>
    `,
  };
 
  await transporter.sendMail(mailOptions);
};
 
module.exports = { sendResetEmail };