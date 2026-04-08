export async function verifyCaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    console.error("HCAPTCHA_SECRET is not set");
    return false;
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${secret}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("hCaptcha verification error:", error);
    return false;
  }
}
