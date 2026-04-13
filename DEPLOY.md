# Daily 部署指南(Cloudflare Pages + D1 + Access)

全部免费。预计耗时 10–15 分钟。

## 0. 你会用到的账号
- GitHub: `fjhy1116@gmail.com`
- Cloudflare: `fjhy1116@gmail.com`

## 1. 把代码推到 GitHub

已经在 `C:\personal\daily` 初始化好 git,下面创建一个远端仓库并推送。

1. 打开 https://github.com/new
2. Repository name: `daily`
3. 选 **Private**
4. **不要** 勾 Add README / .gitignore / license(已经有了)
5. 点 Create repository
6. 回到终端(在 `C:\personal\daily` 目录),运行(把 `<你的用户名>` 换成真实的):

   ```
   git remote add origin https://github.com/<你的用户名>/daily.git
   git branch -M main
   git push -u origin main
   ```

   首次推送会让你登录 GitHub,按提示完成即可。

## 2. 在 Cloudflare 创建 D1 数据库

1. 进入 https://dash.cloudflare.com → 左侧 **Workers & Pages** → **D1**
2. 点 **Create database**,名字填 `daily-db`,location 选离你近的(APAC)
3. 创建完进入 D1 → 点 **Console** 标签
4. 把 `schema.sql` 里的内容粘进去执行:
   ```sql
   CREATE TABLE IF NOT EXISTS user_data (
     email      TEXT PRIMARY KEY,
     data       TEXT NOT NULL,
     updated_at INTEGER NOT NULL
   );
   ```
5. 应该看到 "Query executed successfully"

## 3. 创建 Cloudflare Pages 项目并绑定 D1

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 Cloudflare 访问你的 GitHub,选仓库 `daily`
3. Build settings:
   - Framework preset: **None**
   - Build command: 留空
   - Build output directory: `/`(或留空)
4. 点 **Save and Deploy**,等第一次部署跑完(1–2 分钟),会得到 `https://daily-xxx.pages.dev`
5. 部署好后进入这个 Pages 项目 → **Settings** → **Bindings** → **Add** → **D1 database**
   - Variable name: `DB`(一定要大写,跟代码里 `env.DB` 对应)
   - D1 database: 选 `daily-db`
   - 保存
6. 回到 **Deployments** 标签,点最新一次 deployment 右边的 **…** → **Retry deployment**(让绑定生效)

## 4. 启用 Cloudflare Access(仅你能登录)

1. 左侧 **Zero Trust**(第一次进入会让你创建一个 team,随便起个名,选 Free 计划)
2. 进入 Zero Trust 后:**Access** → **Applications** → **Add an application**
3. 选 **Self-hosted**
4. Application name: `Daily`
5. Session duration: 随意,比如 1 month
6. Application domain: 选 `daily-xxx.pages.dev`(就是你的 Pages 域名)
7. **Next**
8. Policy name: `Only me`
9. Action: **Allow**
10. Configure rules → **Include** → Selector **Emails** → `fjhy1116@gmail.com`
11. **Next** → 其它默认 → **Add application**

## 5. 验证

1. 打开浏览器无痕窗口访问 `https://daily-xxx.pages.dev`
2. 应该跳到 Cloudflare Access 登录页,输入 `fjhy1116@gmail.com`,点邮箱里的验证码链接
3. 登录后进入网站,右上角标题旁应显示 "已同步 · fjhy1116@gmail.com"
4. 添加一条工作记录,换个设备/浏览器再登录,数据应该同步过来

## 之后怎么更新?

直接在本地改代码 → `git add` → `git commit` → `git push`,Cloudflare Pages 会自动重新部署。
