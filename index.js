require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionsBitField,
    ChannelType
} = require('discord.js');
const db = require('./database');
const embeds = require('./utils/embeds');
const scheduler = require('./scheduler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// コマンド定義 (グローバル登録)
const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('通知用の「#アークナイツ日課」チャンネルを作成・設定します'),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('現在のタスク状況を表示します'),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Botの使い方案内を表示します')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// コマンドのグローバル登録
async function registerGlobalCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

client.once(Events.ClientReady, async c => {
    console.log(`Logged in as ${c.user.tag}`);
    await registerGlobalCommands();
    scheduler.initScheduler(client);
});

// インタラクション（コマンド & ボタン）の処理
client.on(Events.InteractionCreate, async interaction => {
    // スラッシュコマンド
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, user } = interaction;

        if (commandName === 'setup') {
            await interaction.deferReply({ ephemeral: true });
            try {
                let channel = guild.channels.cache.find(c => c.name === 'アークナイツ日課');
                if (!channel) {
                    channel = await guild.channels.create({
                        name: 'アークナイツ日課',
                        type: ChannelType.GuildText
                    });
                }
                await db.updateGuildChannel(guild.id, channel.id);
                await interaction.editReply(`セットアップが完了しました！通知は <#${channel.id}> に届きます。`);
            } catch (error) {
                console.error(error);
                await interaction.editReply('セットアップ中にエラーが発生しました。Botにチャンネル作成権限があるか確認してください。');
            }
        }

        if (commandName === 'status') {
            const status = await db.getUserStatus(user.id);
            await interaction.reply({ embeds: [embeds.createTodoEmbed(status)], ephemeral: true });
        }

        if (commandName === 'help') {
            await interaction.reply({ embeds: [embeds.createHelpEmbed()], ephemeral: true });
        }
    }

    // ボタン操作
    if (interaction.isButton()) {
        const { customId, user } = interaction;
        await interaction.deferUpdate(); // メッセージを更新状態にする

        if (customId === 'done_daily') {
            await db.setDailyDone(user.id);
        } else if (customId === 'done_special') {
            await db.setSpecialDone(user.id);
        }

        // 最新のステータスでEmbedを更新
        const updatedStatus = await db.getUserStatus(user.id);
        await interaction.editReply({
            embeds: [embeds.createTodoEmbed(updatedStatus)],
            components: [embeds.createActionRow()]
        });
    }
});

// !help (互換性のため残す)
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (message.content === '!help') {
        await message.reply({ embeds: [embeds.createHelpEmbed()] });
    }
});

client.login(process.env.DISCORD_TOKEN);
