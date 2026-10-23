import { Router } from "express";
import { pool } from "../config/database";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all loans belonging to the authenticated user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        friend_name AS "friendName",
        amount,
        due_date AS "dueDate",
        repaid_at AS "repaidAt",
        receipt_url AS "receiptUrl",
        created_at AS "createdAt",
        (repaid_at IS NULL AND due_date < CURRENT_DATE) AS "isOverdue"
      FROM loans
      WHERE user_id = $1
      ORDER BY
        (repaid_at IS NULL AND due_date < CURRENT_DATE) DESC,
        due_date ASC,
        created_at DESC`,
      [userId],
    );

    return res.json({
      count: result.rows.length,
      loans: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch loans:", error);

    return res.status(500).json({
      message: "Failed to fetch loans",
    });
  }
});

// Create a loan
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { friendName, amount, dueDate } = req.body;
    const userId = req.userId;

    if (!userId || !friendName?.trim() || amount === undefined || !dueDate) {
      return res.status(400).json({
        message: "friendName, amount, and dueDate are required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    const result = await pool.query(
      `INSERT INTO loans (user_id, friend_name, amount, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         friend_name AS "friendName",
         amount,
         due_date AS "dueDate",
         repaid_at AS "repaidAt",
         created_at AS "createdAt"`,
      [userId, friendName.trim(), numericAmount, dueDate],
    );

    return res.status(201).json({
      message: "Loan created successfully",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to create loan:", error);

    return res.status(500).json({
      message: "Failed to create loan",
    });
  }
});

router.patch("/:id/repay", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = await pool.query(
      `UPDATE loans
       SET repaid_at = NOW(), updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND repaid_at IS NULL
       RETURNING
         id,
         friend_name AS "friendName",
         amount,
         due_date AS "dueDate",
         repaid_at AS "repaidAt"`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Loan not found or already repaid",
      });
    }

    return res.json({
      message: "Loan marked as repaid",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to mark loan as repaid:", error);

    return res.status(500).json({
      message: "Failed to mark loan as repaid",
    });
  }
});

router.get("/summary", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(amount), 0) AS "totalLent",
        COALESCE(
          SUM(amount) FILTER (WHERE repaid_at IS NOT NULL),
          0
        ) AS "totalRepaid",
        COALESCE(
          SUM(amount) FILTER (
            WHERE repaid_at IS NULL
              AND due_date < CURRENT_DATE
          ),
          0
        ) AS "overdueAmount",
        COUNT(*) FILTER (
          WHERE repaid_at IS NULL
        ) AS "unpaidLoans",
        COUNT(*) FILTER (
          WHERE repaid_at IS NULL
            AND due_date < CURRENT_DATE
        ) AS "overdueLoans"
      FROM loans
      WHERE user_id = $1`,
      [userId],
    );

    return res.json({
      summary: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch loan summary:", error);

    return res.status(500).json({
      message: "Failed to fetch loan summary",
    });
  }
});

export default router;
