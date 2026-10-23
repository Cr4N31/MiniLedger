import { Router } from "express";
import { sign } from "jsonwebtoken";
import { randomInt, timingSafeEqual, createHash } from "node:crypto";
import { pool } from "../config/database";

const router = Router();

router.post("/send-otp", async (req, res) => {
  try {
    const phone = String(req.body.phone ?? "").trim();

    if (!/^\+?[1-9]\d{7,14}$/.test(phone)) {
      return res.status(400).json({
        message: "Enter a valid phone number with country code",
      });
    }

    // Create or find the user.
    const userResult = await pool.query(
      `INSERT INTO users (phone)
       VALUES ($1)
       ON CONFLICT (phone)
       DO UPDATE SET phone = EXCLUDED.phone
       RETURNING id`,
      [phone],
    );

    const userId = userResult.rows[0].id;

    // Invalidate any previously unused OTPs for this user.
    await pool.query(
      `UPDATE otp_codes
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );

    const otp = String(randomInt(100000, 1000000));
    const codeHash = createHash("sha256").update(otp).digest("hex");

    await pool.query(
      `INSERT INTO otp_codes (user_id, code_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes')`,
      [userId, codeHash],
    );

    // Mock delivery: print the OTP in the server terminal.
    console.log(`MiniLedger mock OTP for ${phone}: ${otp}`);

    return res.json({
      message: "OTP generated. Check the server terminal.",
    });
  } catch (error) {
    console.error("Failed to generate OTP:", error);
    return res.status(500).json({
      message: "Failed to generate OTP",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const phone = String(req.body.phone ?? "").trim();
    const otp = String(req.body.otp ?? "").trim();

    if (!/^\+?[1-9]\d{7,14}$/.test(phone) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "A valid phone number and 6-digit OTP are required",
      });
    }

    const result = await pool.query(
      `SELECT o.id, o.user_id, o.code_hash
       FROM otp_codes o
       JOIN users u ON u.id = o.user_id
       WHERE u.phone = $1
         AND o.used_at IS NULL
         AND o.expires_at > NOW()
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [phone],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "OTP is invalid or expired",
      });
    }

    const record = result.rows[0];
    const submittedHash = createHash("sha256").update(otp).digest();
    const storedHash = Buffer.from(record.code_hash, "hex");

    if (
      submittedHash.length !== storedHash.length ||
      !timingSafeEqual(submittedHash, storedHash)
    ) {
      return res.status(401).json({
        message: "OTP is invalid or expired",
      });
    }

    await pool.query(
      `UPDATE otp_codes SET used_at = NOW()
       WHERE id = $1 AND used_at IS NULL`,
      [record.id],
    );

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is missing from .env");
      return res.status(500).json({
        message: "Server authentication is not configured",
      });
    }

    const token = sign({ userId: record.user_id }, secret, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
});

export default router;
