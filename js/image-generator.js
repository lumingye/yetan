var ImageGenerator = (function () {

    var STORAGE_KEY = 'scribe_image_gen_history';
    var MAX_HISTORY = 50;

    var history = [];

    function init() {
        loadHistory();
    }

    function loadHistory() {
        try {
            var saved = Utils.loadFromStorage(STORAGE_KEY);
            if (saved && Array.isArray(saved)) {
                history = saved;
            }
        } catch (e) {
            history = [];
        }
    }

    function saveHistory() {
        try {
            if (history.length > MAX_HISTORY) {
                history = history.slice(-MAX_HISTORY);
            }
            Utils.saveToStorage(STORAGE_KEY, history);
        } catch (e) {
            // storage full, trim older entries
            history = history.slice(-10);
            try { Utils.saveToStorage(STORAGE_KEY, history); } catch (e2) {}
        }
    }

    function generateFromAPI(prompt, options) {
        var config = API.imageConfig;
        if (!config.apiKey && !(options && options.apiKey)) {
            return Promise.reject(new Error('请先在设置中配置图像生成 API Key'));
        }
        if (!config.baseUrl && !(options && options.baseUrl)) {
            return Promise.reject(new Error('请先在设置中配置图像 API Base URL'));
        }

        var apiKey = (options && options.apiKey) || config.apiKey;
        var baseUrl = (options && options.baseUrl) || config.baseUrl;
        var model = (options && options.model) || config.model;
        var size = (options && options.size) || '1024x1024';
        var quality = (options && options.quality) || 'standard';
        var n = (options && options.n) || 1;

        var url = baseUrl.replace(/\/+$/, '');
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return Promise.reject(new Error('API Base URL 必须以 http:// 或 https:// 开头'));
        }
        if (!url.includes('/images/generations') && !url.includes('/generations')) {
            url += '/images/generations';
        }

        var body = {
            model: model,
            prompt: prompt,
            n: n,
            size: size
        };

        if (quality) body.quality = quality;

        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 120000);

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify(body),
            signal: controller.signal
        })
        .then(function (response) {
            clearTimeout(timeoutId);
            if (!response.ok) {
                return response.json().catch(function () { return {}; }).then(function (errorData) {
                    var msg = errorData.error?.message || 'HTTP ' + response.status;
                    if (response.status === 401) msg = 'API Key 无效或已过期';
                    else if (response.status === 403) msg = '无权限访问该模型';
                    else if (response.status === 429) msg = '请求频率超限，请稍后重试';
                    else if (response.status === 404) msg = 'API地址不存在，请检查Base URL是否正确';
                    else if (response.status === 400) msg = errorData.error?.message || '请求参数错误，请检查模型名称和图片尺寸';
                    throw new Error(msg);
                });
            }
            return response.json();
        })
        .then(function (data) {
            var images = extractImages(data, 'openai');
            if (!images || images.length === 0) {
                throw new Error('API返回成功但未包含图片数据，请检查模型是否支持图片生成');
            }
            var record = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
                prompt: prompt,
                images: images,
                method: 'api',
                model: model,
                timestamp: Date.now()
            };
            history.push(record);
            saveHistory();
            return record;
        })
        .catch(function (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') {
                throw new Error('请求超时（120秒），图片生成耗时过长，请检查网络连接或API服务状态');
            }
            if (e.message && (e.message.includes('Failed to fetch') || e.message.includes('NetworkError'))) {
                throw new Error('网络连接失败，无法访问API服务器。请检查：1) Base URL是否正确 2) 网络是否通畅 3) 是否存在CORS限制');
            }
            throw e;
        });
    }

    function generateFromCurl(curlCommand, promptOverrides) {
        var parsed = CurlParser.parse(curlCommand);
        if (parsed.error) {
            return Promise.reject(new Error('curl命令解析失败: ' + parsed.error));
        }

        var fetchOptions = CurlParser.toFetchOptions(parsed);
        if (!fetchOptions) {
            return Promise.reject(new Error('无法将curl命令转换为可执行的请求'));
        }

        if (promptOverrides && typeof fetchOptions.body === 'string') {
            try {
                var bodyObj = JSON.parse(fetchOptions.body);
                if (promptOverrides.prompt) {
                    if (bodyObj.prompt !== undefined) bodyObj.prompt = promptOverrides.prompt;
                    else if (bodyObj.text_prompts) bodyObj.text_prompts = [{ text: promptOverrides.prompt, weight: 1 }];
                }
                if (promptOverrides.size) {
                    if (bodyObj.size !== undefined) bodyObj.size = promptOverrides.size;
                    else if (bodyObj.width && bodyObj.height) {
                        var dims = promptOverrides.size.split('x');
                        if (dims.length === 2) {
                            bodyObj.width = parseInt(dims[0]);
                            bodyObj.height = parseInt(dims[1]);
                        }
                    }
                }
                fetchOptions.body = JSON.stringify(bodyObj);
            } catch (e) {
                // can't modify body
            }
        }

        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 60000);
        fetchOptions.signal = controller.signal;

        return fetch(parsed.url, fetchOptions)
        .then(function (response) {
            clearTimeout(timeoutId);
            if (!response.ok) {
                return response.json().catch(function () { return {}; }).then(function (errorData) {
                    var msg = errorData.error?.message || 'HTTP ' + response.status;
                    if (response.status === 401) msg = 'API Key 无效或已过期';
                    else if (response.status === 403) msg = '无权限访问该模型';
                    else if (response.status === 429) msg = '请求频率超限，请稍后重试';
                    throw new Error(msg);
                });
            }
            return response.json();
        })
        .then(function (data) {
            var responseFormat = detectResponseFormat(parsed.url, data);
            var images = extractImages(data, responseFormat);
            var prompt = '';
            if (promptOverrides && promptOverrides.prompt) {
                prompt = promptOverrides.prompt;
            } else if (typeof fetchOptions.body === 'string') {
                try {
                    var bodyObj = JSON.parse(fetchOptions.body);
                    prompt = bodyObj.prompt || '';
                    if (!prompt && bodyObj.text_prompts) {
                        prompt = bodyObj.text_prompts.map(function (t) { return t.text || t; }).join('; ');
                    }
                } catch (e) {}
            }

            var record = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
                prompt: prompt,
                images: images,
                method: 'curl',
                curlCommand: curlCommand,
                timestamp: Date.now()
            };
            history.push(record);
            saveHistory();
            return record;
        })
        .catch(function (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') {
                throw new Error('请求超时（60秒），请检查网络连接或API服务状态');
            }
            throw e;
        });
    }

    function detectResponseFormat(url, data) {
        if (url.includes('stability.ai')) return 'stability';
        if (data.data && Array.isArray(data.data)) {
            if (data.data[0] && data.data[0].b64_json) return 'openai_b64';
            return 'openai';
        }
        if (data.artifacts) return 'stability';
        if (data.images) return 'simple';
        if (data.output && data.output.img_url) return 'baidu';
        return 'openai';
    }

    function extractImages(data, format) {
        var images = [];

        try {
            switch (format) {
                case 'openai':
                    if (data.data && Array.isArray(data.data)) {
                        data.data.forEach(function (item) {
                            images.push({
                                url: item.url || '',
                                b64: item.b64_json || '',
                                revisedPrompt: item.revised_prompt || ''
                            });
                        });
                    }
                    break;

                case 'openai_b64':
                    if (data.data && Array.isArray(data.data)) {
                        data.data.forEach(function (item) {
                            images.push({
                                url: '',
                                b64: item.b64_json || '',
                                revisedPrompt: item.revised_prompt || ''
                            });
                        });
                    }
                    break;

                case 'stability':
                    if (data.artifacts && Array.isArray(data.artifacts)) {
                        data.artifacts.forEach(function (artifact) {
                            images.push({
                                url: '',
                                b64: artifact.base64 || '',
                                revisedPrompt: ''
                            });
                        });
                    }
                    break;

                case 'baidu':
                    if (data.output && data.output.img_url) {
                        images.push({
                            url: data.output.img_url,
                            b64: '',
                            revisedPrompt: ''
                        });
                    }
                    break;

                case 'simple':
                    if (data.images && Array.isArray(data.images)) {
                        data.images.forEach(function (img) {
                            images.push({
                                url: typeof img === 'string' ? img : (img.url || ''),
                                b64: img.b64_json || img.base64 || '',
                                revisedPrompt: ''
                            });
                        });
                    }
                    break;

                default:
                    if (data.data && Array.isArray(data.data)) {
                        data.data.forEach(function (item) {
                            images.push({
                                url: item.url || '',
                                b64: item.b64_json || item.base64 || '',
                                revisedPrompt: item.revised_prompt || ''
                            });
                        });
                    }
            }
        } catch (e) {
            // extraction failed
        }

        return images;
    }

    function getImageSrc(imageData) {
        if (imageData.url) return imageData.url;
        if (imageData.b64) return 'data:image/png;base64,' + imageData.b64;
        return '';
    }

    function convertUrlToBase64(url) {
        return new Promise(function (resolve, reject) {
            if (!url || url.startsWith('data:')) {
                resolve(url);
                return;
            }
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                try {
                    var canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    var dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                } catch (e) {
                    resolve(url);
                }
            };
            img.onerror = function () {
                resolve(url);
            };
            img.src = url;
        });
    }

    function downloadImage(imageData, filename) {
        var src = getImageSrc(imageData);
        if (!src) return;

        if (src.startsWith('data:')) {
            var link = document.createElement('a');
            link.href = src;
            link.download = filename || 'coc-image-' + Date.now() + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            fetch(src)
            .then(function (res) { return res.blob(); })
            .then(function (blob) {
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = filename || 'coc-image-' + Date.now() + '.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            })
            .catch(function () {
                window.open(src, '_blank');
            });
        }
    }

    function getHistory() {
        return history.slice().reverse();
    }

    function clearHistory() {
        history = [];
        try { Utils.removeFromStorage(STORAGE_KEY); } catch (e) {}
    }

    function deleteFromHistory(id) {
        history = history.filter(function (item) { return item.id !== id; });
        saveHistory();
    }

    function buildCurlFromConfig(prompt, options) {
        var config = API.imageConfig;
        var apiKey = (options && options.apiKey) || config.apiKey;
        var baseUrl = (options && options.baseUrl) || config.baseUrl;
        var model = (options && options.model) || config.model;
        var size = (options && options.size) || '1024x1024';
        var quality = (options && options.quality) || 'standard';

        var url = baseUrl.replace(/\/+$/, '');
        if (!url.includes('/images/generations') && !url.includes('/generations')) {
            url += '/images/generations';
        }

        return CurlParser.generateCurl({
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: {
                model: model,
                prompt: prompt,
                n: 1,
                size: size,
                quality: quality
            }
        });
    }

    return {
        init: init,
        generateFromAPI: generateFromAPI,
        generateFromCurl: generateFromCurl,
        getImageSrc: getImageSrc,
        convertUrlToBase64: convertUrlToBase64,
        downloadImage: downloadImage,
        getHistory: getHistory,
        clearHistory: clearHistory,
        deleteFromHistory: deleteFromHistory,
        buildCurlFromConfig: buildCurlFromConfig
    };
})();
