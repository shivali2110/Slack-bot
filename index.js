// import pkg from "@slack/bolt";
// const { App, ExpressReceiver } = pkg;

// import dotenv from "dotenv";
// import pool from "./db/db.js";
// import axios from "axios";

// dotenv.config();

// /* Express Receiver (OAuth + custom routes ) */
// const receiver = new ExpressReceiver({
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
// });

// /*  Slack Bolt App */
// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   receiver,
// });
// app.use(async ({ body, next }) => {
//   console.log("📩 Incoming Slack payload type:", body?.type);
//   await next();
// });


// async function startApp() {
//   try {
//     /*  DB test */
//     await pool.query("SELECT 1");
//     console.log("✅ MySQL connected");

//     /*  App Home */
//     app.event("app_home_opened", async ({ event, client }) => {
//       await client.views.publish({
//         user_id: event.user,
//         view: {
//           type: "home",
//           blocks: [
//             {
//               type: "section",
//               text: {
//                 type: "mrkdwn",
//                 text: "Welcome! Click button to add yourself 👇",
//               },
//             },
//             {
//               type: "actions",
//               elements: [
//                 {
//                   type: "button",
//                   text: {
//                     type: "plain_text",
//                     text: "Click Me",
//                   },
//                   action_id: "click_me_button",
//                   style: "primary",
//                 },
//               ],
//             },
//           ],
//         },
//       });
//     });

//     /*  Button Click */
//     app.action("click_me_button", async ({ ack, body, client }) => {
//       await ack();

//       try {
//         const slackUserId = body.user.id;

//         const userInfo = await client.users.info({
//           user: slackUserId,
//         });

//         const userName =
//           userInfo.user.real_name || userInfo.user.name;

//         // Same user repeat nahi thay
//         await pool.query(
//           `INSERT IGNORE INTO users (slack_user_id, name)
//            VALUES (?, ?)`,
//           [slackUserId, userName]
//         );

//         const [users] = await pool.query("SELECT * FROM users");

//         const userBlocks = users.map(user => ({
//           type: "section",
//           text: {
//             type: "mrkdwn",
//             text: `• *${user.name}* (Slack ID: ${user.slack_user_id})`,
//           },
//         }));

//         await client.views.publish({
//           user_id: body.user.id,
//           view: {
//             type: "home",
//             blocks: [
//               {
//                 type: "section",
//                 text: {
//                   type: "mrkdwn",
//                   text: "Welcome! Click button to add yourself 👇",
//                 },
//               },
//               {
//                 type: "actions",
//                 elements: [
//                   {
//                     type: "button",
//                     text: {
//                       type: "plain_text",
//                       text: "Click Me",
//                     },
//                     action_id: "click_me_button",
//                     style: "primary",
//                   },
//                 ],
//               },
//               { type: "divider" },
//               ...userBlocks,
//             ],
//           },
//         });
//       } catch (err) {
//         console.error("❌ Button Error:", err);
//       }
//     });

//     /*  OAuth Redirect URL (Slack exact JSON output) */
//     receiver.app.get("/slack/oauth_redirect", async (req, res) => {
//       try {
//         const code = req.query.code;

//         if (!code) {
//           return res.status(400).json({ ok: false, error: "missing_code" });
//         }

//         const response = await axios.post(
//           "http://localhost:3000/slack/oauth_redirect",
//           null,
//           {
//             params: {
//               client_id: process.env.SLACK_CLIENT_ID,
//               client_secret: process.env.SLACK_CLIENT_SECRET,
//               code,
//               redirect_uri: "https://localhost:3000/slack/oauth_redirect",
//             },
//           }
//         );

//         console.log("✅ OAuth Response (Slack JSON):");
//         console.log(response.data);

//         // Browser + Postman 
//         res.json(response.data);

//       } catch (err) {
//         console.error("❌ OAuth Error:", err.response?.data || err);
//         res.status(500).json(err.response?.data || { ok: false });
//       }
//     });


//     /*  Start server */
//     await app.start(process.env.PORT || 3000);
//     console.log(" Bolt app + OAuth running!");
//   } catch (err) {
//     console.error(" Startup error:", err);
//     process.exit(1);
//   }
// }

// startApp();



// import pkg from "@slack/bolt";
// const { App, ExpressReceiver } = pkg;
// import dotenv from "dotenv";
// import pool from "./db/db.js";
// import axios from "axios";

// dotenv.config();

// /* 🔹 Express Receiver (SINGLE SERVER) */
// const receiver = new ExpressReceiver({
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
// });

// /* 🔹 Slack Bolt App */
// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   receiver,
// });

// async function startApp() {
//   try {
//     /* ✅ DB Test */
//     await pool.query("SELECT 1");
//     console.log("✅ MySQL connected");

