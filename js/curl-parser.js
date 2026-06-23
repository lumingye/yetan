var CurlParser = (function () {

    function parse(curlCommand) {
        if (!curlCommand || typeof curlCommand !== 'string') {
            return { error: '请输入有效的curl命令' };
        }

        var cmd = curlCommand.trim();

        if (!cmd.toLowerCase().startsWith('curl')) {
            return { error: '命令必须以 curl 开头' };
        }

        var result = {
            method: 'GET',
            url: '',
            headers: {},
            body: null,
            error: null
        };

        var tokens = tokenize(cmd);
        if (tokens.error) {
            return { error: tokens.error };
        }
        tokens = tokens.tokens;

        var i = 0;
        if (i < tokens.length && tokens[i].toLowerCase() === 'curl') {
            i++;
        }

        while (i < tokens.length) {
            var token = tokens[i];

            if (token === '-X' || token === '--request') {
                i++;
                if (i >= tokens.length) return { error: '-X/--request 后缺少请求方法' };
                result.method = tokens[i].toUpperCase();
                i++;
            } else if (token === '-H' || token === '--header') {
                i++;
                if (i >= tokens.length) return { error: '-H/--header 后缺少头部内容' };
                var headerStr = tokens[i];
                var colonIdx = headerStr.indexOf(':');
                if (colonIdx > 0) {
                    var headerName = headerStr.substring(0, colonIdx).trim();
                    var headerValue = headerStr.substring(colonIdx + 1).trim();
                    result.headers[headerName] = headerValue;
                }
                i++;
            } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
                i++;
                if (i >= tokens.length) return { error: '-d/--data 后缺少数据内容' };
                result.body = tokens[i];
                if (result.method === 'GET') result.method = 'POST';
                i++;
            } else if (token === '-F' || token === '--form') {
                i++;
                if (i >= tokens.length) return { error: '-F/--form 后缺少表单数据' };
                if (!result.body) result.body = {};
                var formParts = tokens[i].split('=');
                if (formParts.length >= 2) {
                    result.body[formParts[0]] = formParts.slice(1).join('=');
                }
                if (result.method === 'GET') result.method = 'POST';
                i++;
            } else if (token === '-o' || token === '--output') {
                i += 2;
            } else if (token === '-k' || token === '--insecure' || token === '-s' || token === '--silent' || token === '-S' || token === '--show-error' || token === '-L' || token === '--location' || token === '-v' || token === '--verbose' || token === '-i' || token === '--include' || token === '-g' || token === '--globoff') {
                i++;
            } else if (token === '-u' || token === '--user' || token === '--max-time' || token === '--connect-timeout' || token === '-A' || token === '--user-agent' || token === '-e' || token === '--referer' || token === '--retry') {
                i += 2;
            } else if (token.startsWith('-')) {
                i++;
            } else {
                if (!result.url) {
                    result.url = token;
                }
                i++;
            }
        }

        if (!result.url) {
            return { error: '未找到请求URL' };
        }

        if (result.body && typeof result.body === 'string') {
            try {
                result.body = JSON.parse(result.body);
            } catch (e) {
                // keep as string
            }
        }

        return result;
    }

    function tokenize(cmd) {
        var tokens = [];
        var current = '';
        var inSingleQuote = false;
        var inDoubleQuote = false;
        var escapeNext = false;
        var i = 0;

        while (i < cmd.length) {
            var ch = cmd[i];

            if (escapeNext) {
                current += ch;
                escapeNext = false;
                i++;
                continue;
            }

            if (ch === '\\' && !inSingleQuote) {
                escapeNext = true;
                i++;
                continue;
            }

            if (ch === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
                i++;
                continue;
            }

            if (ch === '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
                i++;
                continue;
            }

            if ((ch === ' ' || ch === '\t' || ch === '\n') && !inSingleQuote && !inDoubleQuote) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                i++;
                continue;
            }

            current += ch;
            i++;
        }

        if (current) {
            tokens.push(current);
        }

        if (inSingleQuote || inDoubleQuote) {
            return { tokens: [], error: '引号未闭合' };
        }

        return { tokens: tokens, error: null };
    }

    function toFetchOptions(parsed) {
        if (parsed.error) return null;

        var options = {
            method: parsed.method,
            headers: parsed.headers
        };

        if (parsed.body && parsed.method !== 'GET') {
            options.body = typeof parsed.body === 'string' ? parsed.body : JSON.stringify(parsed.body);
            if (!parsed.headers['Content-Type'] && !parsed.headers['content-type']) {
                options.headers['Content-Type'] = 'application/json';
            }
        }

        return options;
    }

    function generateCurl(config) {
        var parts = ['curl'];

        parts.push('-X', (config.method || 'POST'));

        if (config.headers) {
            for (var key in config.headers) {
                if (config.headers.hasOwnProperty(key)) {
                    parts.push('-H', "'" + key + ': ' + config.headers[key] + "'");
                }
            }
        }

        if (config.body) {
            var bodyStr = typeof config.body === 'string' ? config.body : JSON.stringify(config.body, null, 2);
            parts.push('-d', "'" + bodyStr.replace(/'/g, "\\'") + "'");
        }

        parts.push("'" + (config.url || '') + "'");

        return parts.join(' \\\n  ');
    }

    var TEMPLATES = {
        openai_dalle: {
            name: 'OpenAI DALL-E',
            description: '使用OpenAI DALL-E API生成图像',
            curl: "curl -X POST 'https://api.openai.com/v1/images/generations' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -d '{\n    \"model\": \"dall-e-3\",\n    \"prompt\": \"A dark Victorian mansion on a foggy hill, Lovecraftian horror style\",\n    \"n\": 1,\n    \"size\": \"1024x1024\",\n    \"quality\": \"standard\"\n  }'",
            responseFormat: 'openai'
        },
        zhipu_cogview: {
            name: '智谱 CogView',
            description: '使用智谱AI CogView模型生成图像',
            curl: "curl -X POST 'https://open.bigmodel.cn/api/paas/v4/images/generations' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -d '{\n    \"model\": \"cogview-3-plus\",\n    \"prompt\": \"一座雾气缭绕的维多利亚式宅邸，克苏鲁恐怖风格\",\n    \"size\": \"1024x1024\"\n  }'",
            responseFormat: 'openai'
        },
        stability_sd: {
            name: 'Stability AI',
            description: '使用Stability AI Stable Diffusion生成图像',
            curl: "curl -X POST 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -d '{\n    \"text_prompts\": [\n      { \"text\": \"A dark Victorian mansion on a foggy hill, Lovecraftian horror style\", \"weight\": 1 }\n    ],\n    \"cfg_scale\": 7,\n    \"height\": 1024,\n    \"width\": 1024,\n    \"steps\": 30,\n    \"samples\": 1\n  }'",
            responseFormat: 'stability'
        },
        siliconflow: {
            name: '硅基流动',
            description: '使用硅基流动图像生成API',
            curl: "curl -X POST 'https://api.siliconflow.cn/v1/images/generations' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -d '{\n    \"model\": \"stabilityai/stable-diffusion-xl-base-1.0\",\n    \"prompt\": \"A dark Victorian mansion on a foggy hill, Lovecraftian horror style\",\n    \"image_size\": \"1024x1024\",\n    \"batch_size\": 1\n  }'",
            responseFormat: 'openai'
        },
        custom: {
            name: '自定义',
            description: '输入自定义的curl命令',
            curl: "curl -X POST 'YOUR_API_URL' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -d '{\n    \"prompt\": \"描述你想要生成的图像\",\n    \"size\": \"1024x1024\"\n  }'",
            responseFormat: 'openai'
        }
    };

    return {
        parse: parse,
        toFetchOptions: toFetchOptions,
        generateCurl: generateCurl,
        TEMPLATES: TEMPLATES
    };
})();
