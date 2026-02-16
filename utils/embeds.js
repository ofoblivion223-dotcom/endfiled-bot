const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const COLORS = {
    PRIMARY: 0x00A3FF,
    SUCCESS: 0x00FF94,
    WARNING: 0xFFB800,
    DANGER: 0xFF4B4B,
    DARK: 0x1A1A1A
};

/**
 * タスク状況 Embed
 */
function createTodoEmbed(userStatus) {
    // 日本時間 (JST) での「今日」を取得
    const nowJst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const today = nowJst.toISOString().split('T')[0];

    const isDailyDone = userStatus.lastDailyDone === today;

    let specialStatus = '未設定 (`/done-special` で開始)';
    let isSpecialReady = false;

    if (userStatus.specialAnchorDate) {
        const anchor = new Date(userStatus.specialAnchorDate);
        // 時刻を 00:00:00 に揃えて日付の差を計算
        const d1 = Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
        const d2 = Date.UTC(nowJst.getFullYear(), nowJst.getMonth(), nowJst.getDate());
        const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        const remaining = (4 - (diffDays % 4)) % 4;

        if (remaining === 0) {
            if (userStatus.lastSpecialDoneDate === today) {
                specialStatus = '✅ 完了 (次回の採取日まであと4日)';
            } else {
                specialStatus = '🚨 **希少品採取が可能です！**';
                isSpecialReady = true;
            }
        } else {
            specialStatus = `希少品採取まであと **${remaining}** 日`;
        }
    }

    const embed = new EmbedBuilder()
        .setTitle('─── OPERATOR TASK LOG ───')
        .setColor(isSpecialReady ? COLORS.WARNING : (isDailyDone ? COLORS.SUCCESS : COLORS.PRIMARY))
        .addFields(
            { name: '■ 基礎宇宙建材 (Daily)', value: isDailyDone ? '✅ 完了' : '❌ 未完了', inline: true },
            { name: '■ 希少品採取 (4-Day)', value: specialStatus, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'アークナイツ：エンドフィールド 管理局' });

    return embed;
}

/**
 * ボタンつきメッセージ
 */
function createActionRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('done_daily')
            .setLabel('建材回収完了')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('done_special')
            .setLabel('希少品採取完了')
            .setStyle(ButtonStyle.Success)
    );
}

function createHelpEmbed() {
    return new EmbedBuilder()
        .setTitle('─── ENDFIELD SUPPORT TERMINAL ───')
        .setDescription('招待するだけで使えるクラウド版Botです。')
        .setColor(COLORS.PRIMARY)
        .addFields(
            { name: '🛠️ 初期設定', value: '`/setup` を実行して、通知用の「#アークナイツ日課」チャンネルを作成・登録してください。' },
            { name: '📅 毎日リマインド', value: '設定したチャンネルに毎朝TO-DOリストが届きます。' },
            { name: '🔘 ボタン操作', value: '届いたメッセージのボタンを押すだけで記録が更新されます。' },
            { name: '📊 ステータス', value: '`/status` で現在の進捗をいつでも確認できます。' }
        );
}

module.exports = {
    COLORS,
    createTodoEmbed,
    createActionRow,
    createHelpEmbed
};
