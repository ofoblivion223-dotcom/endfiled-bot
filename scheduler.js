const cron = require('node-cron');
const db = require('./database');
const embeds = require('./utils/embeds');

/**
 * 全ギルドの通知チャンネルへ定期リマインドを送信
 */
async function sendDailyReminders(client) {
    console.log('Running daily reminder task...');

    // 登録されている全ギルド設定を取得
    const { data: configs, error } = await db.supabase
        .from('guild_configs')
        .select('*');

    if (error) {
        console.error('Failed to fetch guild configs:', error);
        return;
    }

    console.log(`Found ${configs?.length || 0} guilds to notify.`);

    for (const config of configs) {
        if (!config.channelId) {
            console.log(`Skipping guild ${config.guildId || 'unknown'}: No channelId set.`);
            continue;
        }

        try {
            console.log(`Fetching channel ${config.channelId} for guild ${config.guildId}...`);
            const channel = await client.channels.fetch(config.channelId);
            if (channel) {
                console.log(`Successfully fetched channel. Sending message...`);
                await channel.send({
                    content: '─── 本日のエンドフィールド日課案内 ───',
                    embeds: [embeds.createTodoEmbed({ /* 汎用的な空の状態を表示 */ })],
                    components: [embeds.createActionRow()]
                });
                console.log(`Message sent to channel ${config.channelId}.`);
            } else {
                console.log(`Channel ${config.channelId} not found.`);
            }
        } catch (error) {
            console.error(`Failed to send reminder to guild ${config.guildId}, channel ${config.channelId}:`, error.message);
        }
    }
}

function initScheduler(client) {
    // 毎日午前 4:00 (JST) に通知を送信 (UTCでは19:00)
    // クラウドサーバーのタイムゾーンに注意が必要
    cron.schedule('0 4 * * *', () => {
        sendDailyReminders(client);
    }, {
        scheduled: true,
        timezone: "Asia/Tokyo"
    });

    console.log('Scheduler initialized: Daily reminder set for 04:00 JST');
}

module.exports = {
    initScheduler
};
