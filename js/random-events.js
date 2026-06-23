/**
 * 随机事件系统（Oracle）
 * 从模组 randomEvents 表中按条件抽取事件，注入 L2 提示词
 * 与 story.js 低耦合：Story.state.randomEvents 存事件表，本模块只读+提示
 *
 * 模组 JSON 格式：
 * "randomEvents": [
 *   {
 *     "id": "evt_xxx",
 *     "trigger": "location" | "turn" | "stage",
 *     "location": "渔村",           // trigger=location 时必填
 *     "stageIndex": 1,              // trigger=stage 时必填
 *     "everyNTurns": 3,             // trigger=turn 时必填，每N轮触发一次
 *     "probability": 0.3,           // 触发概率 0-1
 *     "onceOnly": true,             // 是否只触发一次
 *     "prompt": "村民投来警惕的目光，有人在低声议论新月..."  // 注入KP提示词
 *   }
 * ]
 */
var RandomEvents = {

    /**
     * 初始化模组的随机事件表
     * @param {array} events 模组定义的 randomEvents
     */
    init: function(events) {
        if (!events || !Array.isArray(events)) return;
        if (typeof Story === 'undefined' || !Story.state) return;
        Story.state.randomEvents = events;
        Story.state.triggeredRandomEvents = [];
        Story.state._turnCounter = 0;
    },

    /**
     * 每轮调用：检查并返回应触发的事件提示
     * @returns {string} 注入L2的提示文本，空字符串表示无触发
     */
    check: function() {
        if (typeof Story === 'undefined' || !Story.state) return '';
        var events = Story.state.randomEvents;
        if (!events || events.length === 0) return '';

        Story.state._turnCounter = (Story.state._turnCounter || 0) + 1;
        var triggered = Story.state.triggeredRandomEvents || [];
        var currentLocation = Story.state.currentLocation || '';
        var currentStage = Story.state.currentStageIndex || 0;
        var prompts = [];

        for (var i = 0; i < events.length; i++) {
            var evt = events[i];
            // 已触发且只触发一次
            if (evt.onceOnly && triggered.indexOf(evt.id) !== -1) continue;

            // 条件匹配
            if (!this._matchesCondition(evt, currentLocation, currentStage)) continue;

            // 概率检定
            var prob = evt.probability !== undefined ? evt.probability : 0.5;
            if (Math.random() > prob) continue;

            // 触发
            triggered.push(evt.id);
            if (evt.prompt) {
                prompts.push('【随机事件】' + evt.prompt);
            }
        }

        Story.state.triggeredRandomEvents = triggered;
        if (prompts.length > 0) {
            Story.save();
            return prompts.join('\n');
        }
        return '';
    },

    /**
     * 检查事件触发条件是否匹配
     */
    _matchesCondition: function(evt, currentLocation, currentStage) {
        switch (evt.trigger) {
            case 'location':
                return evt.location === currentLocation;
            case 'stage':
                return evt.stageIndex === currentStage;
            case 'turn':
                var n = evt.everyNTurns || 3;
                return (Story.state._turnCounter || 0) % n === 0;
            default:
                return false;
        }
    }
};
