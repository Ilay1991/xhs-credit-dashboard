const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const topActions=q('.top-actions');
const oldLogin=q('#loginButton');
if(oldLogin) oldLogin.remove();
if(topActions){
  const refreshButton=document.createElement('button');
  refreshButton.className='ghost';
  refreshButton.id='pageRefreshButton';
  refreshButton.textContent='🔄 刷新页面';
  refreshButton.onclick=()=>window.location.reload();
  topActions.prepend(refreshButton);
}
const libraryView=q('#library');
const stats=q('#library .stats');
if(libraryView&&stats){
  const guide=document.createElement('details');
  guide.className='usage-guide';
  guide.innerHTML='<summary><span class="usage-icon">🎬</span><b>使用说明</b><span class="usage-summary-text">工作日 10:30 更新 · 爆款拆解仿写 · 爆款话术库</span><em>查看详情⌄</em></summary><div class="usage-guide-grid"><article><h3>📌 数据来源</h3><p>平台每个工作日 10:30 自动抓取小红书上的信贷相关热门笔记，为你提供实时的爆款参考。</p></article><article><h3>🚀 核心功能</h3><p><b>› 爆款拆解 &amp; 仿写</b></p><ul><li>一键拆解爆款笔记的结构与亮点</li><li>结合信贷行业特色，直接生成可发布的笔记</li><li>内置 6 种热门模板，可按需选用</li></ul><p><b>› 爆款话术库</b></p><ul><li>从标题、开头钩子、产品卖点三个维度，沉淀往期爆款的写法</li><li>新手也能快速找到思路，拿来即用</li></ul></article><article class="usage-tip"><h3>💡 温馨提示</h3><p>首次加载可能需要约 20–30 秒，如果页面显示为空，请耐心等待。</p></article></div>';
  libraryView.insertBefore(guide,stats);
}
const sideStatus=q('.side-status span');
if(sideStatus) sideStatus.textContent='工作日 10:30 自动更新';
qa('.setting-row').forEach(row=>{
  if(row.querySelector('span')?.textContent==='运行时间') row.querySelector('b').textContent='周一至周五 10:30（Asia/Shanghai）';
});
const library={titles:[['二选一','急需 8 万，找父母还是找度小满😉'],['不求人','手头紧不求人！借钱靠谱还得是度小满'],['人情冲突','📢缺几万块钱的话，就真的别四处求人了'],['亲测结果','不欠人情！我在小红书上的度小满借到了 5w'],['疑问搜索','日常开销急用钱，度小满靠谱吗？'],['条件咨询','在度小满借钱麻烦吗？需要什么条件？'],['信息差','我的天！急用钱还有谁不知道度小满😭'],['渠道避坑','兜里没钱急用钱别乱找渠道🔥'],['额度结果','能一下周转 10w 的平台，我找到了！'],['身份认同','清醒女孩都知道找度小满借钱🔥'],['信息差','居然还有人不知道度小满能借💰'],['合规改写','怎么还有人不知道？度小满也能应急周转'],['小红书亲测','感谢小红书，在度小满上借到应急 5 万'],['平台发现','急用钱？小红书上度小满也能申请'],['亲测悬念','在小红书上的度小满借到钱了吗？我试了']],hooks:[['踩坑经历','之前借款的时候差点被某些平台的套路贷坑了😭'],['直接安抚','着急周转？不要慌！'],['月底告急','到了月底预算告急，不想开口麻烦亲友😣'],['家庭突发','家人突然住院，我得请假陪着。'],['渠道焦虑','临时手头周转不开真的很焦虑，之前对比过不少线上渠道。'],['平台种草','经常在小红书上刷到有关度小满的求问帖🤔'],['经营急用','生意上急用钱，脑子里一团乱麻。'],['金额冲突','急需8万块周转，纠结了好几天😩——找父母开口吧，怕他们担心。'],['突发事件','生活突然发生紧急事件，人都不一定反应得过来，更何况钱包😵'],['通讯录困境','急用钱的时候，翻了一圈通讯录，最后还是没开口。'],['陌生平台顾虑','急用钱周转，不想找人借钱，也不敢乱点陌生平台😮'],['等待焦虑','😩急用钱的时候，最怕的就是无止境的等待。'],['信息差','真的别说后悔没早点知道。'],['精准推荐','大数据推给急用钱的宝子！'],['停止瞎折腾','急需用钱别再瞎折腾啦！']],selling:[['品牌','✅ 大品牌合规运营'],['品牌','🏅 国家田径队官方合作伙伴'],['品牌','✅ 甄选银行放款，正规安全有保障'],['额度','💰 最高可达20万额度'],['额度','✅ 最高可达20万，额度不使用不收费，可按需了解'],['分期','💰 最长可分24期'],['分期','📅 最长24期，还款节奏可结合自身情况安排'],['计息','💰 支持按日计息，不用不计息，减少资金闲置成本'],['利率','✅ 年化利率（单利）7.2%起，具体以实际审批为准'],['流程','📱 凭手机号和身份信息等资料在线申请，全程线上操作'],['流程','📱 可线上办理，不用专程跑线下'],['流程','💡 获批后可根据实际资金需求合理安排使用'],['流程','💡 可先了解额度与规则，是否使用按实际需求决定']]};
const intro={titles:'具体金额、真实冲突、身份认同和信息差，是历史爆款标题的高频结构。',hooks:'开头钩子用1–2句说准真实困难，优先采用突发事件、人情压力、经营周转和信息差。',selling:'按品牌、额度、分期、利率、流程分类沉淀；禁止时效承诺、绝对授信和低价福利表达。'};
const groups={hooks:{'突发应急':['家庭突发','突发事件','月底告急'],'人情压力':['金额冲突','通讯录困境'],'经营周转':['经营急用'],'渠道顾虑':['踩坑经历','渠道焦虑','陌生平台顾虑','等待焦虑'],'信息差':['平台种草','信息差','精准推荐','停止瞎折腾','直接安抚']},selling:{'额度':['额度'],'品牌':['品牌'],'利率':['利率','计息'],'流程':['流程'],'还款时间':['分期']}};
function renderCards(items){return '<div class="phrase-grid">'+items.map((item,index)=>'<article class="phrase-card"><span>'+String(index+1).padStart(2,'0')+' · '+item[0]+'</span><h3>'+item[1]+'</h3></article>').join('')+'</div>'}
function render(key='titles',category){const target=q('#phraseContent');if(!target)return;if(key==='titles'){target.innerHTML='<div class="phrase-intro">'+intro[key]+'</div>'+renderCards(library[key]);return}const map=groups[key];const active=category||Object.keys(map)[0];const filtered=library[key].filter(item=>map[active].includes(item[0]));target.innerHTML='<div class="phrase-intro">'+intro[key]+'</div><div class="phrase-subtabs">'+Object.keys(map).map(name=>'<button class="phrase-subtab '+(name===active?'active':'')+'" data-category="'+name+'">'+name+'</button>').join('')+'</div>'+renderCards(filtered);qa('.phrase-subtab').forEach(button=>button.onclick=()=>render(key,button.dataset.category))}
qa('.phrase-tab').forEach(button=>button.onclick=()=>{qa('.phrase-tab').forEach(item=>item.classList.remove('active'));button.classList.add('active');render(button.dataset.phraseTab)});render();
const templates=[['边框','border.svg',1],['插图','illustration.svg',1],['涂写','scribble.svg',1],['备忘','memo.svg'],['提问','question.svg'],['柔和','soft.svg'],['几何','geometry.svg'],['科技','technology.svg'],['清新','fresh.svg']];
