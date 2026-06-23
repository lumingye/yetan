const ModValidator = {
    validate(modJson) {
        var errors = [];
        var warnings = [];
        var info = [];

        if (!modJson || typeof modJson !== 'object') {
            return { valid: false, errors: [{ rule: 'format', message: '模组数据不是有效对象' }], warnings: [], info: [] };
        }

        // === 必填字段检查 ===
        var requiredFields = [
            { field: 'id', label: '模组ID' },
            { field: 'name', label: '模组名称' },
            { field: 'version', label: '版本号' },
            { field: 'era', label: '时代' },
            { field: 'startChapter', label: '起始章节' },
            { field: 'startGoal', label: '起始目标' }
        ];

        for (var i = 0; i < requiredFields.length; i++) {
            var rf = requiredFields[i];
            var val = modJson[rf.field];
            if (!val || (typeof val === 'string' && val.trim() === '')) {
                errors.push({ rule: 'required', field: rf.field, message: rf.label + ' 不能为空' });
            } else if (typeof val === 'string' && val.trim().toUpperCase() === 'TODO') {
                errors.push({ rule: 'required', field: rf.field, message: rf.label + ' 仍为 TODO 占位符' });
            }
        }

        // === startTime 检查 ===
        if (modJson.startTime) {
            var st = modJson.startTime;
            if (!st.year || !st.month || !st.day) {
                warnings.push({ rule: 'startTime', message: 'startTime 缺少年/月/日字段' });
            }
        } else {
            warnings.push({ rule: 'startTime', message: '未设置 startTime，将使用默认值' });
        }

        // === chapters 检查 ===
        var chapters = modJson.chapters || [];
        if (chapters.length === 0) {
            errors.push({ rule: 'chapters', message: '模组没有任何章节' });
        } else {
            // 检查 startChapter 是否存在
            var startChapter = modJson.startChapter;
            var startChapterFound = false;
            for (var ci = 0; ci < chapters.length; ci++) {
                var ch = chapters[ci];
                if (ch.title === startChapter || ch.id === startChapter) {
                    startChapterFound = true;
                }
                if (!ch.title && !ch.id) {
                    errors.push({ rule: 'chapter_title', message: '第 ' + (ci + 1) + ' 个章节缺少 title 或 id' });
                }
                if (!ch.phase) {
                    warnings.push({ rule: 'chapter_phase', message: '章节「' + (ch.title || ch.id || ci) + '」缺少 phase 字段' });
                }
            }
            if (!startChapterFound && startChapter) {
                errors.push({ rule: 'startChapter_ref', message: 'startChapter「' + startChapter + '」在 chapters 中不存在' });
            }
        }

        // === NPC 引用完整性 ===
        var npcs = modJson.npcs || [];
        var npcNames = [];
        for (var ni = 0; ni < npcs.length; ni++) {
            var npc = npcs[ni];
            if (npc.name) npcNames.push(npc.name);
            if (!npc.name) {
                errors.push({ rule: 'npc_name', message: '第 ' + (ni + 1) + ' 个 NPC 缺少 name' });
            }
            if (npc.hp !== undefined && npc.hpMax !== undefined && npc.hp > npc.hpMax) {
                warnings.push({ rule: 'npc_hp', message: 'NPC「' + npc.name + '」HP > HPMax' });
            }
            if (npc.san !== undefined && npc.sanMax !== undefined && npc.san > npc.sanMax) {
                warnings.push({ rule: 'npc_san', message: 'NPC「' + npc.name + '」SAN > SANMax' });
            }
        }

        // === locations 检查 ===
        var locations = modJson.locations || [];
        var locationNames = [];
        var locationConnections = {};
        for (var li = 0; li < locations.length; li++) {
            var loc = locations[li];
            if (loc.name) {
                locationNames.push(loc.name);
                locationConnections[loc.name] = loc.connections || [];
            } else {
                errors.push({ rule: 'location_name', message: '第 ' + (li + 1) + ' 个地点缺少 name' });
            }
        }

        // 检查 connections 是否引用了已定义的地点
        for (var lni = 0; lni < locationNames.length; lni++) {
            var lName = locationNames[lni];
            var conns = locationConnections[lName] || [];
            for (var cni = 0; cni < conns.length; cni++) {
                if (locationNames.indexOf(conns[cni]) === -1) {
                    warnings.push({ rule: 'location_connection', message: '地点「' + lName + '」的连接「' + conns[cni] + '」未在 locations 中定义' });
                }
            }
        }

        // 检查 NPC location 是否在 locations 中
        for (var nli = 0; nli < npcs.length; nli++) {
            var nLoc = npcs[nli].location;
            if (nLoc && locationNames.length > 0 && locationNames.indexOf(nLoc) === -1) {
                warnings.push({ rule: 'npc_location', message: 'NPC「' + npcs[nli].name + '」的 location「' + nLoc + '」未在 locations 中定义' });
            }
        }

        // === endings 检查 ===
        var endings = modJson.endings || [];
        if (endings.length === 0) {
            warnings.push({ rule: 'endings', message: '模组没有定义任何结局' });
        } else {
            var endingIds = [];
            for (var ei = 0; ei < endings.length; ei++) {
                var ending = endings[ei];
                if (!ending.id) {
                    errors.push({ rule: 'ending_id', message: '第 ' + (ei + 1) + ' 个结局缺少 id' });
                } else {
                    endingIds.push(ending.id);
                }
                if (!ending.title && !ending.name) {
                    warnings.push({ rule: 'ending_title', message: '结局「' + (ending.id || ei) + '」缺少标题' });
                }
                if (!ending.condition && !ending.description) {
                    warnings.push({ rule: 'ending_desc', message: '结局「' + (ending.id || ei) + '」缺少触发条件或描述' });
                }
            }
        }

        // === doomsdayClocks 检查 ===
        var clocks = modJson.doomsdayClocks || [];
        for (var di = 0; di < clocks.length; di++) {
            var clock = clocks[di];
            if (!clock.id) {
                warnings.push({ rule: 'clock_id', message: '第 ' + (di + 1) + ' 个末日钟缺少 id' });
            }
            if (clock.endingId) {
                var eIds = endings.map(function(e) { return e.id; });
                if (eIds.indexOf(clock.endingId) === -1) {
                    errors.push({ rule: 'clock_ending_ref', message: '末日钟「' + (clock.id || di) + '」的 endingId「' + clock.endingId + '」在 endings 中不存在' });
                }
            }
            if (!clock.year || !clock.month || !clock.day) {
                warnings.push({ rule: 'clock_time', message: '末日钟「' + (clock.id || di) + '」缺少完整的触发时间' });
            }
        }

        // === progressStages 检查 ===
        var stages = modJson.progressStages || [];
        if (stages.length === 0) {
            info.push({ rule: 'stages', message: '模组没有定义 progressStages，阶段推进将不可用' });
        } else {
            for (var si = 0; si < stages.length; si++) {
                var stage = stages[si];
                if (!stage.name) {
                    errors.push({ rule: 'stage_name', message: '第 ' + (si + 1) + ' 个阶段缺少 name' });
                }
                var conds = stage.advanceConditions || [];
                for (var aci = 0; aci < conds.length; aci++) {
                    var cond = conds[aci];
                    if (cond.type === 'flag' && !cond.flag) {
                        errors.push({ rule: 'stage_flag', message: '阶段「' + (stage.name || si) + '」的 flag 类型条件缺少 flag 字段' });
                    }
                }
            }
        }

        // === introNarrative 检查 ===
        if (!modJson.introNarrative && !modJson.openingNarrative) {
            warnings.push({ rule: 'intro', message: '模组没有开场叙事（introNarrative），AI 将自行创作开场' });
        }

        // === kpNotesGlobal 检查 ===
        if (!modJson.kpNotesGlobal && !modJson.kpNotes) {
            info.push({ rule: 'kp_notes', message: '模组没有全局 KP 笔记，AI 将仅依赖系统提示词' });
        }

        // === 线索可达性（简化版：检查 progressStages 中的 flag 是否在 chapters 的 keyClues 中有对应） ===
        if (stages.length > 0) {
            var allFlags = [];
            for (var fi = 0; fi < stages.length; fi++) {
                var sConds = stages[fi].advanceConditions || [];
                for (var fci = 0; fci < sConds.length; fci++) {
                    if (sConds[fci].type === 'flag' && sConds[fci].flag) {
                        allFlags.push(sConds[fci].flag);
                    }
                }
            }
            info.push({ rule: 'flags_total', message: '共定义 ' + allFlags.length + ' 个阶段标志（flag）' });
        }

        var valid = errors.length === 0;

        return {
            valid: valid,
            errors: errors,
            warnings: warnings,
            info: info,
            summary: {
                errors: errors.length,
                warnings: warnings.length,
                info: info.length,
                chapters: chapters.length,
                npcs: npcs.length,
                locations: locations.length,
                endings: endings.length,
                clocks: clocks.length,
                stages: stages.length
            }
        };
    },

    formatReport(result) {
        var lines = [];
        lines.push('=== 模组校验报告 ===');
        lines.push('');

        if (result.valid) {
            lines.push('[PASS] 模组校验通过');
        } else {
            lines.push('[FAIL] 模组校验未通过');
        }

        var s = result.summary;
        lines.push('');
        lines.push('--- 结构概览 ---');
        lines.push('章节: ' + s.chapters + ' | NPC: ' + s.npcs + ' | 地点: ' + s.locations);
        lines.push('结局: ' + s.endings + ' | 末日钟: ' + s.clocks + ' | 阶段: ' + s.stages);
        lines.push('错误: ' + s.errors + ' | 警告: ' + s.warnings + ' | 信息: ' + s.info);

        if (result.errors.length > 0) {
            lines.push('');
            lines.push('--- 错误（必须修复）---');
            for (var i = 0; i < result.errors.length; i++) {
                lines.push('  [E] ' + result.errors[i].message);
            }
        }

        if (result.warnings.length > 0) {
            lines.push('');
            lines.push('--- 警告（建议修复）---');
            for (var j = 0; j < result.warnings.length; j++) {
                lines.push('  [W] ' + result.warnings[j].message);
            }
        }

        if (result.info.length > 0) {
            lines.push('');
            lines.push('--- 信息 ---');
            for (var k = 0; k < result.info.length; k++) {
                lines.push('  [I] ' + result.info[k].message);
            }
        }

        return lines.join('\n');
    }
};
