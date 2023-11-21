require("dotenv").config();
const axios = require("axios");
const cohereApiUrl = "https://api.cohere.ai/v1/chat";
const cohereApiToken = process.env.COHERE_TOKEN; // Replace with your actual API token

// Discord.js versions ^13.0 require us to explicitly define client intents

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Log In our bot

client.login(process.env.CLIENT_TOKEN);
let isChatting = false;

client.on("messageCreate", (msg) => {
  // You can view the msg object here with console.log(msg)
  console.log(msg.content);
  if (msg.content === "Hello") {
    msg.reply(`Hello ${msg.author.username}`);
  }

  if (msg.content === "/jarvis" && !isChatting) {
    isChatting = true;
    msg.reply(
      "Hello! I'm here to assist you. Feel free to ask me anything. Type 'exit' to stop."
    );
    return; // Do not proceed to chatReply immediately
  }

  while (isChatting && msg.content.toLowerCase() !== "exit") {
    if (msg.author.bot) {
      return; // Ignore messages from bots
    } // Ignore messages from bots
    else {
      chatReply(msg.content)
        .then((reply) => {
          if (reply.length < 2000) {
            msg.reply(reply);
          } else {
            msg.reply("I am sorry, I am not that smart yet. Please try again.");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return; // Do not proceed further after chatReply
  }

  if (msg.content.toLowerCase() === "exit") {
    isChatting = false;
    msg.reply(
      "Exiting chat. If you need assistance, feel free to type 'help' again."
    );
  }
});

const chatReply = async (msg) => {
  const requestData = {
    model: "command-light-nightly",
    message: msg,
    temperature: 0.1,
    chat_history: [],
    prompt_truncation: "auto",
    stream: true,
    citation_quality: "accurate",
    connectors: [],
    documents: [],
  };

  const headers = {
    Authorization: `Bearer ${cohereApiToken}`,
    "Content-Type": "application/json",
  };

  try {
    console.log("Cohere API Reques");
    const response = await axios.post(cohereApiUrl, requestData, { headers });

    const dataObjects = response.data
      .split("\n")
      .filter(Boolean)
      .map(JSON.parse);

    // Access the last object in the array
    const lastObject = dataObjects[dataObjects.length - 1];

    return lastObject?.response?.text;
  } catch (error) {
    throw new Error(`Cohere API request failed: ${error.message}`);
  }
};

const messageToCohere = "Hello, Cohere!";
chatReply(messageToCohere)
  .then((apiResponse) => {
    console.log("Cohere API Response:", apiResponse);
  })
  .catch((error) => {
    console.error(error.message);
  });
