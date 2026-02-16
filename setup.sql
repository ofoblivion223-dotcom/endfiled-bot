-- サーバー設定テーブル
CREATE TABLE guild_configs (
  "guildId" TEXT PRIMARY KEY,
  "channelId" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザータスク管理テーブル
CREATE TABLE user_tasks (
  "userId" TEXT PRIMARY KEY,
  "lastDailyDone" TEXT,
  "specialAnchorDate" TEXT,
  "lastSpecialDoneDate" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) の無効化（Botから直接アクセスする場合）
-- または、サービスロールキーを使用してアクセスしてください。
ALTER TABLE guild_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks DISABLE ROW LEVEL SECURITY;
