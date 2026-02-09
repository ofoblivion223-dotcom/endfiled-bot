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
            console.log(`Skipping guild ${config.guildId}: No channelId set.`);
            continue;
        }
        try {
            console.log(`Attempting to send reminder to channel ${config.channelId}...`);
            const channel = await client.channels.fetch(config.channelId);
            if (channel) {
                // そのチャンネルで最近発言したユーザー、またはデフォルトの案内を送信
                // 特定のユーザー向けではなく、チャンネル全体の「今日の日課板」として送信
                await channel.send({
                    content: '─── 本日のエンドフィールド日課案内 ───',
                    embeds: [embeds.createTodoEmbed({ /* 汎用的な空の状態を表示 */ })],
                    components: [embeds.createActionRow()]
                });
            }
        } catch (error) {
            console.error(`Failed to send reminder to channel ${config.channelId}:`, error);
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