//     /* =========================
//        🏠 APP HOME
//     ========================== */
//     app.event("app_home_opened", async ({ event, client }) => {
//       await client.views.publish({
//         user_id: event.user,
//         view: {
//           type: "home",
//           blocks: [
//             {
//               type: "section",
//               text: {
//                 type: "mrkdwn",
//                 text: "*Welcome!* 👋\nClick button to see users from DB",
//               },
//             },
//             {
//               type: "actions",
//               elements: [
//                 {
//                   type: "button",
//                   text: {
//                     type: "plain_text",
//                     text: "Get Users",
//                   },
//                   action_id: "get_users_button",
//                   style: "primary",
//                 },
//               ],
//             },
//           ],
//         },
//       });
//     });

//     /* =========================
//        🔘 BUTTON CLICK
//     ========================== */
//     app.action("get_users_button", async ({ ack, body, client }) => {
//   await ack();

//   try {
//     const [users] = await pool.query(
//       "SELECT username, real_name, email FROM slack_users_master"
//     );

//     let resultBlocks = [];

//     if (users.length === 0) {
//       resultBlocks.push({
//         type: "section",
//         text: {
//           type: "mrkdwn",
//           text: "❌ *No users found in database*",
//         },
//       });
//     } else {
//       resultBlocks = users.map((u) => ({
//         type: "section",
//         text: {
//           type: "mrkdwn",
//           text: `• *${u.real_name}*\n_${u.email}_`,
//         },
//       }));
//     }

//     // 👇 SAME HOME TAB UPDATE
//     await client.views.publish({
//       user_id: body.user.id,
//       view: {
//         type: "home",
//         blocks: [
//           // 🏠 Header
//           {
//             type: "section",
//             text: {
//               type: "mrkdwn",
//               text: "*Welcome!* 👋\nClick button to see users from DB",
//             },
//           },

//           // 🔘 Button (remains visible)
//           {
//             type: "actions",
//             elements: [
//               {
//                 type: "button",
//                 text: {
//                   type: "plain_text",
//                   text: "Get Users",
//                 },
//                 action_id: "get_users_button",
//                 style: "primary",
//               },
//             ],
//           },

//           // ➖ Divider
//           {
//             type: "divider",
//           },

//           // 📋 Result appears BELOW button
//           ...resultBlocks,
//         ],
//       },
//     });
//   } catch (err) {
//     console.error("❌ Get Users Error:", err);
//   }
// });


//     /* =========================
//        🔐 OAUTH REDIRECT URL
//     ========================== */
//     receiver.app.get("/slack/oauth_redirect", async (req, res) => {
//       try {
//         const code = req.query.code;

//         const oauthRes = await axios.post(
//           "https://slack.com/api/oauth.v2.access",
//           null,
//           {
//             params: {
//               client_id: process.env.SLACK_CLIENT_ID,
//               client_secret: process.env.SLACK_CLIENT_SECRET,
//               code,
//             },
//           }
//         );

//         if (!oauthRes.data.ok) {
//           return res.send("❌ OAuth failed");
//         }

//         const { access_token, team, authed_user } = oauthRes.data;

//         /* 🔹 Store installation */
//         await pool.query(
//           `INSERT INTO slack_installations
//            (team_id, team_name, admin_user_id, access_token)
//            VALUES (?, ?, ?, ?)`,
//           [team.id, team.name, authed_user.id, access_token]
//         );

//         res.send("✅ Slack App Installed Successfully!");
//       } catch (err) {
//         console.error("❌ OAuth Error:", err);
//         res.send("❌ OAuth Error");
//       }
//     });

//     /* =========================
//        👤 USER CREATED / UPDATED
//        (ADMIN adds user)
//     ========================== */
//     app.event("user_change", async ({ event }) => {
//       try {
//         const user = event.user;

//         await pool.query(
//           `INSERT INTO slack_users_master
//            (slack_user_id, username, real_name, email, is_bot)
//            VALUES (?, ?, ?, ?, ?)
//            ON DUPLICATE KEY UPDATE
//            username = VALUES(username),
//            real_name = VALUES(real_name),
//            email = VALUES(email),
//            is_bot = VALUES(is_bot)`,
//           [
//             user.id,
//             user.name,
//             user.real_name,
//             user.profile.email || "",
//             user.is_bot ? 1 : 0,
//           ]
//         );

//         console.log("✅ User synced:", user.name);
//       } catch (err) {
//         console.error("❌ User Sync Error:", err);
//       }
//     });
//     receiver.app.get("/test-users", async (req, res) => {
//       try {
//         const [rows] = await pool.query("SELECT * FROM slack_users_master");

//         res.json(rows);
//       } catch (err) {
//         console.error("Test Users Error:", err);
//         res.status(500).json({ error: "DB error" });
//       }
//     });


//     /* 🚀 START SINGLE SERVER */
//     receiver.app.listen(process.env.PORT || 3000, () => {
//       console.log("🌐 OAuth + Slack app running on port 3000");
//     });
//   } catch (err) {
//     console.error("❌ Startup error:", err);
//     process.exit(1);
//   }
// }

