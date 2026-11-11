export const checked = '2026-11-11';
const commands = ['status','diff','add','commit','branch','switch','log','clone','remote','fetch','pull','push','stash','merge','rebase','cherry-pick','restore','reset','revert','reflog','show'] as const;
export const sources = Object.fromEntries(commands.map(name => [name, { title:`Git公式：git ${name}`, url:`https://git-scm.com/docs/git-${name}`, publisher:'Git Project', version:'オンラインマニュアル（参照時点。端末の git --version も確認）', checked }]));
sources.book = {title:'Pro Git：Gitのブランチ機能',url:'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell',publisher:'Git Project / Pro Git',version:'第2版・オンライン版',checked};
sources.pr = {title:'GitHub Docs：Pull request merges',url:'https://docs.github.com/en/pull-requests/reference/pull-request-merges',publisher:'GitHub',version:'オンライン版・GitHub固有の仕様',checked};
sources.secret = {title:'GitHub Docs：Removing sensitive data from a repository',url:'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',publisher:'GitHub',version:'オンライン版',checked};
sources.protection = {title:'GitHub Docs：About protected branches',url:'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches',publisher:'GitHub',version:'オンライン版・利用プランと設定に依存',checked};
