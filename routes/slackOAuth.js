import express from "express";
import axios from "axios";
import pool from "../db/db.js";

const router = express.Router();

router.get("/slack/oauth_redirect", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send("Missing OAuth code");
    }

    /* 🔹 Exchange code for token */
    const tokenRes = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
        state,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = tokenRes.data;

    if (!data.ok) {
      return res.status(400).json(data);
    }

    const { access_token, bot_user_id } = data;
    const team_id = data.team.id;
    const team_name = data.team.name;
    const authed_user_id = data.authed_user.id;

    /* 🔹 Save auth info */
    await pool.query(
      `INSERT INTO auth_info (team_name, authed_user_id, access_token, team_id, bot_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [team_name, authed_user_id, access_token, team_id, bot_user_id]
    );

    await pool.query(
      `INSERT INTO admin (team_id, user_id) VALUES (?, ?)`,
      [team_id, authed_user_id]
    );

    /* 🔹 Fetch Slack users */
    const usersRes = await axios.get(
      "https://slack.com/api/users.list",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    for (const user of usersRes.data.members) {
      if (!user.deleted && !user.is_bot && user.profile.real_name !== "Slackbot") {
        await pool.query(
          `INSERT INTO users (user_id, team_id, name, real_name, email)
           VALUES (?, ?, ?, ?, ?)`,
          [
            user.id,
            user.team_id,
            user.name,
            user.profile.real_name,
            user.profile.email,
          ]
        );
      }
    }

    /* 🔹 Defaults */
    await pool.query(
      `INSERT INTO deadline (team_id, meal, time) VALUES (?, 'lunch', '10:00')`,
      [team_id]
    );
    await pool.query(
      `INSERT INTO deadline (team_id, meal, time) VALUES (?, 'dinner', '14:00')`,
      [team_id]
    );
    await pool.query(
      `INSERT INTO price_table (team_id, lunch, dinner) VALUES (?, 70, 80)`,
      [team_id]
    );

    res.send(`
      <h1>Slack bot is added to your workspace ✅</h1>
      <p>You can close this tab now.</p>
    `);
  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err);
    res.status(500).send("OAuth failed");
  }
});

export default router;
