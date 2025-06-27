/**
 * DiagnosticIQ Wiki Extraction Tool
 *
 * This script extracts troubleshooting scenarios from a locally cloned Azure AD supportability wiki
 * and converts them into DiagnosticIQ's modular JSON format.
 *
 * Usage: node extract-wiki-scenarios.js <wiki-path> [options]
 *
 * @author DiagnosticIQ Team
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class WikiExtractor {
    constructor(wikiPath, options = {}) {
        this.wikiPath = wikiPath;
        this.outputPath = options.outputPath || './data/scenarios';
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;

        // Patterns for detecting KQL queries - enhanced for wiki format and encoding issues
        this.kqlPatterns = [
            // Standard KQL code blocks with language specifier
            /```(?:kusto|kql)[\s\r\n]+([\s\S]*?)[\s\r\n]*```/gi,

            // Plain code blocks containing KQL table references (more flexible whitespace)
            /```[\s\r\n]*([\s\S]*?(?:SigninLogs|AuditLogs|AADNonInteractiveUserSignInLogs|AADServicePrincipalSignInLogs|IdentityInfo|IdentityDirectoryEvents|GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces)[\s\S]*?)[\s\r\n]*```/gi,

            // Plain code blocks with KQL operators (more flexible)
            /```[\s\r\n]*([\s\S]*?(?:\|\s*where|\|\s*project|\|\s*summarize|\|\s*extend|\|\s*join|let\s+\w+\s*=)[\s\S]*?)[\s\r\n]*```/gi,

            // Standalone let statements (more specific)
            /let\s+\w+\s*=\s*[^;]+;/gi,

            // KQL queries not in code blocks - table names at start of line
            /(?:^|\r?\n)[ \t]*([^\r\n]*(?:GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|SigninLogs|AuditLogs)[^\r\n]*(?:(?:\r?\n[ \t]*[^\r\n]*\|\s*where[^\r\n]*)*)?)/gim,

            // Multi-line KQL queries starting with table name (better line ending handling)
            /(?:^|\r?\n)[ \t]*((?:GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|SigninLogs|AuditLogs)[\s\S]*?(?=(?:\r?\n){2,}|\r?\n```|\r?\n#|$))/gim
        ];

        // Category mapping based on content keywords - updated to match app filter values
        this.categoryMappings = {
            authentication: [
                'signin', 'sign-in', 'authentication', 'login', 'mfa', 'conditional access',
                'token', 'oauth', 'saml', 'federation', 'password', 'credentials'
            ],
            provisioning: [
                'provisioning', 'scim', 'user creation', 'account creation', 'lifecycle',
                'joiner', 'leaver', 'mover', 'employee lifecycle'
            ],
            synchronization: [
                'sync', 'synchronization', 'ad connect', 'directory sync', 'hybrid',
                'on-premises', 'cloud sync', 'delta sync', 'cross-tenant'
            ],
            applications: [
                'application', 'app', 'service principal', 'enterprise app', 'gallery app',
                'custom app', 'app registration', 'api permissions'
            ],
            performance: [
                'performance', 'slow', 'latency', 'timeout', 'response time',
                'optimization', 'bottleneck', 'capacity'
            ],
            security: [
                'security', 'breach', 'incident', 'threat', 'risk', 'compliance',
                'audit', 'investigation', 'suspicious activity'
            ]
        };

        this.extractedScenarios = [];
        this.stats = {
            filesProcessed: 0,
            scenariosExtracted: 0,
            queriesExtracted: 0,
            errors: 0
        };
    }

    /**
     * Main extraction method
     */
    async extract() {
        console.log(`🚀 Starting DiagnosticIQ Wiki Extraction...`);
        console.log(`📁 Source: ${this.wikiPath}`);
        console.log(`📁 Output: ${this.outputPath}`);
        console.log(`🔍 Dry run: ${this.dryRun ? 'Yes' : 'No'}`);
        console.log('─'.repeat(50));

        try {
            // Validate source path
            await this.validatePaths();

            // Find and process markdown files
            let markdownFiles;
            if (this.isFile) {
                markdownFiles = [this.wikiPath];
            } else {
                markdownFiles = await this.findMarkdownFiles(this.wikiPath);
            }
            console.log(`📄 Found ${markdownFiles.length} markdown files`);

            // Process each file
            for (const filePath of markdownFiles) {
                await this.processMarkdownFile(filePath);
            }

            // Group scenarios by category
            const categorizedScenarios = this.categorizeScenarios();

            // Save scenarios to JSON files
            if (!this.dryRun) {
                await this.saveScenarios(categorizedScenarios);
                await this.updateIndex(categorizedScenarios);
            }

            // Print summary
            this.printSummary(categorizedScenarios);

        } catch (error) {
            console.error('❌ Extraction failed:', error.message);
            if (this.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }

    /**
     * Validate source and output paths
     */
    async validatePaths() {
        try {
            const stat = await fs.stat(this.wikiPath);
            if (!stat.isDirectory() && !stat.isFile()) {
                throw new Error(`Wiki path is not a directory or file: ${this.wikiPath}`);
            }
            this.isFile = stat.isFile();
        } catch (error) {
            throw new Error(`Cannot access wiki path: ${this.wikiPath}`);
        }
    }

    /**
     * Recursively find all markdown files
     */
    async findMarkdownFiles(dirPath, files = []) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Skip common non-content directories
                if (!entry.name.startsWith('.') &&
                    !['node_modules', 'images', 'assets', 'media'].includes(entry.name.toLowerCase())) {
                    await this.findMarkdownFiles(fullPath, files);
                }
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Process a single markdown file
     */
    async processMarkdownFile(filePath) {
        try {
            this.stats.filesProcessed++;

            if (this.verbose) {
                console.log(`📄 Processing: ${path.relative(this.wikiPath, filePath)}`);
            }

            let content = await this.readFileWithEncoding(filePath);
            const scenarios = await this.extractScenariosFromContent(content, filePath);

            this.extractedScenarios.push(...scenarios);
            this.stats.scenariosExtracted += scenarios.length;

        } catch (error) {
            this.stats.errors++;
            console.warn(`⚠️  Error processing ${filePath}: ${error.message}`);
        }
    }

    /**
     * Extract scenarios from markdown content
     */
    async extractScenariosFromContent(content, filePath) {
        const scenarios = [];

        // Extract metadata from the file
        const fileName = path.basename(filePath, '.md');
        const relativePath = path.relative(this.wikiPath, filePath);

        // Split content into sections (typically by h1, h2, h3 headers)
        const sections = this.splitIntoSections(content);

        for (const section of sections) {
            const scenario = await this.extractScenarioFromSection(section, fileName, relativePath);
            if (scenario) {
                scenarios.push(scenario);
            }
        }

        return scenarios;
    }

    /**
     * Split content into logical sections with enhanced context awareness
     */
    splitIntoSections(content) {
        // Enhanced section splitting that preserves context and relationships
        const sections = [];
        const lines = content.split('\n');
        let currentSection = null;
        let contextBuffer = []; // Buffer to maintain context between sections

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

            if (headerMatch) {
                // Save previous section with enhanced context
                if (currentSection) {
                    currentSection.context = this.buildSectionContext(currentSection, contextBuffer, i, lines);
                    currentSection.relationships = this.identifyRelationships(currentSection, sections);
                    sections.push(currentSection);
                }

                // Start new section with metadata
                currentSection = {
                    level: headerMatch[1].length,
                    title: headerMatch[2].trim(),
                    content: [line],
                    lineStart: i,
                    metadata: this.extractSectionMetadata(line, i, lines)
                };

                // Update context buffer
                contextBuffer = lines.slice(Math.max(0, i - 5), i);
            } else if (currentSection) {
                currentSection.content.push(line);
            } else {
                // Content before first header - add to context buffer
                contextBuffer.push(line);
            }
        }

        // Add last section with context
        if (currentSection) {
            currentSection.context = this.buildSectionContext(currentSection, contextBuffer, lines.length, lines);
            currentSection.relationships = this.identifyRelationships(currentSection, sections);
            sections.push(currentSection);
        }

        // Post-process sections to enhance understanding
        return this.enrichSections(sections);
    }

    /**
     * Build comprehensive context for a section
     */
    buildSectionContext(section, contextBuffer, currentLine, allLines) {
        const context = {
            precedingContent: contextBuffer.join('\n'),
            followingContent: allLines.slice(currentLine, Math.min(allLines.length, currentLine + 10)).join('\n'),
            sectionDepth: section.level,
            position: {
                start: section.lineStart,
                end: currentLine
            },
            contentStructure: this.analyzeSectionStructure(section.content),
            semanticMarkers: this.extractSemanticMarkers(section.content)
        };

        return context;
    }

    /**
     * Analyze the structure of section content
     */
    analyzeSectionStructure(content) {
        const structure = {
            hasCodeBlocks: false,
            hasLists: false,
            hasSubheadings: false,
            hasLinks: false,
            hasTables: false,
            paragraphCount: 0,
            primaryContentType: 'mixed'
        };

        const contentText = content.join('\n');

        structure.hasCodeBlocks = /```/.test(contentText);
        structure.hasLists = /^\s*[-*+]\s+/m.test(contentText) || /^\s*\d+\.\s+/m.test(contentText);
        structure.hasSubheadings = /^#{4,6}\s+/m.test(contentText);
        structure.hasLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(contentText);
        structure.hasTables = /\|/.test(contentText) && /^[-:|]+$/m.test(contentText);

        // Count paragraphs (non-empty lines that aren't headers, code, or lists)
        structure.paragraphCount = content.filter(line =>
            line.trim() &&
            !line.startsWith('#') &&
            !line.startsWith('```') &&
            !line.match(/^\s*[-*+\d]\s+/)
        ).length;

        // Determine primary content type
        if (structure.hasCodeBlocks && contentText.match(/```.*kql|kusto/i)) {
            structure.primaryContentType = 'query-focused';
        } else if (structure.hasLists && structure.paragraphCount < 3) {
            structure.primaryContentType = 'step-by-step';
        } else if (structure.paragraphCount > 5) {
            structure.primaryContentType = 'explanatory';
        } else if (structure.hasTables) {
            structure.primaryContentType = 'reference';
        }

        return structure;
    }

    /**
     * Extract semantic markers from content
     */
    extractSemanticMarkers(content) {
        const contentText = content.join('\n').toLowerCase();
        const markers = {
            urgency: [],
            actions: [],
            conditions: [],
            outcomes: [],
            tools: [],
            roles: []
        };

        // Urgency markers
        const urgencyPatterns = [
            /\b(critical|urgent|immediate|asap|priority)\b/g,
            /\b(outage|down|failed|broken)\b/g
        ];
        urgencyPatterns.forEach(pattern => {
            const matches = contentText.match(pattern);
            if (matches) markers.urgency.push(...matches);
        });

        // Action markers
        const actionPatterns = [
            /\b(run|execute|check|verify|validate|review|analyze|investigate)\b/g,
            /\b(configure|setup|install|update|modify|change)\b/g
        ];
        actionPatterns.forEach(pattern => {
            const matches = contentText.match(pattern);
            if (matches) markers.actions.push(...matches);
        });

        // Condition markers
        const conditionPatterns = [
            /\b(if|when|where|unless|provided that|in case)\b/g,
            /\b(error|success|failure|timeout|exception)\b/g
        ];
        conditionPatterns.forEach(pattern => {
            const matches = contentText.match(pattern);
            if (matches) markers.conditions.push(...matches);
        });

        // Outcome markers
        const outcomePatterns = [
            /\b(result|outcome|effect|impact|consequence)\b/g,
            /\b(resolved|fixed|completed|successful|failed)\b/g
        ];
        outcomePatterns.forEach(pattern => {
            const matches = contentText.match(pattern);
            if (matches) markers.outcomes.push(...matches);
        });

        // Tool/technology markers
        const toolPatterns = [
            /\b(azure ad|aad|powershell|kql|kusto|graph|api)\b/g,
            /\b(portal|admin center|connect|sync|mfa)\b/g
        ];
        toolPatterns.forEach(pattern => {
            const matches = contentText.match(pattern);
            if (matches) markers.tools.push(...matches);
        });

        // Role markers
        const rolePatterns = [
            /\b(admin|administrator|user|developer|analyst)\b/g,
            /\b(global admin|security admin|helpdesk|support)\b/g
        ];
        rolePatterns.forEach(pattern => {
            const matches = contentText.match(pattern);
            if (matches) markers.roles.push(...matches);
        });

        // Deduplicate arrays
        Object.keys(markers).forEach(key => {
            markers[key] = [...new Set(markers[key])];
        });

        return markers;
    }

    /**
     * Identify relationships between sections
     */
    identifyRelationships(currentSection, existingSections) {
        const relationships = {
            parentSections: [],
            siblingScore: 0,
            dependsOn: [],
            references: []
        };

        // Find parent sections (higher level headers that come before this one)
        for (let i = existingSections.length - 1; i >= 0; i--) {
            const section = existingSections[i];
            if (section.level < currentSection.level) {
                relationships.parentSections.unshift(section.title);
                break; // Only get immediate parent
            }
        }

        // Calculate sibling score (sections at same level)
        const sameLevelSections = existingSections.filter(s => s.level === currentSection.level);
        relationships.siblingScore = sameLevelSections.length;

        // Look for references to other sections
        const currentContent = currentSection.content.join('\n').toLowerCase();
        existingSections.forEach(section => {
            const sectionTitle = section.title.toLowerCase();
            if (currentContent.includes(sectionTitle)) {
                relationships.references.push(section.title);
            }
        });

        return relationships;
    }

    /**
     * Extract metadata from section headers and surrounding content
     */
    extractSectionMetadata(headerLine, lineIndex, allLines) {
        const metadata = {
            headerStyle: headerLine.match(/^#+/)[0],
            estimatedImportance: 0,
            contentHints: [],
            followUpSections: []
        };

        // Analyze surrounding lines for content hints
        const contextLines = allLines.slice(lineIndex + 1, Math.min(allLines.length, lineIndex + 5));

        contextLines.forEach(line => {
            if (line.includes('```')) metadata.contentHints.push('code');
            if (/^\s*\d+\./.test(line)) metadata.contentHints.push('numbered-steps');
            if (/^\s*[-*]/.test(line)) metadata.contentHints.push('bulleted-list');
            if (line.includes('|') && line.includes('-')) metadata.contentHints.push('table');
        });

        // Estimate importance based on header level and content indicators
        metadata.estimatedImportance = 4 - headerLine.match(/^#+/)[0].length; // H1=3, H2=2, H3=1

        const headerText = headerLine.toLowerCase();
        if (headerText.includes('important') || headerText.includes('critical')) metadata.estimatedImportance += 2;
        if (headerText.includes('note') || headerText.includes('warning')) metadata.estimatedImportance += 1;

        return metadata;
    }

    /**
     * Enrich sections with additional analysis
     */
    enrichSections(sections) {
        return sections.map(section => {
            section.enrichment = {
                readabilityScore: this.calculateReadabilityScore(section.content),
                technicalComplexity: this.assessTechnicalComplexity(section.content),
                actionableContent: this.identifyActionableContent(section.content),
                informationDensity: this.calculateInformationDensity(section.content),
                prerequisites: this.inferSectionPrerequisites(section.content),
                expectedOutcome: this.inferExpectedOutcome(section.content)
            };
            return section;
        });
    }

    /**
     * Calculate readability score for section content
     */
    calculateReadabilityScore(content) {
        const text = content.join(' ');
        const sentences = text.split(/[.!?]+/).length;
        const words = text.split(/\s+/).length;
        const avgWordsPerSentence = words / Math.max(sentences, 1);

        // Simple readability scoring (lower is more readable)
        if (avgWordsPerSentence < 15) return 'high';
        if (avgWordsPerSentence < 25) return 'medium';
        return 'low';
    }

    /**
     * Assess technical complexity of section
     */
    assessTechnicalComplexity(content) {
        const text = content.join(' ').toLowerCase();
        let score = 0;

        // Technical terms increase complexity
        const technicalTerms = ['api', 'powershell', 'kql', 'regex', 'json', 'xml', 'guid', 'token', 'certificate'];
        technicalTerms.forEach(term => {
            if (text.includes(term)) score++;
        });

        // Code blocks increase complexity
        if (text.includes('```')) score += 2;

        // Multiple steps increase complexity
        const stepCount = (text.match(/\d+\./g) || []).length;
        if (stepCount > 5) score += 1;

        if (score <= 2) return 'low';
        if (score <= 5) return 'medium';
        return 'high';
    }

    /**
     * Identify actionable content in section
     */
    identifyActionableContent(content) {
        const text = content.join(' ').toLowerCase();
        const actionableIndicators = [
            'run the following',
            'execute this query',
            'check the',
            'verify that',
            'navigate to',
            'click on',
            'select the',
            'configure',
            'modify',
            'update'
        ];

        return actionableIndicators.filter(indicator => text.includes(indicator));
    }

    /**
     * Calculate information density
     */
    calculateInformationDensity(content) {
        const text = content.join(' ');
        const totalChars = text.length;
        const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
        const links = (text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
        const lists = (text.match(/^\s*[-*+]\s+/gm) || []).length;

        const densityScore = (codeBlocks * 50 + links * 10 + lists * 5) / Math.max(totalChars, 1);

        if (densityScore > 0.1) return 'high';
        if (densityScore > 0.05) return 'medium';
        return 'low';
    }

    /**
     * Infer prerequisites for section
     */
    inferSectionPrerequisites(content) {
        const text = content.join(' ').toLowerCase();
        const prerequisites = [];

        if (text.includes('powershell') || text.includes('ps1')) {
            prerequisites.push('PowerShell execution capability');
        }
        if (text.includes('admin') || text.includes('administrator')) {
            prerequisites.push('Administrative privileges');
        }
        if (text.includes('kql') || text.includes('kusto')) {
            prerequisites.push('KQL query execution access');
        }
        if (text.includes('portal') || text.includes('admin center')) {
            prerequisites.push('Azure portal access');
        }

        return prerequisites;
    }

    /**
     * Infer expected outcome from section
     */
    inferExpectedOutcome(content) {
        const text = content.join(' ').toLowerCase();

        if (text.includes('error') && text.includes('resolve')) {
            return 'Error resolution and normal operation restoration';
        }
        if (text.includes('performance') && text.includes('improve')) {
            return 'Performance improvement and optimization';
        }
        if (text.includes('configure') || text.includes('setup')) {
            return 'Successful configuration and setup completion';
        }
        if (text.includes('investigate') || text.includes('analyze')) {
            return 'Clear understanding of issue root cause';
        }

        return 'Successful completion of documented steps';
    }

    /**
     * Extract scenario from a content section with enhanced context awareness
     */
    async extractScenarioFromSection(section, fileName, relativePath) {
        const fullContent = section.content.join('\n');

        // Look for KQL queries
        const queries = this.extractKQLQueries(fullContent);

        // Enhanced: Consider sections with valuable troubleshooting content even without queries
        const hasValuableContent = this.hasValuableTroubleshootingContent(section, fullContent);

        // If no queries and no valuable content, skip this section
        if (queries.length === 0 && !hasValuableContent) {
            return null;
        }

        // Extract enhanced information using section context
        const description = this.extractEnhancedDescription(fullContent, section);
        const steps = this.extractEnhancedSteps(fullContent, section);
        const tags = this.extractEnhancedTags(fullContent, section.title, section);

        // Determine category with context awareness
        const category = this.determineEnhancedCategory(section.title, description, fullContent, section);

        // Generate comprehensive AI-powered summary and analysis
        const aiSummary = this.generateAISummary(section.title, description, fullContent, queries, steps, section);
        const wikiReference = this.generateWikiReference(relativePath, section.title, section);

        // Enhanced scenario context
        const scenarioContext = this.buildScenarioContext(section, fullContent, queries, steps);

        // Determine cluster and database
        const cluster = this.extractEnhancedCluster(fullContent, section) || 'general';
        const database = cluster === 'idsharedwus.kusto.windows.net' ? 'AADSFprod' : null;

        // Create enhanced scenario object
        const scenario = {
            id: this.generateId(section.title, fileName),
            title: this.cleanTitle(section.title),
            description: description || `Troubleshooting scenario extracted from ${fileName}`,
            aiSummary: aiSummary,
            category: category,
            cluster: cluster,
            ...(database && { database: database }),
            tags: tags,
            difficulty: this.determineDifficulty(queries, fullContent, section),
            estimatedTime: this.estimateTime(queries, steps, section),
            priority: this.assessPriority(section, fullContent),
            lastUpdated: new Date().toISOString(),
            source: {
                type: 'wiki',
                path: relativePath,
                section: section.title,
                extractedAt: new Date().toISOString(),
                wikiReference: wikiReference,
                sectionMetadata: section.metadata,
                contextualInformation: scenarioContext
            },
            queries: queries.map((query, index) => ({
                id: `${this.generateId(section.title, fileName)}_q${index + 1}`,
                title: this.extractQueryTitle(query, index, section),
                description: this.extractQueryDescription(query, section),
                kql: this.cleanKQLQuery(query.kql),
                category: query.category || 'analysis',
                complexity: this.determineQueryComplexity(query.kql),
                expectedResults: this.inferExpectedResults(query, section),
                usageHints: this.generateUsageHints(query, section)
            })),
            steps: steps.map((step, index) => ({
                id: `${this.generateId(section.title, fileName)}_s${index + 1}`,
                description: step,
                order: index + 1,
                estimatedDuration: this.estimateStepDuration(step, section),
                prerequisites: this.inferStepPrerequisites(step, section),
                expectedOutcome: this.inferStepOutcome(step, section)
            })),
            relatedTopics: this.extractRelatedTopics(fullContent, section),
            troubleshootingTips: this.extractTroubleshootingTips(fullContent, section),
            prerequisites: this.extractPrerequisites(fullContent, section),
            successCriteria: this.defineSuccessCriteria(fullContent, scenarioContext, section),
            commonPitfalls: this.identifyCommonPitfalls(fullContent, section),
            qualityMetrics: this.calculateQualityMetrics(section, queries, steps, fullContent),
            extractionConfidence: this.calculateExtractionConfidence(section, queries, fullContent)
        };

        this.stats.queriesExtracted += queries.length;

        return scenario;
    }

    /**
     * Check if section has valuable troubleshooting content even without queries
     */
    hasValuableTroubleshootingContent(section, content) {
        // Check section metadata for importance indicators
        if (section.metadata && section.metadata.estimatedImportance > 2) {
            return true;
        }

        // Check for troubleshooting indicators
        const lower = content.toLowerCase();
        const troubleshootingIndicators = [
            'troubleshoot', 'resolve', 'fix', 'issue', 'problem', 'error',
            'investigation', 'diagnosis', 'solution', 'workaround',
            'steps to', 'how to', 'procedure', 'process'
        ];

        const hasIndicators = troubleshootingIndicators.some(indicator => lower.includes(indicator));

        // Check for actionable content
        const hasActionableContent = section.enrichment &&
            section.enrichment.actionableContent &&
            section.enrichment.actionableContent.length > 0;

        // Check content structure
        const hasStructuredContent = section.context &&
            section.context.contentStructure &&
            (section.context.contentStructure.hasLists ||
             section.context.contentStructure.primaryContentType === 'step-by-step');

        return hasIndicators && (hasActionableContent || hasStructuredContent);
    }

    /**
     * Extract enhanced description using section context
     */
    extractEnhancedDescription(content, section) {
        // Try standard description extraction first
        let description = this.extractDescription(content);

        // If no description found, use section context
        if (!description && section.context) {
            // Try to build description from context
            const precedingContent = section.context.precedingContent;
            if (precedingContent) {
                const contextDesc = this.extractDescription(precedingContent);
                if (contextDesc) {
                    description = `${contextDesc} - Focus: ${section.title}`;
                }
            }
        }

        // Enhance with semantic markers
        if (description && section.context && section.context.semanticMarkers) {
            const markers = section.context.semanticMarkers;
            if (markers.urgency.length > 0) {
                description += ` (Priority: ${markers.urgency[0]})`;
            }
        }

        // Fallback: create description from section structure
        if (!description && section.enrichment) {
            const complexity = section.enrichment.technicalComplexity;
            const contentType = section.context?.contentStructure?.primaryContentType || 'mixed';
            description = `${section.title} - ${complexity} complexity ${contentType} troubleshooting guide`;
        }

        return description;
    }

    /**
     * Extract enhanced steps with better context
     */
    extractEnhancedSteps(content, section) {
        let steps = this.extractSteps(content);

        // If no steps found but section suggests step-by-step content
        if (steps.length === 0 && section.context?.contentStructure?.primaryContentType === 'step-by-step') {
            // Try to extract from structured content
            const lines = content.split('\n');
            const potentialSteps = lines.filter(line => {
                const trimmed = line.trim();
                return trimmed.length > 10 &&
                       (trimmed.startsWith('-') ||
                        trimmed.startsWith('*') ||
                        /^\d+\./.test(trimmed) ||
                        trimmed.toLowerCase().includes('step'));
            });

            steps = potentialSteps.map(step =>
                step.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim()
            ).slice(0, 10);
        }

        return steps;
    }

    /**
     * Extract enhanced tags using section context
     */
    extractEnhancedTags(content, title, section) {
        let tags = this.extractTags(content, title);

        // Add tags from semantic markers
        if (section.context && section.context.semanticMarkers) {
            const markers = section.context.semanticMarkers;
            tags.push(...markers.tools.slice(0, 3));
            tags.push(...markers.actions.slice(0, 2));
        }

        // Add tags from content structure
        if (section.context && section.context.contentStructure) {
            const structure = section.context.contentStructure;
            if (structure.primaryContentType) {
                tags.push(structure.primaryContentType);
            }
        }

        // Add complexity tags
        if (section.enrichment) {
            tags.push(`complexity-${section.enrichment.technicalComplexity}`);
            tags.push(`readability-${section.enrichment.readabilityScore}`);
        }

        // Deduplicate and limit
        return [...new Set(tags.filter(tag => tag && tag.length > 2))].slice(0, 10);
    }

    /**
     * Enhanced category determination with context
     */
    determineEnhancedCategory(title, description, content, section) {
        // Start with standard category determination
        let category = this.determineCategory(title, description, content);

        // Enhance with semantic markers
        if (section.context && section.context.semanticMarkers) {
            const tools = section.context.semanticMarkers.tools;

            // Tool-specific category refinement
            if (tools.includes('sync') || tools.includes('connect')) {
                category = 'synchronization';
            } else if (tools.includes('mfa') || tools.includes('authentication')) {
                category = 'authentication';
            } else if (tools.includes('app') || tools.includes('application')) {
                category = 'applications';
            }
        }

        // Use parent section context for refinement
        if (section.relationships && section.relationships.parentSections.length > 0) {
            const parentTitle = section.relationships.parentSections[0].toLowerCase();
            const parentCategory = this.determineCategory(parentTitle, '', '');
            if (parentCategory !== 'general') {
                category = parentCategory;
            }
        }

        return category;
    }

    /**
     * Enhanced cluster extraction with cross-tenant sync detection
     */
    extractEnhancedCluster(content, section) {
        // Check for cross-tenant sync specific content
        const crossTenantIndicators = [
            /cross[- ]?tenant/i,
            /idsharedwus\.kusto\.windows\.net/i,
            /AADSFprod/i,
            /Azure2Azure/i,
            /cross[- ]?tenant[- ]?sync/i
        ];

        const isCrossTenantSync = crossTenantIndicators.some(pattern =>
            pattern.test(content) || (section.title && pattern.test(section.title))
        );

        if (isCrossTenantSync) {
            return 'idsharedwus.kusto.windows.net';
        }

        let cluster = this.extractCluster(content);

        if (!cluster && section.context && section.context.semanticMarkers) {
            const tools = section.context.semanticMarkers.tools;
            if (tools.includes('powershell')) cluster = 'powershell';
            if (tools.includes('portal')) cluster = 'portal';
            if (tools.includes('api')) cluster = 'api';
        }

        return cluster;
    }

    /**
     * Build comprehensive scenario context
     */
    buildScenarioContext(section, content, queries, steps) {
        return {
            structuralContext: {
                sectionLevel: section.level,
                hasParentSections: section.relationships?.parentSections?.length > 0,
                siblingCount: section.relationships?.siblingScore || 0,
                contentStructure: section.context?.contentStructure,
                informationDensity: section.enrichment?.informationDensity
            },
            semanticContext: {
                primaryFocus: this.identifyPrimaryFocus(content, section),
                semanticMarkers: section.context?.semanticMarkers,
                technicalComplexity: section.enrichment?.technicalComplexity,
                actionableContent: section.enrichment?.actionableContent
            },
            proceduraContext: {
                stepCount: steps.length,
                queryCount: queries.length,
                hasDecisionPoints: this.hasDecisionPoints(content),
                hasConditionalLogic: this.hasConditionalLogic(content),
                estimatedDuration: this.estimateCompleteDuration(queries, steps, section)
            },
            qualityIndicators: {
                readabilityScore: section.enrichment?.readabilityScore,
                completeness: this.assessCompleteness(section, queries, steps),
                clarity: this.assessClarity(content, section),
                practicalValue: this.assessPracticalValue(section, queries, steps)
            }
        };
    }

    /**
     * Additional helper methods for enhanced extraction
     */
    identifyPrimaryFocus(content, section) {
        const lower = content.toLowerCase();

        if (lower.includes('investigate') || lower.includes('analyze')) return 'investigation';
        if (lower.includes('configure') || lower.includes('setup')) return 'configuration';
        if (lower.includes('monitor') || lower.includes('tracking')) return 'monitoring';
        if (lower.includes('resolve') || lower.includes('fix')) return 'resolution';

        // Use section structure to infer focus
        if (section.context?.contentStructure?.primaryContentType === 'query-focused') {
            return 'data-analysis';
        }

        return 'general-troubleshooting';
    }

    hasDecisionPoints(content) {
        const decisionIndicators = ['if', 'when', 'choose', 'select', 'option', 'alternative'];
        const lower = content.toLowerCase();
        return decisionIndicators.some(indicator => lower.includes(indicator));
    }

    hasConditionalLogic(content) {
        const conditionalPatterns = [
            /if\s+.*then/gi,
            /when\s+.*do/gi,
            /in case of/gi,
            /depending on/gi
        ];
        return conditionalPatterns.some(pattern => pattern.test(content));
    }

    estimateCompleteDuration(queries, steps, section) {
        let baseDuration = this.estimateTime(queries, steps);

        // Adjust based on complexity
        if (section.enrichment?.technicalComplexity === 'high') {
            baseDuration *= 1.5;
        }

        // Adjust based on content structure
        if (section.context?.contentStructure?.primaryContentType === 'query-focused') {
            baseDuration += queries.length * 3; // Additional time for query analysis
        }

        return Math.round(baseDuration);
    }

    assessCompleteness(section, queries, steps) {
        let score = 0;

        if (section.enrichment?.actionableContent?.length > 0) score += 25;
        if (queries.length > 0) score += 25;
        if (steps.length > 0) score += 25;
        if (section.context?.contentStructure?.hasLists) score += 15;
        if (section.enrichment?.expectedOutcome) score += 10;

        return Math.min(score, 100);
    }

    assessClarity(content, section) {
        let score = 100;

        // Penalize for low readability
        if (section.enrichment?.readabilityScore === 'low') score -= 30;

        // Penalize for high complexity without structure
        if (section.enrichment?.technicalComplexity === 'high' &&
            !section.context?.contentStructure?.hasLists) {
            score -= 20;
        }

        // Reward clear structure
        if (section.context?.contentStructure?.primaryContentType === 'step-by-step') {
            score += 10;
        }

        return Math.max(score, 0);
    }

    assessPracticalValue(section, queries, steps) {
        let score = 0;

        // Queries add practical value
        if (queries.length > 0) score += 40;

        // Actionable steps add value
        if (steps.length > 0) score += 30;

        // Clear outcomes add value
        if (section.enrichment?.expectedOutcome) score += 20;

        // Prerequisites help users prepare
        if (section.enrichment?.prerequisites?.length > 0) score += 10;

        return Math.min(score, 100);
    }

    assessPriority(section, content) {
        let priority = 'medium';

        // Check urgency markers
        if (section.context?.semanticMarkers?.urgency?.length > 0) {
            priority = 'high';
        }

        // Check section importance
        if (section.metadata?.estimatedImportance > 2) {
            priority = 'high';
        }

        // Check content indicators
        const lower = content.toLowerCase();
        if (lower.includes('critical') || lower.includes('urgent') || lower.includes('outage')) {
            priority = 'high';
        } else if (lower.includes('minor') || lower.includes('cosmetic') || lower.includes('optional')) {
            priority = 'low';
        }

        return priority;
    }

    calculateQualityMetrics(section, queries, steps, content) {
        return {
            completeness: this.assessCompleteness(section, queries, steps),
            clarity: this.assessClarity(content, section),
            practicalValue: this.assessPracticalValue(section, queries, steps),
            technicalAccuracy: this.assessTechnicalAccuracy(queries, content),
            usability: this.assessUsability(section, steps, queries),
            overallScore: 0 // Will be calculated as average
        };
    }

    assessTechnicalAccuracy(queries, content) {
        let score = 80; // Start with good baseline

        // Validate KQL queries
        queries.forEach(query => {
            if (!this.isValidKQL(query.kql)) {
                score -= 20;
            }
        });

        // Check for technical inconsistencies
        const lower = content.toLowerCase();
        if (lower.includes('azure ad') && lower.includes('active directory') &&
            !lower.includes('azure active directory')) {
            score -= 5; // Minor terminology inconsistency
        }

        return Math.max(score, 0);
    }

    assessUsability(section, steps, queries) {
        let score = 0;

        // Clear steps improve usability
        if (steps.length > 0) score += 30;

        // Executable queries improve usability
        if (queries.length > 0) score += 25;

        // Good readability improves usability
        if (section.enrichment?.readabilityScore === 'high') score += 25;

        // Actionable content improves usability
        if (section.enrichment?.actionableContent?.length > 0) score += 20;

        return Math.min(score, 100);
    }

    calculateExtractionConfidence(section, queries, content) {
        let confidence = 0.5; // Base confidence

        // Boost for structured content
        if (section.context?.contentStructure?.hasLists) confidence += 0.1;
        if (section.context?.contentStructure?.hasCodeBlocks) confidence += 0.1;

        // Boost for valid queries
        if (queries.length > 0 && queries.every(q => this.isValidKQL(q.kql))) {
            confidence += 0.2;
        }

        // Boost for clear actionable content
        if (section.enrichment?.actionableContent?.length > 2) confidence += 0.1;

        // Boost for high completeness
        const completeness = this.assessCompleteness(section, queries, []);
        confidence += (completeness / 100) * 0.1;

        return Math.min(confidence, 0.95);
    }

    // Enhanced helper methods for steps and queries
    estimateStepDuration(step, section) {
        const lower = step.toLowerCase();

        if (lower.includes('run') || lower.includes('execute')) return 2;
        if (lower.includes('navigate') || lower.includes('open')) return 1;
        if (lower.includes('analyze') || lower.includes('review')) return 5;
        if (lower.includes('configure') || lower.includes('setup')) return 10;

        // Default based on section complexity
        if (section.enrichment?.technicalComplexity === 'high') return 5;
        return 3;
    }

    inferStepPrerequisites(step, section) {
        const prerequisites = [];
        const lower = step.toLowerCase();

        if (lower.includes('powershell')) prerequisites.push('PowerShell access');
        if (lower.includes('admin') || lower.includes('administrator')) prerequisites.push('Admin privileges');
        if (lower.includes('portal')) prerequisites.push('Azure portal access');
        if (lower.includes('kql') || lower.includes('query')) prerequisites.push('KQL execution access');

        return prerequisites;
    }

    inferStepOutcome(step, section) {
        const lower = step.toLowerCase();

        if (lower.includes('verify') || lower.includes('check')) return 'Confirmation of current state';
        if (lower.includes('run') || lower.includes('execute')) return 'Query results or command output';
        if (lower.includes('configure') || lower.includes('set')) return 'Configuration successfully applied';
        if (lower.includes('analyze') || lower.includes('review')) return 'Understanding of data patterns';

        return 'Step completed successfully';
    }

    inferExpectedResults(query, section) {
        const kql = query.kql.toLowerCase();

        if (kql.includes('count') || kql.includes('summarize')) {
            return 'Numerical summary of events or patterns';
        }
        if (kql.includes('where') && kql.includes('error')) {
            return 'List of error events with relevant details';
        }
        if (kql.includes('join')) {
            return 'Correlated data from multiple sources';
        }
        if (kql.includes('extend') || kql.includes('project')) {
            return 'Formatted data with specific columns';
        }

        return 'Relevant log entries and data points';
    }

    generateUsageHints(query, section) {
        const hints = [];
        const kql = query.kql.toLowerCase();

        if (kql.includes('ago(')) {
            hints.push('Adjust the time range (ago()) based on when the issue occurred');
        }
        if (kql.includes('where')) {
            hints.push('Modify filter conditions to match your specific scenario');
        }
        if (kql.includes('take') || kql.includes('limit')) {
            hints.push('Increase the limit if you need to see more results');
        }
        if (kql.includes('summarize')) {
            hints.push('Results show aggregated data - drill down for specific events if needed');
        }

        // Section-based hints
        if (section.enrichment?.technicalComplexity === 'high') {
            hints.push('This is a complex query - test in a non-production environment first');
        }

        return hints;
    }

    /**
     * Extract KQL queries from content
     */
    extractKQLQueries(content) {
        const queries = [];

        for (const pattern of this.kqlPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const kql = match[2] || match[1];

                if (this.isValidKQL(kql)) {
                    queries.push({
                        kql: kql.trim(),
                        context: this.extractQueryContext(content, match.index),
                        category: this.classifyQuery(kql)
                    });
                }
            }
        }

        return queries;
    }

    /**
     * Check if a string contains valid KQL
     */
    isValidKQL(kql) {
        if (!kql || kql.trim().length < 5) return false;

        // Clean the query for analysis
        const cleanKql = kql.trim();

        // Common KQL indicators - enhanced for wiki content
        const kqlIndicators = [
            // KQL operators
            /\|\s*(where|project|extend|summarize|join|union|sort|take|limit|distinct|count|parse)/i,

            // Azure AD table references
            /(SigninLogs|AuditLogs|AADNonInteractiveUserSignInLogs|AADServicePrincipalSignInLogs|IdentityInfo|IdentityDirectoryEvents)/i,

            // Support tables
            /(GlobalIfxRunProfileStatisticsEvent|GlobalIfxAuditEvent|GlobalIfxAllTraces|GlobalIfxInformationalEvent)/i,

            // KQL functions and constructs
            /let\s+\w+\s*=/i,
            /\w+\s*\|\s*where/i,
            /parse\s+\w+\s+with/i,
            /ago\(\d+[dhm]\)/i,
            /env_time\s*>/i,
            /contextId\s*==/i,
            /correlationId\s*==/i,
            /runProfileIdentifier/i,
            /servicePrincipalDisplayName/i
        ];

        // Check for KQL patterns
        const hasKqlPattern = kqlIndicators.some(pattern => pattern.test(cleanKql));

        // Additional validation for multiline queries
        if (hasKqlPattern) {
            return true;
        }

        // Check if it starts with a known table name (more lenient)
        const tableNames = [
            'GlobalIfxRunProfileStatisticsEvent',
            'GlobalIfxAuditEvent',
            'GlobalIfxAllTraces',
            'GlobalIfxInformationalEvent',
            'SigninLogs',
            'AuditLogs',
            'AADNonInteractiveUserSignInLogs',
            'AADServicePrincipalSignInLogs',
            'IdentityInfo',
            'IdentityDirectoryEvents'
        ];

        return tableNames.some(table => cleanKql.includes(table));
    }

    /**
     * Classify query type
     */
    classifyQuery(kql) {
        const lower = kql.toLowerCase();

        if (lower.includes('summarize') || lower.includes('count')) return 'analysis';
        if (lower.includes('where') && lower.includes('error')) return 'investigation';
        if (lower.includes('join')) return 'correlation';
        if (lower.includes('extend') || lower.includes('project')) return 'data-shaping';

        return 'query';
    }

    /**
     * Extract description from content
     */
    extractDescription(content) {
        // Look for description patterns
        const descPatterns = [
            /(?:description|summary|overview):\s*(.+)/i,
            /^([^#\n]*(?:troubleshoot|issue|problem|scenario)[^#\n]*)/im,
            /^([^#\n]*(?:this|the following|to help)[^#\n]*)/im
        ];

        for (const pattern of descPatterns) {
            const match = content.match(pattern);
            if (match && match[1] && match[1].trim().length > 20) {
                return match[1].trim();
            }
        }

        // Fallback: use first paragraph
        const firstParagraph = content.split('\n\n')[0];
        if (firstParagraph && firstParagraph.length > 20 && !firstParagraph.startsWith('#')) {
            return firstParagraph.trim();
        }

        return null;
    }

    /**
     * Extract troubleshooting steps
     */
    extractSteps(content) {
        const steps = [];

        // Look for numbered lists or step patterns
        const stepPatterns = [
            /^\d+\.\s+(.+)$/gm,
            /^[-*]\s+(.+)$/gm,
            /^Step \d+:\s*(.+)$/gm
        ];

        for (const pattern of stepPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && match[1].trim().length > 5) {
                    steps.push(match[1].trim());
                }
            }
        }

        return steps.slice(0, 10); // Limit to 10 steps
    }

    /**
     * Extract tags from content
     */
    extractTags(content, title) {
        const tags = new Set();

        // Add title-based tags
        const titleWords = title.toLowerCase().split(/\s+/);
        titleWords.forEach(word => {
            if (word.length > 3 && !['the', 'and', 'for', 'with', 'from'].includes(word)) {
                tags.add(word);
            }
        });

        // Content-based tags
        const tagPatterns = [
            /tags?:\s*([^#\n]+)/i,
            /keywords?:\s*([^#\n]+)/i
        ];

        for (const pattern of tagPatterns) {
            const match = content.match(pattern);
            if (match) {
                const extractedTags = match[1].split(/[,;]/).map(t => t.trim().toLowerCase());
                extractedTags.forEach(tag => {
                    if (tag.length > 2) tags.add(tag);
                });
            }
        }

        return Array.from(tags).slice(0, 8);
    }

    /**
     * Determine category based on content
     */
    determineCategory(title, description, content) {
        const combinedText = `${title} ${description} ${content}`.toLowerCase();

        let bestCategory = 'general';
        let maxScore = 0;

        for (const [category, keywords] of Object.entries(this.categoryMappings)) {
            let score = 0;
            for (const keyword of keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = combinedText.match(regex);
                if (matches) {
                    score += matches.length;

                    // Give extra weight to keywords in title
                    if (title.toLowerCase().includes(keyword)) {
                        score += 3;
                    }

                    // Give extra weight to keywords in description
                    if (description && description.toLowerCase().includes(keyword)) {
                        score += 2;
                    }
                }
            }

            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        }

        // If score is very low, try to infer from common patterns
        if (maxScore <= 1) {
            const text = combinedText;

            // Platform/application related
            if (text.includes('m365') || text.includes('office 365') || text.includes('power platform') ||
                text.includes('teams') || text.includes('sharepoint') || text.includes('exchange')) {
                return 'applications';
            }

            // Cross-tenant scenarios
            if (text.includes('cross-tenant') || text.includes('cross tenant') || text.includes('b2b')) {
                return 'synchronization';
            }

            // User management
            if (text.includes('user') && (text.includes('create') || text.includes('provision') || text.includes('lifecycle'))) {
                return 'provisioning';
            }

            // Sign-in related
            if (text.includes('sign') || text.includes('login') || text.includes('access')) {
                return 'authentication';
            }
        }

        return bestCategory;
    }

    /**
     * Generate unique ID
     */
    generateId(title, fileName) {
        const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const hash = crypto.createHash('md5').update(`${fileName}_${title}`).digest('hex').substring(0, 8);
        return `${cleanTitle}-${hash}`;
    }

    /**
     * Clean and format title
     */
    cleanTitle(title) {
        return title.replace(/^#+\s*/, '').trim();
    }

    /**
     * Additional helper methods for extraction
     */
    extractCluster(content) {
        const clusterPatterns = [
            /cluster:\s*([^#\n]+)/i,
            /environment:\s*([^#\n]+)/i
        ];

        for (const pattern of clusterPatterns) {
            const match = content.match(pattern);
            if (match) return match[1].trim().toLowerCase();
        }

        return null;
    }

    determineDifficulty(queries, content, section = null) {
        let complexity = 0;

        // Based on query complexity
        queries.forEach(query => {
            if (query.kql.includes('join')) complexity += 2;
            if (query.kql.includes('summarize')) complexity += 1;
            if (query.kql.includes('extend')) complexity += 1;
            if (query.kql.split('|').length > 5) complexity += 2;
        });

        // Based on content complexity
        if (content.includes('advanced') || content.includes('complex')) complexity += 2;
        if (content.includes('beginner') || content.includes('basic')) complexity -= 1;

        // Section-based complexity assessment
        if (section && section.enrichment?.technicalComplexity === 'high') complexity += 2;
        if (section && section.enrichment?.technicalComplexity === 'low') complexity -= 1;

        if (complexity <= 2) return 'beginner';
        if (complexity <= 5) return 'intermediate';
        return 'advanced';
    }

    estimateTime(queries, steps, section = null) {
        const baseTime = 5; // 5 minutes base
        const queryTime = queries.length * 2; // 2 minutes per query
        const stepTime = steps.length * 1; // 1 minute per step

        let totalTime = baseTime + queryTime + stepTime;

        // Section-based time adjustments
        if (section) {
            if (section.enrichment?.technicalComplexity === 'high') {
                totalTime *= 1.5;
            }
            if (section.enrichment?.readabilityScore === 'low') {
                totalTime *= 1.2; // Extra time for comprehension
            }
        }

        return Math.min(Math.round(totalTime), 90); // Max 90 minutes
    }

    extractQueryTitle(query, index, section = null) {
        // Try to extract title from context or generate one
        if (query.context && query.context.length > 0) {
            const contextLine = query.context.split('\n')[0];
            if (contextLine && !contextLine.startsWith('```')) {
                return contextLine.replace(/^#+\s*/, '').trim();
            }
        }

        // Use section context for better titles
        if (section && section.title) {
            const kql = query.kql.toLowerCase();
            if (kql.includes('where') && kql.includes('error')) {
                return `${section.title} - Error Analysis`;
            }
            if (kql.includes('summarize')) {
                return `${section.title} - Summary Analysis`;
            }
            if (kql.includes('join')) {
                return `${section.title} - Correlation Query`;
            }
        }

        // Generate based on query type
        const kql = query.kql.toLowerCase();
        if (kql.includes('where') && kql.includes('error')) return `Error Analysis Query ${index + 1}`;
        if (kql.includes('summarize')) return `Summary Query ${index + 1}`;
        if (kql.includes('join')) return `Correlation Query ${index + 1}`;

        return `Query ${index + 1}`;
    }

    extractQueryDescription(query, section = null) {
        if (query.context) {
            const lines = query.context.split('\n');
            for (const line of lines) {
                if (line.trim() && !line.startsWith('#') && !line.startsWith('```') && line.length > 20) {
                    return line.trim();
                }
            }
        }

        // Enhanced description with section context
        if (section && section.context?.semanticMarkers) {
            const actions = section.context.semanticMarkers.actions;
            if (actions.length > 0) {
                return `Query to ${actions[0]} data from wiki documentation`;
            }
        }

        return 'Extracted from wiki documentation';
    }

    extractQueryContext(content, matchIndex) {
        // Extract surrounding context for the query
        const beforeContent = content.substring(Math.max(0, matchIndex - 300), matchIndex);
        const afterContent = content.substring(matchIndex, matchIndex + 300);

        return beforeContent + afterContent;
    }

    cleanKQLQuery(kql) {
        return kql
            .replace(/^\s*```[a-z]*\s*/i, '')
            .replace(/\s*```\s*$/, '')
            .trim();
    }

    determineQueryComplexity(kql) {
        let score = 0;

        if (kql.includes('join')) score += 3;
        if (kql.includes('union')) score += 2;
        if (kql.includes('summarize')) score += 2;
        if (kql.includes('extend')) score += 1;
        if (kql.split('|').length > 5) score += 2;
        if (/\b(let|function)\b/.test(kql)) score += 2;

        if (score <= 2) return 'low';
        if (score <= 5) return 'medium';
        return 'high';
    }

    extractRelatedTopics(content, section = null) {
        const topics = [];
        const topicPatterns = [
            /related:\s*([^#\n]+)/i,
            /see also:\s*([^#\n]+)/i,
            /references?:\s*([^#\n]+)/i
        ];

        for (const pattern of topicPatterns) {
            const match = content.match(pattern);
            if (match) {
                const relatedTopics = match[1].split(/[,;]/).map(t => t.trim());
                topics.push(...relatedTopics);
            }
        }

        // Enhanced related topics from section context
        if (section && section.relationships?.references?.length > 0) {
            topics.push(...section.relationships.references.map(ref => `Section: ${ref}`));
        }

        if (section && section.context?.semanticMarkers) {
            const tools = section.context.semanticMarkers.tools;
            // Add tool-specific related topics
            if (tools.includes('powershell')) {
                topics.push('PowerShell scripting best practices');
            }
            if (tools.includes('kql')) {
                topics.push('KQL query optimization');
            }
        }

        return topics.slice(0, 6);
    }

    extractTroubleshootingTips(content, section = null) {
        const tips = [];
        const tipPatterns = [
            /(?:tip|note|important):\s*([^#\n]+)/gi,
            /💡\s*([^#\n]+)/g,
            /⚠️\s*([^#\n]+)/g
        ];

        for (const pattern of tipPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && match[1].trim().length > 10) {
                    tips.push(match[1].trim());
                }
            }
        }

        // Enhanced tips from section context
        if (section && section.context?.semanticMarkers) {
            const markers = section.context.semanticMarkers;

            // Add tips based on urgency
            if (markers.urgency.length > 0) {
                tips.push(`High priority issue - handle with urgency: ${markers.urgency[0]}`);
            }

            // Add tips based on tools mentioned
            if (markers.tools.includes('powershell')) {
                tips.push('Ensure PowerShell is run with appropriate privileges');
            }

            if (markers.tools.includes('portal')) {
                tips.push('Verify you have the correct portal access and permissions');
            }
        }

        return tips.slice(0, 6);
    }

    /**
     * Generate AI-powered summary and analysis of the troubleshooting scenario
     */
    generateAISummary(title, description, content, queries, steps, section = null) {
        try {
            // Analyze content structure and context
            const context = this.analyzeScenarioContext(title, description, content, section);

            // Generate intelligent summary
            const summary = {
                overview: this.generateOverview(title, description, context, section),
                keyFindings: this.extractKeyFindings(content, queries, section),
                troubleshootingApproach: this.analyzeTroubleshootingApproach(steps, queries, section),
                impactAssessment: this.assessImpact(content, context, section),
                recommendedActions: this.generateRecommendedActions(content, queries, steps, section),
                prerequisites: this.extractPrerequisites(content, section),
                successCriteria: this.defineSuccessCriteria(content, context, section),
                commonPitfalls: this.identifyCommonPitfalls(content, section),
                relatedScenarios: this.identifyRelatedScenarios(content, context, section),
                contextualInsights: section ? this.generateContextualInsights(section) : null
            };

            return summary;
        } catch (error) {
            console.warn(`⚠️  Error generating AI summary: ${error.message}`);
            return {
                overview: `Troubleshooting scenario: ${title}`,
                keyFindings: [],
                troubleshootingApproach: 'Standard investigation process',
                impactAssessment: 'Impact varies based on scenario',
                recommendedActions: ['Review logs', 'Analyze queries', 'Follow documented steps'],
                prerequisites: ['Access to Azure AD logs', 'Appropriate permissions'],
                successCriteria: 'Issue resolved and documented',
                commonPitfalls: ['Insufficient log data', 'Missing context'],
                relatedScenarios: [],
                contextualInsights: null
            };
        }
    }

    /**
     * Analyze the context and structure of the scenario
     */
    analyzeScenarioContext(title, description, content, section = null) {
        const context = {
            domain: this.identifyDomain(title, description, content),
            urgency: this.assessUrgency(content),
            complexity: this.assessComplexity(content),
            scope: this.determineScope(content),
            stakeholders: this.identifyStakeholders(content),
            timeframe: this.estimateTimeframe(content),
            dataRequirements: this.identifyDataRequirements(content)
        };

        // Enhanced with section-specific context
        if (section) {
            context.structuralContext = {
                sectionLevel: section.level,
                contentType: section.context?.contentStructure?.primaryContentType,
                technicalComplexity: section.enrichment?.technicalComplexity,
                semanticMarkers: section.context?.semanticMarkers
            };
        }

        return context;
    }

    /**
     * Generate contextual insights from section metadata
     */
    generateContextualInsights(section) {
        const insights = {
            contentStructure: this.analyzeContentStructureInsights(section),
            qualityIndicators: this.generateQualityInsights(section),
            usageGuidance: this.generateUsageGuidance(section),
            extractionMetadata: this.generateExtractionMetadata(section)
        };

        return insights;
    }

    analyzeContentStructureInsights(section) {
        const structure = section.context?.contentStructure;
        if (!structure) return null;

        const insights = [];

        if (structure.primaryContentType === 'query-focused') {
            insights.push('This scenario is heavily focused on data analysis and query execution');
        }
        if (structure.primaryContentType === 'step-by-step') {
            insights.push('This scenario provides a structured, sequential approach to troubleshooting');
        }
        if (structure.informationDensity === 'high') {
            insights.push('This scenario contains dense technical information and multiple resources');
        }
        if (structure.hasCodeBlocks && structure.hasLists) {
            insights.push('This scenario combines executable code with structured procedures');
        }

        return insights;
    }

    generateQualityInsights(section) {
        const enrichment = section.enrichment;
        if (!enrichment) return null;

        const insights = [];

        if (enrichment.readabilityScore === 'high') {
            insights.push('Content is highly readable and user-friendly');
        } else if (enrichment.readabilityScore === 'low') {
            insights.push('Content may require technical expertise to interpret effectively');
        }

        if (enrichment.technicalComplexity === 'high' && enrichment.actionableContent?.length > 0) {
            insights.push('High complexity scenario with clear actionable steps - good for experienced users');
        }

        if (enrichment.informationDensity === 'high') {
            insights.push('Information-rich scenario - may require multiple review sessions');
        }

        return insights;
    }

    generateUsageGuidance(section) {
        const guidance = [];

        if (section.enrichment?.technicalComplexity === 'high') {
            guidance.push('Recommended for users with advanced Azure AD troubleshooting experience');
        }
        if (section.enrichment?.readabilityScore === 'low') {
            guidance.push('Consider having documentation or reference materials available');
        }
        if (section.context?.contentStructure?.primaryContentType === 'query-focused') {
            guidance.push('Ensure you have appropriate query execution environment set up');
        }
        if (section.enrichment?.actionableContent?.length > 3) {
            guidance.push('Multiple action items - consider breaking into phases or iterations');
        }

        return guidance;
    }

    generateExtractionMetadata(section) {
        return {
            sectionLevel: section.level,
            estimatedImportance: section.metadata?.estimatedImportance,
            hasParentContext: section.relationships?.parentSections?.length > 0,
            contentHints: section.metadata?.contentHints,
            extractionTimestamp: new Date().toISOString()
        };
    }

    /**
     * Generate comprehensive overview of the scenario
     */
    generateOverview(title, description, context) {
        const baseOverview = description || `This troubleshooting scenario addresses: ${title}`;

        // Enhanced with context
        let overview = baseOverview;

        if (context.domain) {
            overview += ` This issue relates to ${context.domain} functionality.`;
        }

        if (context.urgency === 'high') {
            overview += ' This is a high-priority issue requiring immediate attention.';
        }

        if (context.scope) {
            overview += ` The issue typically affects ${context.scope}.`;
        }

        return overview;
    }

    /**
     * Extract key findings from content and queries
     */
    extractKeyFindings(content, queries, section = null) {
        const findings = [];

        // Analyze queries for insights
        queries.forEach(query => {
            const kql = query.kql.toLowerCase();

            if (kql.includes('error') || kql.includes('failed')) {
                findings.push('Error patterns and failure indicators analysis');
            }

            if (kql.includes('count') || kql.includes('summarize')) {
                findings.push('Quantitative analysis of issue frequency and impact');
            }

            if (kql.includes('timespan') || kql.includes('ago(')) {
                findings.push('Time-based analysis for pattern identification');
            }

            if (kql.includes('join')) {
                findings.push('Cross-service correlation and relationship analysis');
            }
        });

        // Analyze content for explicit findings
        const findingPatterns = [
            /(?:finding|result|conclusion):\s*([^.\n]+)/gi,
            /(?:shows|indicates|reveals):\s*([^.\n]+)/gi,
            /(?:discovered|identified|observed):\s*([^.\n]+)/gi
        ];

        findingPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && match[1].trim().length > 15) {
                    findings.push(match[1].trim());
                }
            }
        });

        // Enhanced findings from section context
        if (section && section.context?.semanticMarkers) {
            const markers = section.context.semanticMarkers;

            if (markers.outcomes.length > 0) {
                findings.push(`Expected outcomes include: ${markers.outcomes.slice(0, 2).join(', ')}`);
            }

            if (markers.conditions.length > 0) {
                findings.push(`Key conditions to consider: ${markers.conditions.slice(0, 2).join(', ')}`);
            }
        }

        return findings.slice(0, 6);
    }

    /**
     * Analyze the troubleshooting approach
     */
    analyzeTroubleshootingApproach(steps, queries, section = null) {
        if (steps.length === 0 && queries.length === 0) {
            return 'Standard diagnostic process';
        }

        let approach = '';

        if (queries.length > 0) {
            approach += 'Data-driven investigation using KQL queries';

            const hasAnalysis = queries.some(q => q.kql.toLowerCase().includes('summarize'));
            const hasFiltering = queries.some(q => q.kql.toLowerCase().includes('where'));
            const hasCorrelation = queries.some(q => q.kql.toLowerCase().includes('join'));

            if (hasFiltering) approach += ' with targeted filtering';
            if (hasAnalysis) approach += ' and statistical analysis';
            if (hasCorrelation) approach += ' including cross-service correlation';
        }

        if (steps.length > 0) {
            if (approach) approach += '. ';
            approach += `Structured ${steps.length}-step investigation process`;
        }

        // Enhanced approach analysis with section context
        if (section && section.context?.contentStructure) {
            const structure = section.context.contentStructure;

            if (structure.primaryContentType === 'query-focused') {
                approach += ' with emphasis on data analysis and pattern recognition';
            } else if (structure.primaryContentType === 'step-by-step') {
                approach += ' following a systematic procedural methodology';
            }
        }

        return approach || 'Standard troubleshooting methodology';
    }

    /**
     * Assess the impact of the issue
     */
    assessImpact(content, context, section = null) {
        const lower = content.toLowerCase();

        // High impact indicators
        if (lower.includes('outage') || lower.includes('down') || lower.includes('critical')) {
            return 'High impact - Service disruption affecting multiple users';
        }

        // Medium impact indicators
        if (lower.includes('slow') || lower.includes('degraded') || lower.includes('intermittent')) {
            return 'Medium impact - Performance degradation or intermittent issues';
        }

        // Low impact indicators
        if (lower.includes('logging') || lower.includes('monitoring') || lower.includes('audit')) {
            return 'Low impact - Primarily affects monitoring or compliance';
        }

        // Context-based assessment
        if (context.urgency === 'high') {
            return 'High impact based on urgency indicators';
        }

        if (context.scope === 'organization-wide') {
            return 'High impact - Organization-wide effects';
        }

        // Section-based impact assessment
        if (section && section.context?.semanticMarkers?.urgency?.length > 0) {
            return `High impact - Contains urgency markers: ${section.context.semanticMarkers.urgency.join(', ')}`;
        }

        return 'Variable impact depending on scenario specifics';
    }

    /**
     * Generate recommended actions
     */
    generateRecommendedActions(content, queries, steps, section = null) {
        const actions = [];

        // Query-based recommendations
        if (queries.length > 0) {
            actions.push('Execute the provided KQL queries to gather diagnostic data');

            const hasTimeFilter = queries.some(q => q.kql.includes('ago('));
            if (hasTimeFilter) {
                actions.push('Adjust time ranges in queries based on when the issue was first observed');
            }
        }

        // Step-based recommendations
        if (steps.length > 0) {
            actions.push('Follow the documented troubleshooting steps in sequence');
        }

        // Content-based recommendations
        const lower = content.toLowerCase();

        if (lower.includes('permission') || lower.includes('access')) {
            actions.push('Verify user permissions and access rights');
        }

        if (lower.includes('configuration') || lower.includes('setting')) {
            actions.push('Review and validate configuration settings');
        }

        if (lower.includes('network') || lower.includes('connectivity')) {
            actions.push('Check network connectivity and firewall settings');
        }

        // Section-based recommendations
        if (section && section.enrichment?.actionableContent?.length > 0) {
            actions.push('Pay special attention to the actionable content highlighted in this scenario');
        }

        if (section && section.enrichment?.technicalComplexity === 'high') {
            actions.push('Consider involving technical specialists due to the complexity of this scenario');
        }

        // Generic recommendations
        actions.push('Document findings and resolution steps for future reference');
        actions.push('Consider escalation if initial troubleshooting steps do not resolve the issue');

        return actions.slice(0, 8);
    }

    /**
     * Extract prerequisites from content
     */
    extractPrerequisites(content, section = null) {
        const prerequisites = [];

        // Look for explicit prerequisites
        const prereqPatterns = [
            /prerequisite[s]?:\s*([^.\n]+)/gi,
            /(?:before|prior to|ensure):\s*([^.\n]+)/gi,
            /(?:requires?|needs?):\s*([^.\n]+)/gi
        ];

        prereqPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && match[1].trim().length > 10) {
                    prerequisites.push(match[1].trim());
                }
            }
        });

        // Infer common prerequisites
        const lower = content.toLowerCase();

        if (lower.includes('signinlogs') || lower.includes('auditlogs')) {
            prerequisites.push('Access to Azure AD sign-in and audit logs');
        }

        if (lower.includes('global admin') || lower.includes('administrator')) {
            prerequisites.push('Administrative privileges in Azure AD');
        }

        if (lower.includes('powershell') || lower.includes('azure ad module')) {
            prerequisites.push('Azure AD PowerShell module installed');
        }

        // Section-based prerequisites
        if (section && section.enrichment?.prerequisites?.length > 0) {
            prerequisites.push(...section.enrichment.prerequisites);
        }

        return prerequisites.length > 0 ? [...new Set(prerequisites)].slice(0, 6) : ['Appropriate Azure AD permissions', 'Access to relevant logs and data'];
    }

    /**
     * Define success criteria
     */
    defineSuccessCriteria(content, context, section = null) {
        const lower = content.toLowerCase();

        // Look for explicit success criteria
        if (lower.includes('success') || lower.includes('resolution')) {
            const successMatch = content.match(/(?:success|resolution|solved):\s*([^.\n]+)/i);
            if (successMatch) {
                return successMatch[1].trim();
            }
        }

        // Section-based success criteria
        if (section && section.enrichment?.expectedOutcome) {
            return section.enrichment.expectedOutcome;
        }

        // Infer from issue type
        if (lower.includes('error') || lower.includes('failed')) {
            return 'Errors are resolved and operations complete successfully';
        }

        if (lower.includes('slow') || lower.includes('performance')) {
            return 'Performance returns to acceptable levels';
        }

        if (lower.includes('sync') || lower.includes('synchronization')) {
            return 'Synchronization processes complete without errors';
        }

        return 'Issue is resolved and normal functionality is restored';
    }

    /**
     * Identify common pitfalls
     */
    identifyCommonPitfalls(content, section = null) {
        const pitfalls = [];
        const lower = content.toLowerCase();

        // Look for explicit warnings or notes
        const warningPatterns = [
            /(?:warning|caution|note|important):\s*([^.\n]+)/gi,
            /(?:avoid|don't|never):\s*([^.\n]+)/gi,
            /(?:common mistake|pitfall|issue):\s*([^.\n]+)/gi
        ];

        warningPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && match[1].trim().length > 15) {
                    pitfalls.push(match[1].trim());
                }
            }
        });

        // Infer common pitfalls
        if (lower.includes('permission') || lower.includes('access')) {
            pitfalls.push('Insufficient permissions to access required data or perform operations');
        }

        if (lower.includes('time') || lower.includes('ago(')) {
            pitfalls.push('Using incorrect time ranges that miss relevant events');
        }

        if (lower.includes('query') || lower.includes('kql')) {
            pitfalls.push('Modifying queries without understanding the full context');
        }

        // Section-based pitfalls
        if (section && section.enrichment?.technicalComplexity === 'high') {
            pitfalls.push('Underestimating the technical complexity of this scenario');
        }

        if (section && section.enrichment?.readabilityScore === 'low') {
            pitfalls.push('Misinterpreting instructions due to technical language complexity');
        }

        return pitfalls.slice(0, 5);
    }

    /**
     * Identify related scenarios
     */
    identifyRelatedScenarios(content, context, section = null) {
        const related = [];
        const lower = content.toLowerCase();

        // Common scenario relationships
        const relationships = {
            'authentication': ['sign-in issues', 'MFA problems', 'token validation'],
            'synchronization': ['directory sync', 'hybrid connectivity', 'user provisioning'],
            'applications': ['SSO configuration', 'API permissions', 'app registration'],
            'performance': ['slow sign-ins', 'timeout issues', 'capacity planning']
        };

        if (context.domain && relationships[context.domain]) {
            related.push(...relationships[context.domain]);
        }

        // Content-based relationships
        if (lower.includes('conditional access')) {
            related.push('Conditional Access policy troubleshooting');
        }

        if (lower.includes('guest') || lower.includes('b2b')) {
            related.push('B2B collaboration issues');
        }

        if (lower.includes('device')) {
            related.push('Device management and compliance');
        }

        // Section-based relationships
        if (section && section.relationships?.references?.length > 0) {
            related.push(...section.relationships.references.map(ref => `Related: ${ref}`));
        }

        return related.slice(0, 4);
    }

    /**
     * Generate wiki reference information
     */
    generateWikiReference(relativePath, sectionTitle, section = null) {
        const reference = {
            originalPath: relativePath,
            section: sectionTitle,
            lastChecked: new Date().toISOString(),
            sourceType: 'Azure AD Supportability Wiki',
            extractionVersion: '2.0',
            confidence: this.assessExtractionConfidence(relativePath, sectionTitle, section),
            recommendations: this.generateSourceRecommendations(relativePath),
            contextualMetadata: section ? {
                sectionLevel: section.level,
                contentStructure: section.context?.contentStructure?.primaryContentType,
                technicalComplexity: section.enrichment?.technicalComplexity,
                estimatedImportance: section.metadata?.estimatedImportance
            } : null
        };

        return reference;
    }

    /**
     * Helper methods for context analysis
     */
    identifyDomain(title, description, content) {
        const combined = `${title} ${description}`.toLowerCase();

        const domains = {
            'authentication': ['signin', 'login', 'auth', 'token', 'credential'],
            'synchronization': ['sync', 'directory', 'connect', 'hybrid'],
            'applications': ['app', 'application', 'sso', 'saml', 'oauth'],
            'provisioning': ['provision', 'scim', 'lifecycle', 'joiner', 'leaver'],
            'performance': ['slow', 'performance', 'latency', 'timeout'],
            'security': ['security', 'breach', 'incident', 'threat', 'risk']
        };

        for (const [domain, keywords] of Object.entries(domains)) {
            if (keywords.some(keyword => combined.includes(keyword))) {
                return domain;
            }
        }

        return 'general';
    }

    assessUrgency(content) {
        const lower = content.toLowerCase();
        const urgentTerms = ['critical', 'urgent', 'emergency', 'outage', 'down', 'production'];
        return urgentTerms.some(term => lower.includes(term)) ? 'high' : 'normal';
    }

    assessComplexity(content) {
        let score = 0;
        if (content.includes('join')) score += 2;
        if (content.includes('advanced')) score += 2;
        if (content.includes('multiple')) score += 1;
        if (content.split('|').length > 5) score += 1;

        return score > 3 ? 'high' : score > 1 ? 'medium' : 'low';
    }

    determineScope(content) {
        const lower = content.toLowerCase();
        if (lower.includes('organization') || lower.includes('tenant')) return 'organization-wide';
        if (lower.includes('department') || lower.includes('group')) return 'department';
        if (lower.includes('user') || lower.includes('individual')) return 'user-specific';
        return 'variable';
    }

    identifyStakeholders(content) {
        const stakeholders = [];
        const lower = content.toLowerCase();

        if (lower.includes('admin') || lower.includes('administrator')) stakeholders.push('IT Administrators');
        if (lower.includes('user') || lower.includes('end user')) stakeholders.push('End Users');
        if (lower.includes('developer') || lower.includes('app owner')) stakeholders.push('Application Developers');
        if (lower.includes('security') || lower.includes('compliance')) stakeholders.push('Security Team');

        return stakeholders;
    }

    estimateTimeframe(content) {
        const lower = content.toLowerCase();
        if (lower.includes('immediate') || lower.includes('urgent')) return 'immediate';
        if (lower.includes('hour') || lower.includes('quick')) return 'hours';
        if (lower.includes('day') || lower.includes('standard')) return 'days';
        return 'variable';
    }

    identifyDataRequirements(content) {
        const requirements = [];
        const lower = content.toLowerCase();

        if (lower.includes('signinlogs')) requirements.push('Sign-in logs');
        if (lower.includes('auditlogs')) requirements.push('Audit logs');
        if (lower.includes('identityinfo')) requirements.push('Identity information');
        if (lower.includes('directoryevents')) requirements.push('Directory events');

        return requirements;
    }

    assessExtractionConfidence(relativePath, sectionTitle, section = null) {
        let confidence = 0.7; // Base confidence

        // Boost confidence for well-structured content
        if (sectionTitle && sectionTitle.length > 5) confidence += 0.1;
        if (relativePath.includes('TSG') || relativePath.includes('troubleshoot')) confidence += 0.1;

        // Section-based confidence adjustments
        if (section) {
            // Boost for good structure
            if (section.context?.contentStructure?.hasCodeBlocks) confidence += 0.05;
            if (section.context?.contentStructure?.hasLists) confidence += 0.05;

            // Boost for clear content
            if (section.enrichment?.readabilityScore === 'high') confidence += 0.05;
            if (section.enrichment?.actionableContent?.length > 2) confidence += 0.05;

            // Boost for metadata quality
            if (section.metadata?.estimatedImportance > 2) confidence += 0.05;
        }

        // Cap at 0.95 to acknowledge extraction limitations
        return Math.min(confidence, 0.95);
    }

    generateSourceRecommendations(relativePath) {
        return [
            'Verify the source wiki is up to date',
            'Cross-reference with official Azure AD documentation',
            'Test queries in a safe environment before production use',
            'Consider reaching out to the original wiki contributors for clarification'
        ];
    }

    /**
     * Categorize all extracted scenarios
     */
    categorizeScenarios() {
        const categorized = {};

        for (const scenario of this.extractedScenarios) {
            const category = scenario.category;
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(scenario);
        }

        return categorized;
    }

    /**
     * Save scenarios to JSON files
     */
    async saveScenarios(categorizedScenarios) {
        console.log('\n💾 Saving extracted scenarios...');

        for (const [category, scenarios] of Object.entries(categorizedScenarios)) {
            const categoryDir = path.join(this.outputPath, category);

            // Ensure category directory exists
            try {
                await fs.mkdir(categoryDir, { recursive: true });
            } catch (error) {
                // Directory might already exist
            }

            // Save each scenario as a separate file
            for (const scenario of scenarios) {
                const fileName = `${scenario.id}.json`;
                const filePath = path.join(categoryDir, fileName);

                try {
                    await fs.writeFile(filePath, JSON.stringify(scenario, null, 2), 'utf-8');
                    if (this.verbose) {
                        console.log(`✅ Saved: ${category}/${fileName}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to save ${filePath}: ${error.message}`);
                    this.stats.errors++;
                }
            }
        }
    }

    /**
     * Update the scenarios index
     */
    async updateIndex(categorizedScenarios) {
        const indexPath = path.join(this.outputPath, 'index.json');

        try {
            // Read existing index
            let existingIndex = {
                version: "1.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                categories: []
            };

            try {
                const indexContent = await fs.readFile(indexPath, 'utf-8');
                existingIndex = JSON.parse(indexContent);
            } catch (error) {
                // File doesn't exist or is invalid, start fresh with default structure
            }

            // Ensure categories array exists
            if (!existingIndex.categories) {
                existingIndex.categories = [];
            }

            // Category display name mappings
            const categoryDisplayNames = {
                authentication: { displayName: "Authentication", description: "Authentication failures, MFA issues, and sign-in problems" },
                synchronization: { displayName: "Synchronization", description: "Cross-tenant sync, directory sync, and related issues" },
                provisioning: { displayName: "Provisioning", description: "User provisioning, SCIM issues, and application provisioning" },
                performance: { displayName: "Performance", description: "Performance analysis, slow sign-ins, and latency issues" },
                applications: { displayName: "Applications", description: "Application integration, service principal, and consent issues" },
                security: { displayName: "Security", description: "Security incidents, auditing, and compliance issues" },
                general: { displayName: "General", description: "General troubleshooting and miscellaneous scenarios" }
            };

            // Update with new scenarios
            for (const [categoryName, scenarios] of Object.entries(categorizedScenarios)) {
                // Find or create category
                let categoryObj = existingIndex.categories.find(cat => cat.name === categoryName);

                if (!categoryObj) {
                    const categoryInfo = categoryDisplayNames[categoryName] || {
                        displayName: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
                        description: `${categoryName} related scenarios`
                    };

                    categoryObj = {
                        name: categoryName,
                        displayName: categoryInfo.displayName,
                        description: categoryInfo.description,
                        scenarios: []
                    };
                    existingIndex.categories.push(categoryObj);
                }

                // Add new scenarios to category
                for (const scenario of scenarios) {
                    // Check if scenario already exists
                    const exists = categoryObj.scenarios.some(s => s.file === `${scenario.id}.json`);
                    if (!exists) {
                        categoryObj.scenarios.push({
                            file: `${scenario.id}.json`,
                            title: scenario.title,
                            description: scenario.description || `Troubleshooting scenario: ${scenario.title}`,
                            queryCount: scenario.queries ? scenario.queries.length : 0,
                            addedAt: new Date().toISOString(),
                            source: scenario.source?.type || 'wiki'
                        });
                    } else {
                        // Update existing scenario's query count
                        const existingScenario = categoryObj.scenarios.find(s => s.file === `${scenario.id}.json`);
                        if (existingScenario) {
                            existingScenario.queryCount = scenario.queries ? scenario.queries.length : 0;
                            existingScenario.description = scenario.description || existingScenario.description;
                        }
                    }
                }
            }

            // Update lastUpdated
            existingIndex.lastUpdated = new Date().toISOString().split('T')[0];

            // Save updated index
            await fs.writeFile(indexPath, JSON.stringify(existingIndex, null, 2), 'utf-8');
            console.log('✅ Updated scenarios index');

        } catch (error) {
            console.warn(`⚠️  Error updating index: ${error.message}`);
        }
    }

    /**
     * Print extraction summary
     */
    printSummary(categorizedScenarios) {
        console.log('\n' + '═'.repeat(50));
        console.log('📊 EXTRACTION SUMMARY');
        console.log('═'.repeat(50));
        console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
        console.log(`📋 Scenarios extracted: ${this.stats.scenariosExtracted}`);
        console.log(`🔍 Queries extracted: ${this.stats.queriesExtracted}`);
        console.log(`❌ Errors: ${this.stats.errors}`);

        console.log('\n📂 By Category:');
        for (const [category, scenarios] of Object.entries(categorizedScenarios)) {
            console.log(`  ${category}: ${scenarios.length} scenarios`);
        }

        if (this.dryRun) {
            console.log('\n🔍 This was a dry run - no files were saved');
            console.log('Remove --dry-run flag to save the extracted scenarios');
        } else {
            console.log('\n✅ Extraction completed successfully!');
            console.log(`📁 Scenarios saved to: ${this.outputPath}`);
        }
    }

    /**
     * Read file with automatic encoding detection
     */
    async readFileWithEncoding(filePath) {
        const encodings = ['utf16le', 'utf-8', 'latin1'];

        for (const encoding of encodings) {
            try {
                let content = await fs.readFile(filePath, encoding);

                // Remove BOM if present
                if (content.charCodeAt(0) === 0xFEFF) {
                    content = content.slice(1);
                }

                // For UTF-16, check if we have reasonable text (not too many null characters)
                if (encoding === 'utf16le') {
                    const testChars = content.substring(0, 100);
                    const nullCount = (testChars.match(/\u0000/g) || []).length;
                    if (nullCount > testChars.length * 0.3) {
                        continue; // Too many null characters, try next encoding
                    }
                }

                // Quick test for expected content to validate encoding
                if (content.includes('Tags:') || content.includes('GlobalIfx') || content.includes('```') || content.includes('#')) {
                    if (this.verbose) {
                        console.log(`    Using ${encoding} encoding`);
                    }
                    return content;
                }

            } catch (error) {
                // Try next encoding
                continue;
            }
        }

        // Fallback to utf-8 if nothing else works
        return await fs.readFile(filePath, 'utf-8');
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
DiagnosticIQ Wiki Extraction Tool

Usage: node extract-wiki-scenarios.js <wiki-path> [options]

Arguments:
  wiki-path          Path to the local wiki clone directory

Options:
  --output <path>    Output directory for scenarios (default: ./data/scenarios)
  --dry-run          Preview extraction without saving files
  --verbose          Enable verbose logging
  --help, -h         Show this help message

Examples:
  node extract-wiki-scenarios.js /path/to/wiki/clone
  node extract-wiki-scenarios.js C:\\wikis\\azuread-supportability --verbose
  node extract-wiki-scenarios.js /path/to/wiki --dry-run --output ./test-scenarios

For more information, visit: https://github.com/kayasax/DiagnostIQ
        `);
        process.exit(0);
    }

    const wikiPath = args[0];
    const options = {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose'),
        outputPath: args.includes('--output') ? args[args.indexOf('--output') + 1] : './data/scenarios'
    };

    const extractor = new WikiExtractor(wikiPath, options);
    await extractor.extract();
}

// Export for programmatic use
module.exports = WikiExtractor;

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}