// startApp();


import pkg from "@slack/bolt";
const { App, ExpressReceiver } = pkg;
import slackOAuthRoutes from "./routes/slackOAuth.js";
import dotenv from "dotenv";
import pool from "./db/db.js";
import axios from "axios";

dotenv.config();

// 👥 Meet & Greet receivers (2 users)
const MEET_AND_GREET_USERS = [
  "U0ABFN858K1", // user 1 ID
  "U0A93NAGCDC", // user 2 ID
];


/*  Express Receiver */
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

/*  Slack Bolt App */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

/*  Log incoming payload */
app.use(async ({ body, next }) => {
  console.log("📩 Incoming Slack payload type:", body?.type);
  await next();
});

receiver.app.use(slackOAuthRoutes);
async function startApp() {
  try {
    /* 🔹 DB test */
    await pool.query("SELECT 1");
    console.log("✅ MySQL connected");

    /* 🔹 App Home */
    app.event("app_home_opened", async ({ event, client }) => {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Welcome! Click button to add yourself 👇",
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "Click Me" },
                  action_id: "click_me_button",
                  style: "primary",
                },
              ],
            },
          ],
        },
      });
    });
    /* =========================
    NEW USER JOIN → MEET & GREET
========================== */
app.event("team_join", async ({ event, client }) => {
  try {
    const newUser = event.user;

    const userName =
      newUser.real_name || newUser.profile?.real_name || newUser.name;

    for (const userId of MEET_AND_GREET_USERS) {
      await client.chat.postMessage({
        channel: userId,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🎉 *New member joined!*\n\n👤 *Name:* ${userName}\n🆔 *Slack ID:* ${newUser.id}\n\n🤝 Please do a *meet & greet*`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "✅ Meet & Greet Done",
                },
                style: "primary",
                action_id: "meet_greet_done",
                value: newUser.id,
              },
            ],
          },
        ],
      });
    }

    console.log("✅ Meet & Greet messages sent");
  } catch (err) {
    console.error("❌ team_join error:", err);
  }
});
/* =========================
    MEET & GREET DONE BUTTON
========================== */
app.action("meet_greet_done", async ({ ack, body, client }) => {
  await ack();

  try {
    const clickedBy = body.user.id;
    const newUserId = body.actions[0].value;

    const channelId = body.channel.id;
    const messageTs = body.message.ts;

    //  UPDATE SAME MESSAGE (button → text)
    await client.chat.update({
      channel: channelId,
      ts: messageTs,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *Meet & Greet Completed*\n\n New member: <@${newUserId}>`,
          },
        },
      ],
    });

    console.log("✅ Message updated, button removed");
  } catch (err) {
    console.error("❌ Meet & Greet Update Error:", err);
  }
});



    /*  Button Click */
    app.action("click_me_button", async ({ ack, body, client }) => {
      await ack();

      try {
        const slackUserId = body.user.id;

        const userInfo = await client.users.info({
          user: slackUserId,
        });

        const userName =
          userInfo.user.real_name || userInfo.user.name;

        await pool.query(
          `INSERT IGNORE INTO users (slack_user_id, name)
           VALUES (?, ?)`,
          [slackUserId, userName]
        );

        const [users] = await pool.query("SELECT * FROM users");

        const userBlocks = users.map(user => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `• *${user.name}* (Slack ID: ${user.slack_user_id})`,
          },
        }));

        await client.views.publish({
          user_id: body.user.id,
          view: {
            type: "home",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "Welcome! Click button to add yourself 👇",
                },
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: { type: "plain_text", text: "Click Me" },
                    action_id: "click_me_button",
                    style: "primary",
                  },
                ],
              },
              { type: "divider" },
              ...userBlocks,
            ],
          },
        });
      } catch (err) {
        console.error("❌ Button Error:", err);
      }
    });

    /*  OAuth Redirect (FINAL FIXED VERSION) */
    receiver.app.all("/slack/oauth_redirect", async (req, res) => {
      try {
        const code = req.query.code;

        if (!code) {
          return res.json({ ok: false, error: "missing_code" });
        }

        const response = await axios.get(
          "https://slack.com/api/oauth.v2.access",
          {
            params: {
              client_id: process.env.SLACK_CLIENT_ID,
              client_secret: process.env.SLACK_CLIENT_SECRET,
              code: code,
              redirect_uri: "https://localhost:3000/slack/oauth_redirect",
            },
          }
        );

        console.log("✅ OAuth Success:");
        console.log(response.data);

        res.json(response.data);
      } catch (err) {
        console.error("❌ OAuth Error:", err.response?.data || err);
        res.status(500).json(err.response?.data || { ok: false });
      }
    });

    /* 🔹 Start server */
    await app.start(3000);
    console.log("🚀 Bolt app + OAuth running on port 3000");
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startApp();
