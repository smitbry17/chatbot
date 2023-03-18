require("dotenv/config");
const { Client, Collection, IntentsBitField } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("bot is online");
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith("!")) return;

  let messageLog = [
    { role: "system", content: "You are a serious chat bot"},
  ];

  await message.channel.sendTyping();

  let prevMessages = await message.channel.messages.fetch({ limit: 20 });
  prevMessages.reverse();

  prevMessages.forEach((msg) => {
    if (message.content.startsWith("!")) return;
    if (message.author.id !== client.user.id && message.author.bot) return;
    if (msg.author.id !== message.author.id) return;

    messageLog.push({
      role: "user",
      content: msg.content,
    });
  });

  const reply = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messageLog,
  });
  message.reply(reply.data.choices[0].message);
});

client.login(process.env.TOKEN);
