const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
/**
 * ギルド（サーバー）設定の取得・作成
 */
async function getGuildConfig(guildId) {
    const { data, error } = await supabase
        .from('guild_configs')
        .select('*')
        .eq('guildId', guildId)
        .single();
    if (error && error.code === 'PGRST116') { // Row not found
        const { data: newData, error: insertError } = await supabase
            .from('guild_configs')
            .insert([{ guildId }])
            .select()
            .single();
        if (insertError) throw insertError;
        return newData;
    }
    if (error) throw error;
    return data;
}
/**
 * ギルドの通知チャンネルIDを更新（存在しなければ新規作成）
 */
async function updateGuildChannel(guildId, channelId) {
    const { error } = await supabase
        .from('guild_configs')
        .upsert({ guildId, channelId }, { onConflict: 'guildId' });
    if (error) throw error;
}
/**
 * ユーザー状態の取得・作成
 */
async function getUserStatus(userId) {
    const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('userId', userId)
        .single();
    if (error && error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
            .from('user_tasks')
            .insert([{ userId }])
            .select()
            .single();
        if (insertError) throw insertError;
        return newData;
    }
    if (error) throw error;
    return data;
}
/**
 * デイリー完了記録
 */
async function setDailyDone(userId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
        .from('user_tasks')
        .update({ lastDailyDone: today })
        .eq('userId', userId);
    if (error) throw error;
}
/**
 * 4日周期完了記録
 */
async function setSpecialDone(userId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
        .from('user_tasks')
        .update({
            specialAnchorDate: today,
            lastSpecialDoneDate: today
        })
        .eq('userId', userId);
    if (error) throw error;
}
module.exports = {
    getGuildConfig,
    updateGuildChannel,
    getUserStatus,
    setDailyDone,
    setSpecialDone,
    supabase // 直接アクセス用
};
