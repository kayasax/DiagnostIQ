// DiagnosticIQ - Local LLM Interface for Wiki Extraction
// This module provides a secure, local interface to LLM for content extraction

class LocalLLMInterface {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:11434';
        this.model = options.model || 'llama3.1:8b';
        this.timeout = options.timeout || 30000; // 30 seconds
        this.verbose = options.verbose || false;
    }

    /**
     * Check if Ollama is running and accessible
     * @returns {Promise<boolean>}
     */
    async isAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            if (this.verbose) {
                console.log('🚫 Ollama not available:', error.message);
            }
            return false;
        }
    }

    /**
     * Check if specific model is available
     * @returns {Promise<boolean>}
     */
    async isModelAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            const data = await response.json();
            const models = data.models || [];
            return models.some(model => model.name.includes(this.model.split(':')[0]));
        } catch (error) {
            if (this.verbose) {
                console.log('🚫 Error checking models:', error.message);
            }
            return false;
        }
    }

    /**
     * Generate response from local LLM
     * @param {string} prompt - The prompt to send to the LLM
     * @param {Object} options - Additional options
     * @returns {Promise<string>}
     */
    async generate(prompt, options = {}) {
        const requestBody = {
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.1, // Low temperature for consistent extraction
                top_p: options.top_p || 0.9,
                top_k: options.top_k || 40,
                ...options.modelOptions
            }
        };

        if (this.verbose) {
            console.log(`🤖 Sending request to ${this.model}...`);
            console.log(`📝 Prompt length: ${prompt.length} characters`);
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (this.verbose) {
                console.log(`✅ Response received (${result.response?.length || 0} characters)`);
            }

            return result.response;
        } catch (error) {
            console.error('🚫 LLM generation failed:', error.message);
            throw new Error(`Local LLM request failed: ${error.message}`);
        }
    }

    /**
     * Extract structured data from content using LLM
     * @param {string} content - Wiki content to analyze
     * @param {string} extractionType - Type of extraction (scenarios, queries, etc.)
     * @returns {Promise<Object>}
     */
    async extractStructuredData(content, extractionType = 'scenarios') {
        const prompts = require('./extraction-prompts');
        const prompt = prompts.getPrompt(extractionType, content);

        try {
            const response = await this.generate(prompt);
            
            // Try to parse JSON response
            const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }

            // Try to parse direct JSON
            const cleanResponse = response.trim();
            if (cleanResponse.startsWith('{') || cleanResponse.startsWith('[')) {
                return JSON.parse(cleanResponse);
            }

            throw new Error('No valid JSON found in LLM response');
        } catch (parseError) {
            if (this.verbose) {
                console.log('📝 Raw LLM response:', response.substring(0, 500) + '...');
            }
            throw new Error(`Failed to parse LLM response as JSON: ${parseError.message}`);
        }
    }

    /**
     * Get system information and capabilities
     * @returns {Promise<Object>}
     */
    async getSystemInfo() {
        try {
            const isAvailable = await this.isAvailable();
            const isModelReady = await this.isModelAvailable();
            
            return {
                available: isAvailable,
                modelReady: isModelReady,
                baseUrl: this.baseUrl,
                model: this.model,
                status: isAvailable && isModelReady ? 'ready' : 'not_ready'
            };
        } catch (error) {
            return {
                available: false,
                modelReady: false,
                baseUrl: this.baseUrl,
                model: this.model,
                status: 'error',
                error: error.message
            };
        }
    }
}

module.exports = LocalLLMInterface;
