export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { pincode, weight = 0.5 } = req.query;
    if (!pincode) return res.status(400).json({ success: false, message: "Pincode required" });

    const authResponse = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      })
    });
    const authData = await authResponse.json();
    const token = authData.token;
    if (!token) return res.status(401).json({ success: false, message: "Auth failed" });

    const serviceabilityResponse = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=411033&delivery_postcode=${pincode}&cod=0&weight=${weight}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await serviceabilityResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
