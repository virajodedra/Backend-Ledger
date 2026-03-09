import nodemailer from "nodemailer";
import userModel from "../models/user.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error setting up email transporter:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

async function SendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend-Ledger — Your Account is Ready";
  const text = `Hi ${name},\n\nWelcome to Backend-Ledger.\n\nYour account has been successfully created and is ready to use. We built Backend-Ledger to give developers a powerful, reliable, and elegant backend solution — and we're glad you're part of it.\n\nHere's how to get started:\n  1. Log in to your dashboard\n  2. Explore the API documentation\n  3. Build something great\n\nIf you have any questions, our team is always here to help.\n\nBest regards,\nThe Backend-Ledger Team\n\n---\nYou're receiving this email because you created an account at Backend-Ledger.\n© ${new Date().getFullYear()} Backend-Ledger. All rights reserved.`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Backend-Ledger</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ── LOGO BAR ── -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:14px 28px;">
                    <span style="font-size:18px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      BACKEND<span style="color:#e94560;">&#8209;</span>LEDGER
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── HERO CARD ── -->
          <tr>
            <td style="background:linear-gradient(160deg,#1c1c1e 0%,#111111 100%);border:1px solid #262626;border-radius:16px;overflow:hidden;">

              <!-- Hero top accent line -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(90deg,#e94560 0%,#ff6b35 50%,#e94560 100%);height:3px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Hero content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:52px 48px 44px;">

                    <!-- Status badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background-color:#0f2a1a;border:1px solid #1a4a2e;border-radius:20px;padding:6px 14px;">
                          <span style="color:#34d399;font-size:12px;font-weight:600;letter-spacing:0.5px;">&#10003;&nbsp; Account Activated</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Headline -->
                    <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
                      Welcome, ${name}.
                    </h1>
                    <p style="margin:0 0 36px;font-size:16px;line-height:1.75;color:#8a8a8a;">
                      Your Backend-Ledger account is live. You now have full access to our suite of backend tools, built for speed, reliability, and developer happiness.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:9px;background:linear-gradient(135deg,#e94560 0%,#c0392b 100%);box-shadow:0 8px 24px rgba(233,69,96,0.35);">
                          <a href="#" style="display:inline-block;padding:15px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;border-radius:9px;">
                            Open Your Dashboard &nbsp;&#8594;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 48px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="border-top:1px solid #222222;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── GET STARTED STEPS ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 48px;">
                    <p style="margin:0 0 24px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#5a5a5a;">
                      Get started in 3 steps
                    </p>

                    <!-- Step 1 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td width="44" valign="top" style="padding-top:2px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;height:32px;border-radius:50%;background-color:#1a1a1a;border:1px solid #333333;text-align:center;vertical-align:middle;">
                                <span style="color:#e94560;font-size:13px;font-weight:800;line-height:32px;">1</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#e8e8e8;">Log in to your dashboard</p>
                          <p style="margin:0;font-size:13px;color:#5a5a5a;line-height:1.6;">Access all your tools, settings, and resources in one place.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td width="44" valign="top" style="padding-top:2px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;height:32px;border-radius:50%;background-color:#1a1a1a;border:1px solid #333333;text-align:center;vertical-align:middle;">
                                <span style="color:#e94560;font-size:13px;font-weight:800;line-height:32px;">2</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#e8e8e8;">Explore the API documentation</p>
                          <p style="margin:0;font-size:13px;color:#5a5a5a;line-height:1.6;">Everything you need to integrate and build — fully documented.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="44" valign="top" style="padding-top:2px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;height:32px;border-radius:50%;background-color:#1a1a1a;border:1px solid #333333;text-align:center;vertical-align:middle;">
                                <span style="color:#e94560;font-size:13px;font-weight:800;line-height:32px;">3</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#e8e8e8;">Build something great</p>
                          <p style="margin:0;font-size:13px;color:#5a5a5a;line-height:1.6;">Ship fast, scale confidently. We handle the backend complexity.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 48px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="border-top:1px solid #222222;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── TRUST STRIP ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 48px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="33%" align="center" style="padding:0 8px;">
                          <p style="margin:0 0 4px;font-size:20px;">&#128274;</p>
                          <p style="margin:0;font-size:12px;font-weight:600;color:#c0c0c0;">Enterprise Security</p>
                        </td>
                        <td width="33%" align="center" style="padding:0 8px;border-left:1px solid #222;border-right:1px solid #222;">
                          <p style="margin:0 0 4px;font-size:20px;">&#9889;</p>
                          <p style="margin:0;font-size:12px;font-weight:600;color:#c0c0c0;">High Performance</p>
                        </td>
                        <td width="33%" align="center" style="padding:0 8px;">
                          <p style="margin:0 0 4px;font-size:20px;">&#128065;</p>
                          <p style="margin:0;font-size:12px;font-weight:600;color:#c0c0c0;">24 / 7 Monitoring</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Bottom accent line -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(90deg,transparent 0%,#1a1a1a 40%,#1a1a1a 60%,transparent 100%);height:1px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding:32px 8px 8px;" align="center">
              <p style="margin:0 0 8px;font-size:12px;color:#3a3a3a;line-height:1.6;">
                You're receiving this because you created an account at <span style="color:#5a5a5a;font-weight:600;">Backend-Ledger</span>.
              </p>
              <p style="margin:0;font-size:11px;color:#2e2e2e;">
                &copy; ${new Date().getFullYear()} Backend-Ledger &nbsp;&bull;&nbsp; All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionCompleteEmail({
  fromAccount,
  toAccount,
  amount,
  transactionId,
}) {
  const [sender, receiver] = await Promise.all([
    userModel.findById(fromAccount.user),
    userModel.findById(toAccount.user),
  ]);

  const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // ── Email to SENDER (money went OUT) ──
  const senderSubject = `You sent ₹${amount} — Transaction Successful`;
  const senderText = `Hi ${sender.name},\n\nYour transfer of ₹${amount} to ${receiver.name} was successful.\n\nTransaction ID: ${transactionId}\nDate: ${date}\n\nIf you did not make this transaction, contact support immediately.\n\n— Backend-Ledger Team`;
  const senderHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Transaction Successful</title></head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:28px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background-color:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:14px 28px;">
              <span style="font-size:18px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#ffffff;">BACKEND<span style="color:#e94560;">&#8209;</span>LEDGER</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:linear-gradient(160deg,#1c1c1e 0%,#111111 100%);border:1px solid #262626;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:linear-gradient(90deg,#e94560 0%,#ff6b35 50%,#e94560 100%);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>
              <td style="background-color:#0f2a1a;border:1px solid #1a4a2e;border-radius:20px;padding:6px 14px;">
                <span style="color:#34d399;font-size:12px;font-weight:600;">&#10003;&nbsp; Transfer Successful</span>
              </td>
            </tr></table>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;">You sent ₹${amount}</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#8a8a8a;line-height:1.7;">Hi ${sender.name}, your transfer was processed successfully.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Amount Sent</span><br/>
                  <span style="font-size:22px;font-weight:800;color:#e94560;">₹${amount}</span>
                </td></tr>
                <tr><td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Recipient</span><br/>
                  <span style="font-size:14px;font-weight:600;color:#e8e8e8;">${receiver.name}</span>
                </td></tr>
                <tr><td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Transaction ID</span><br/>
                  <span style="font-size:13px;font-weight:600;color:#e8e8e8;font-family:monospace;">${transactionId}</span>
                </td></tr>
                <tr><td style="padding-top:14px;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Date &amp; Time</span><br/>
                  <span style="font-size:13px;font-weight:600;color:#e8e8e8;">${date}</span>
                </td></tr>
              </table>
            </td></tr></table>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:28px 8px 8px;" align="center">
          <p style="margin:0;font-size:11px;color:#2e2e2e;">&copy; ${new Date().getFullYear()} Backend-Ledger &nbsp;&bull;&nbsp; All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ── Email to RECEIVER (money came IN) ──
  const receiverSubject = `You received ₹${amount} — Money Received`;
  const receiverText = `Hi ${receiver.name},\n\n${sender.name} has sent you ₹${amount}.\n\nTransaction ID: ${transactionId}\nDate: ${date}\n\n— Backend-Ledger Team`;
  const receiverHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Money Received</title></head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:28px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background-color:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:14px 28px;">
              <span style="font-size:18px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#ffffff;">BACKEND<span style="color:#e94560;">&#8209;</span>LEDGER</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:linear-gradient(160deg,#1c1c1e 0%,#111111 100%);border:1px solid #262626;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:linear-gradient(90deg,#34d399 0%,#059669 50%,#34d399 100%);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>
              <td style="background-color:#0f2a1a;border:1px solid #1a4a2e;border-radius:20px;padding:6px 14px;">
                <span style="color:#34d399;font-size:12px;font-weight:600;">&#10003;&nbsp; Money Received</span>
              </td>
            </tr></table>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;">You received ₹${amount}</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#8a8a8a;line-height:1.7;">Hi ${receiver.name}, ${sender.name} has sent you money.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Amount Received</span><br/>
                  <span style="font-size:22px;font-weight:800;color:#34d399;">₹${amount}</span>
                </td></tr>
                <tr><td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Sent By</span><br/>
                  <span style="font-size:14px;font-weight:600;color:#e8e8e8;">${sender.name}</span>
                </td></tr>
                <tr><td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Transaction ID</span><br/>
                  <span style="font-size:13px;font-weight:600;color:#e8e8e8;font-family:monospace;">${transactionId}</span>
                </td></tr>
                <tr><td style="padding-top:14px;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Date &amp; Time</span><br/>
                  <span style="font-size:13px;font-weight:600;color:#e8e8e8;">${date}</span>
                </td></tr>
              </table>
            </td></tr></table>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:28px 8px 8px;" align="center">
          <p style="margin:0;font-size:11px;color:#2e2e2e;">&copy; ${new Date().getFullYear()} Backend-Ledger &nbsp;&bull;&nbsp; All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await Promise.all([
    sendEmail(sender.email, senderSubject, senderText, senderHtml),
    sendEmail(receiver.email, receiverSubject, receiverText, receiverHtml),
  ]);
}

async function sendTransactionFailureEmail({
  fromAccount,
  amount,
  transactionId,
}) {
  const sender = await userModel.findById(fromAccount.user);
  const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const subject = `Transaction Failed — ₹${amount} was not transferred`;
  const text = `Hi ${sender.name},\n\nYour transaction of ₹${amount} failed.\n\nTransaction ID: ${transactionId}\nDate: ${date}\n\nNo money was deducted from your account. Please try again or contact support.\n\n— Backend-Ledger Team`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Transaction Failed</title></head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:28px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background-color:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:14px 28px;">
              <span style="font-size:18px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#ffffff;">BACKEND<span style="color:#e94560;">&#8209;</span>LEDGER</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:linear-gradient(160deg,#1c1c1e 0%,#111111 100%);border:1px solid #262626;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:linear-gradient(90deg,#e94560 0%,#c0392b 50%,#e94560 100%);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>
              <td style="background-color:#2a0f0f;border:1px solid #4a1a1a;border-radius:20px;padding:6px 14px;">
                <span style="color:#e94560;font-size:12px;font-weight:600;">&#10007;&nbsp; Transaction Failed</span>
              </td>
            </tr></table>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;">Transfer of ₹${amount} failed</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#8a8a8a;line-height:1.7;">Hi ${sender.name}, we could not process your payment. No money was deducted from your account.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Amount</span><br/>
                  <span style="font-size:22px;font-weight:800;color:#e94560;">₹${amount}</span>
                </td></tr>
                <tr><td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #222;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Transaction ID</span><br/>
                  <span style="font-size:13px;font-weight:600;color:#e8e8e8;font-family:monospace;">${transactionId}</span>
                </td></tr>
                <tr><td style="padding-top:14px;">
                  <span style="font-size:11px;color:#5a5a5a;text-transform:uppercase;letter-spacing:1px;">Date &amp; Time</span><br/>
                  <span style="font-size:13px;font-weight:600;color:#e8e8e8;">${date}</span>
                </td></tr>
              </table>
            </td></tr></table>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:28px 8px 8px;" align="center">
          <p style="margin:0;font-size:11px;color:#2e2e2e;">&copy; ${new Date().getFullYear()} Backend-Ledger &nbsp;&bull;&nbsp; All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail(sender.email, subject, text, html);
}

export default {
  SendRegistrationEmail,
  sendTransactionCompleteEmail,
  sendTransactionFailureEmail,
};
