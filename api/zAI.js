/**
 * Z.ai GLM-5 Service
 * Client-side service untuk mengakses Z.ai API
 */

export class ZAIService {
    constructor() {
        this.BASE_URL = 'https://chat.z.ai';
        this.FE_VERSION = 'prod-fe-1.0.262';
        this.MODEL = 'glm-5';
        this.UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.0';
        this.SIG_SECRET = 'key-@@@@)))()((9))-xxxx&&&%%%%%';
        
        this.token = null;
        this.userId = null;
        this.userName = null;
        this.chatId = null;
        this.messageId = null;
        this.isAuthenticated = false;
    }

    /**
     * Generate HMAC signature untuk request
     */
    _buildSignature(sortedPayload, prompt, timestamp) {
        const S = Math.floor(Number(timestamp) / 300000);
        const E = this._hmacSha256(this.SIG_SECRET, String(S));
        const d = `${sortedPayload}|${this._base64Encode(prompt)}|${timestamp}`;
        return this._hmacSha256(E, d);
    }

    /**
     * Simple HMAC-SHA256 implementation menggunakan Web Crypto API
     */
    async _hmacSha256(key, message) {
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(key),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            encoder.encode(message)
        );
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Base64 encode
     */
    _base64Encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    /**
     * Generate UUID v4
     */
    _uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Build headers untuk request
     */
    _buildHeaders(token = null) {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Accept-Language': 'en-US',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    /**
     * Build query parameters
     */
    _buildQueryParams({ token, userId, chatId, requestId, timestamp, now }) {
        const params = new URLSearchParams({
            timestamp,
            requestId,
            user_id: userId,
            version: '0.0.1',
            platform: 'web',
            token,
            user_agent: this.UA,
            language: 'en-US',
            languages: 'en-US,id-ID,id,en',
            timezone: 'Asia/Jakarta',
            cookie_enabled: 'true',
            screen_width: '1920',
            screen_height: '1080',
            screen_resolution: '1920x1080',
            viewport_height: '900',
            viewport_width: '1920',
            viewport_size: '1920x900',
            color_depth: '24',
            pixel_ratio: '1',
            current_url: `${this.BASE_URL}/c/${chatId}`,
            pathname: `/c/${chatId}`,
            search: '',
            hash: '',
            host: 'chat.z.ai',
            hostname: 'chat.z.ai',
            protocol: 'https:',
            referrer: '',
            title: 'Z.ai - Free AI Chatbot & Agent powered by GLM-5 & GLM-4.7',
            timezone_offset: '-420',
            local_time: now.toISOString(),
            utc_time: now.toUTCString(),
            is_mobile: 'false',
            is_touch: 'false',
            max_touch_points: '0',
            browser_name: 'Chrome',
            os_name: 'Linux',
            signature_timestamp: timestamp,
        });
        return params;
    }

    /**
     * Fetch dengan retry logic
     */
    async _fetch(url, init, attempt = 1) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        try {
            const res = await fetch(url, {
                ...init,
                signal: controller.signal
            });
            return res;
        } catch (err) {
            if (attempt < 3) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
                return this._fetch(url, init, attempt + 1);
            }
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Autentikasi sebagai guest
     */
    async _authenticate() {
        if (this.isAuthenticated && this.token) return;

        const res = await this._fetch(`${this.BASE_URL}/api/v1/auths/`, {
            method: 'GET',
            headers: this._buildHeaders(null),
        });

        if (!res.ok) {
            throw new Error(`Auth failed [${res.status}]: ${await res.text()}`);
        }

        const data = await res.json();
        this.token = data.token;
        this.userId = data.id;
        this.userName = data.name;
        this.isAuthenticated = true;
    }

    /**
     * Buat chat baru
     */
    async _createChat(userPrompt) {
        const messageId = this._uuidv4();
        const nowSecs = Math.floor(Date.now() / 1000);
        const nowMs = Date.now();

        const payload = {
            chat: {
                id: '',
                title: 'New Chat',
                models: [this.MODEL],
                params: {},
                history: {
                    messages: {
                        [messageId]: {
                            id: messageId,
                            parentId: null,
                            childrenIds: [],
                            role: 'user',
                            content: userPrompt,
                            timestamp: nowSecs,
                            models: [this.MODEL],
                        },
                    },
                    currentId: messageId,
                },
                tags: [],
                flags: [],
                features: [{
                    type: 'tool_selector',
                    server: 'tool_selector_h',
                    status: 'hidden'
                }],
                mcp_servers: [],
                enable_thinking: true,
                auto_web_search: false,
                message_version: 1,
                extra: {},
                timestamp: nowMs,
            },
        };

        const res = await this._fetch(`${this.BASE_URL}/api/v1/chats/new`, {
            method: 'POST',
            headers: this._buildHeaders(this.token),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Chat failed [${res.status}]: ${await res.text()}`);
        }

        const data = await res.json();
        this.chatId = data.id;
        this.messageId = messageId;
        
        return {
            chatId: data.id,
            messageId: messageId,
        };
    }

    /**
     * Parse SSE stream
     */
    async _parseSSE(response, onThinking = null) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const thinking = [];
        const answer = [];
        let usage = null;
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            if (readerDone) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data: ')) continue;
                
                const jsonStr = trimmed.slice(6).trim();
                if (jsonStr === '[DONE]') {
                    done = true;
                    continue;
                }

                let parsed;
                try {
                    parsed = JSON.parse(jsonStr);
                } catch {
                    continue;
                }

                if (parsed.type !== 'chat:completion' || !parsed.data) continue;

                const { delta_content, phase, usage: u, done: d } = parsed.data;
                if (u) usage = u;
                if (d) done = true;
                if (!delta_content) continue;

                if (phase === 'thinking') {
                    thinking.push(delta_content);
                    // Real-time thinking callback
                    if (onThinking && thinking.length % 5 === 0) {
                        onThinking(thinking.join(''));
                    }
                } else if (phase === 'answer') {
                    answer.push(delta_content);
                }
            }
        }

        // Final thinking callback
        if (onThinking && thinking.length > 0) {
            onThinking(thinking.join(''));
        }

        return {
            thinking: thinking.join(''),
            answer: answer.join(''),
            usage,
            done
        };
    }

    /**
     * Stream completion dari Z.ai
     */
    async _streamCompletion(userPrompt, onThinking = null) {
        const now = new Date();
        const ts = String(Date.now());
        const requestId = this._uuidv4();

        const sigI = {
            timestamp: ts,
            requestId,
            user_id: this.userId
        };
        const sortedPayload = Object.entries(sigI)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
        
        const signature = await this._buildSignature(sortedPayload, userPrompt, ts);

        const qp = this._buildQueryParams({
            token: this.token,
            userId: this.userId,
            chatId: this.chatId,
            requestId,
            timestamp: ts,
            now
        });

        const url = `${this.BASE_URL}/api/v2/chat/completions?${qp.toString()}`;

        const reqBody = {
            stream: true,
            model: this.MODEL,
            messages: [{
                role: 'user',
                content: userPrompt
            }],
            signature_prompt: userPrompt,
            params: {},
            extra: {},
            features: {
                image_generation: false,
                web_search: false,
                auto_web_search: false,
                preview_mode: true,
                flags: [],
                enable_thinking: true,
            },
            variables: {
                '{{USER_NAME}}': this.userName || 'User',
                '{{USER_LOCATION}}': 'Unknown',
                '{{CURRENT_DATETIME}}': now.toISOString().replace('T', ' ').slice(0, 19),
                '{{CURRENT_DATE}}': now.toISOString().slice(0, 10),
                '{{CURRENT_TIME}}': now.toISOString().slice(11, 19),
                '{{CURRENT_WEEKDAY}}': now.toLocaleDateString('en-US', { weekday: 'long' }),
                '{{CURRENT_TIMEZONE}}': 'Asia/Jakarta',
                '{{USER_LANGUAGE}}': 'en-US',
            },
            chat_id: this.chatId,
            id: requestId,
            current_user_message_id: this.messageId,
            current_user_message_parent_id: null,
            background_tasks: {
                title_generation: true,
                tags_generation: true
            },
        };

        const res = await this._fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'en-US',
                'X-FE-Version': this.FE_VERSION,
                'X-Signature': signature,
            },
            body: JSON.stringify(reqBody),
        });

        if (!res.ok) {
            throw new Error(`Completion failed [${res.status}]: ${await res.text()}`);
        }

        return this._parseSSE(res, onThinking);
    }

    /**
     * Public method: Chat dengan Z.ai
     * @param {string} prompt - Pertanyaan user
     * @param {Object} options - Options
     * @param {Function} options.onThinking - Callback saat thinking (streaming)
     * @returns {Promise<{thinking: string, answer: string, usage: Object}>}
     */
    async chat(prompt, options = {}) {
        const { onThinking } = options;

        try {
            // Step 1: Authenticate
            await this._authenticate();

            // Step 2: Create Chat
            await this._createChat(prompt);

            // Step 3: Stream Completion
            const result = await this._streamCompletion(prompt, onThinking);

            return {
                thinking: result.thinking,
                answer: result.answer,
                usage: result.usage,
                success: true
            };

        } catch (error) {
            console.error('ZAI Service Error:', error);
            throw error;
        }
    }

    /**
     * Reset conversation (buat chat baru next time)
     */
    resetConversation() {
        this.chatId = null;
        this.messageId = null;
    }

    /**
     * Check if service is ready
     */
    isReady() {
        return this.isAuthenticated;
    }
}

// Export default untuk compatibility
export default ZAIService;
