/**
 * 守门人本地预检模块
 * 用正则规则本地预判明显违规，命中后直接 reject，不经过 AI 调用
 * 与 main.js 低耦合：只暴露 GuardrailLocal.check(playerText) 一个方法
 */
var GuardrailLocal = {

    // 规则表：每条规则含正则、违规类型、描述
    rules: [
        {
            regex: /(我(拥有|有|会|能).*(魔法|超能力|神力|法术|异能|超自然))|(我(是|变成).*(神|恶魔|天使|不死))|(施展.*(法术|魔法|咒语))/,
            type: 'power_claim',
            detail: '玩家声明拥有超自然能力'
        },
        {
            regex: /(我(一拳|一刀|一击|直接).*(打死|杀死|消灭|秒杀|解决).*(怪物|敌人|他|她))|(直接.*破解.*密码)|(瞬间.*解开)|(轻松.*击败)/,
            type: 'impossible_action',
            detail: '玩家声明不可能的结果'
        },
        {
            regex: /(我(已经|直接|自动).*(成功|完成|搞定|解决|找到))|(不用检定.*成功)|(必然成功)/,
            type: 'auto_success',
            detail: '玩家跳过检定直接声明成功'
        },
        {
            regex: /(忽略.*规则)|(跳过.*检定)|(我是.*KP)|(我是.*DM)|(系统.*提示.*忽略)|(无视.*设定)/,
            type: 'meta_gaming',
            detail: '玩家试图操纵游戏规则'
        }
    ],

    /**
     * 本地预检玩家输入
     * @param {string} playerText 玩家输入文本
     * @returns {object|null} 命中时返回 {verdict, violations}，未命中返回 null
     */
    check: function(playerText) {
        if (!playerText || typeof playerText !== 'string') return null;
        var text = playerText.trim();
        if (text.length < 2) return null;

        var violations = [];
        for (var i = 0; i < this.rules.length; i++) {
            var rule = this.rules[i];
            if (rule.regex.test(text)) {
                violations.push({ type: rule.type, detail: rule.detail });
            }
        }

        if (violations.length === 0) return null;

        return {
            verdict: violations.length >= 2 ? 'reject' : 'reject',
            violations: violations
        };
    }
};
