#!/usr/bin/env bun
// ./src/consolidate/consolidate.ts

/**
 * @file consolidate.ts
 * @description A utility script to consolidate project files into single,
 *              combined output files. The script is organized into logical
 *              namespaces:
 *              - `config`: Defines the consolidation jobs.
 *              - `ui`: Handles all console output and user interface elements.
 *              - `fileSystem`: Provides low-level functions for file system interactions.
 *              - `consolidator`: Orchestrates the consolidation process using the other namespaces.
 * @copyright 2026 Dustin Dew
 * @license MIT
 * @author Dustin Dew <phyxashun@gmail.com>
 */

import { styleText } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import {
    LineType,
    BoxType,
    Spacer,
    CenteredText,
    CenteredFiglet,
    PrintLine,
    BoxText,
} from '../logger/logger';

/******************************************************************************************************
 *
 * CONSTANTS
 *
 ******************************************************************************************************/
const OUTPUT_DIR = './ALL';
/**
 * Description placeholder
 *
 * @type {string}
 */
const TEXT_OUTPUT_DIR = OUTPUT_DIR + '/txt/';
/**
 * Description placeholder
 *
 * @type {string}
 */
const TS_OUTPUT_DIR = OUTPUT_DIR + '/ts/';
/**
 * Description placeholder
 *
 * @type {30}
 */
const START_END_SPACER = 30;
/**
 * Description placeholder
 *
 * @type {2}
 */
const START_END_NEWLINE = 2;
/**
 * Description placeholder
 *
 * @type {100}
 */
const FILE_DIVIDER_WIDTH = 100;

/******************************************************************************************************
 *
 * TYPES
 *
 ******************************************************************************************************/
/**
 * @interface JobDefinition
 * @description Defines the structure for a single consolidation task.
 * @property {string} name - A name for the job, used in output file name.
 * @property {string} description - A descriptive name for the job, used in logging.
 * @property {string[]} patterns - An array of glob patterns to find files for this job.
 */
interface JobDefinition {
    /**
     * Description placeholder
     *
     * @type {string}
     */
    name: string;
    /**
     * Description placeholder
     *
     * @type {?string}
     */
    description?: string;
    /**
     * Description placeholder
     *
     * @type {string[]}
     */
    patterns: string[];
}

/**
 * @interface ConsolidationJob
 * @description Defines the structure for a single consolidation task.
 * @extends {JobDefinition}
 * @property {string} outputFile - The path to the file where content will be consolidated.
 */
interface ConsolidationJob extends JobDefinition {
    /**
     * Description placeholder
     *
     * @type {string}
     */
    outputFile: string;
}

/**
 * Description placeholder
 *
 * @interface Configuration
 * @typedef {Configuration}
 */
interface Configuration {
    /**
     * Description placeholder
     *
     * @type {(outputDir: string, extension: string) => ConsolidationJob[]}
     */
    GenerateJobs: (outputDir: string, extension: string) => ConsolidationJob[];
    /**
     * Description placeholder
     *
     * @type {ConsolidationJob[]}
     */
    JOBS: ConsolidationJob[];
    /**
     * Description placeholder
     *
     * @type {string[]}
     */
    IGNORELIST: string[];
}

/**
 * Description placeholder
 *
 * @interface FinalSummaryOptions
 * @typedef {FinalSummaryOptions}
 */
interface FinalSummaryOptions {
    /**
     * Description placeholder
     *
     * @type {number}
     */
    totalFiles: number;
    /**
     * Description placeholder
     *
     * @type {number}
     */
    processedJobs: number;
    /**
     * Description placeholder
     *
     * @type {number}
     */
    skippedJobs: number;
}

/******************************************************************************************************
 *
 * CONFIGURATION
 *
 ******************************************************************************************************/
const JOB_DEFINITIONS: JobDefinition[] = [
    {
        name: 'MAIN_FILES',
        description: 'Main Project TypeScript and JavaScript Files',
        patterns: ['src/**/*.ts', 'src/**/*.js', 'index.ts', 'Consolidate.ts'],
    },
    {
        name: 'CONFIG',
        description: 'Configuration Files and Markdown',
        patterns: [
            '.vscode/**/*',
            '.gitignore',
            '*.json',
            '*.config.ts',
            'git-push.sh',
        ],
    },
    {
        name: 'NEW_TEST',
        description: 'New Test Files',
        patterns: ['{test,tests}/**/*.test.ts'],
    },
    {
        name: 'OLD_TEST',
        description: 'Old Test Files',
        patterns: [
            '{test_old, tests_old}/**/*.ts',
            '{test_old,test_old}/**/*.test.ts',
        ],
    },
    {
        name: 'MARKDOWN',
        description: 'Project Markdown Files',
        patterns: ['0. NOTES/*', 'License', '*.md'],
    },
];

/**
 * Description placeholder
 *
 * @type {Configuration}
 */
const CONFIG: Configuration = {
    GenerateJobs: (
        outputDir: string,
        fileExtension: string,
    ): ConsolidationJob[] => {
        return JOB_DEFINITIONS.map((definition, index) => ({
            name: styleText(
                ['red', 'underline'],
                definition.description ?? definition.name,
            ),

            outputFile: `${outputDir}${(index + 1).toString()}_ALL_${definition.name.toUpperCase().replace(' ', '_')}.${fileExtension}`,

            patterns: definition.patterns,
        }));
    },
    JOBS: [],
    IGNORELIST: [] as string[],
};

CONFIG.JOBS = [
    ...CONFIG.GenerateJobs(TS_OUTPUT_DIR, 'ts'),
    ...CONFIG.GenerateJobs(TEXT_OUTPUT_DIR, 'txt'),
];

CONFIG.IGNORELIST = [
    './**/*.lock',
    './coverage/**/*.*',
    './node_modules/**/*.*',
    './ALL/**',
];

/******************************************************************************************************
 *
 * USER INTERFACE
 *
 ******************************************************************************************************/
const ui = {
    /**
     * @function displayHeader
     * @description Renders the main application header, including title and subtitle.
     * @returns {void}
     */
    displayHeader: (): void => {
        PrintLine({ preNewLine: true, lineType: LineType.boldBlock });
        console.log(
            styleText(
                ['yellowBright', 'bold'],
                CenteredFiglet(`Consolidate!!!`),
            ),
        );
        CenteredText(
            styleText(
                ['magentaBright', 'bold'],
                '*** PROJECT FILE CONSOLIDATOR SCRIPT ***',
            ),
        );
        PrintLine({
            preNewLine: true,
            postNewLine: true,
            lineType: LineType.boldBlock,
        });
    },

    /**
     * Logs the start of a new consolidation job.
     * @param {string} description - The name of the job being processed.
     * @param {string} outputFile - The path of the output file for the job.
     */
    logJobStart: (description: string, outputFile: string): void => {
        CenteredText(
            styleText('cyan', `Consolidating all project ${description}`),
        );
        CenteredText(styleText('cyan', `files into ${outputFile}...\n`));
    },

    /**
     * Logs the path of a file being appended to an output file.
     * @param {string} filePath - The path of the file being appended.
     */
    logFileAppend: (filePath: string): void => {
        console.log(styleText('blue', `\tAppending:`), filePath);
    },

    /**
     * Logs a successful completion message for a job.
     */
    logComplete: (): void => {
        console.log();
        CenteredText(styleText(['green', 'bold'], 'Consolidation complete!!!'));
        PrintLine({
            preNewLine: true,
            postNewLine: true,
            lineType: LineType.boldBlock,
        });
    },

    /**
     * Logs a final summary message after all jobs are complete.
     * @param {number} fileCount - The total number of files consolidated.
     * @param {number} jobCount - The total number of jobs processed.
     */
    logFinalSummary: (options: FinalSummaryOptions): void => {
        const { totalFiles, processedJobs, skippedJobs } = options;
        let summaryMessage = `✓ Successfully consolidated ${totalFiles.toString()} files across ${processedJobs.toString()} jobs.`;
        if (skippedJobs > 0) {
            summaryMessage += ` (${skippedJobs.toString()} jobs skipped).`;
        }
        BoxText(summaryMessage, {
            boxType: BoxType.double,
            color: 'green',
            textColor: ['green', 'bold'],
        });
        PrintLine({
            preNewLine: true,
            postNewLine: true,
            lineType: LineType.boldBlock,
        });
    },
};

/******************************************************************************************************
 *
 * FILE SYSTEM INTERACTION
 *
 ******************************************************************************************************/
const fileSystem = {
    /**
     * Ensures that a directory exists, creating it if necessary.
     * @param {string} dirPath - The path to the directory to create.
     */
    ensureDirectoryExists: (dirPath: string): void => {
        if (!fs.existsSync(dirPath)) {
            CenteredText(
                styleText(['yellow', 'bold'], `Creating directory: ${dirPath}`),
            );
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },

    /**
     * Ensures an output file is empty by deleting it if it already exists.
     * @param {string} filePath - The path to the output file to prepare.
     */
    prepareOutputFile: (filePath: string): void => {
        // Extract directory path and ensure it exists
        const dirPath = path.dirname(filePath);
        fileSystem.ensureDirectoryExists(dirPath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    },

    /**
     * Finds all file paths matching an array of glob patterns using Bun.Glob.
     * @param {string[]} patterns - The glob patterns to search for.
     * @param {string} outputFile - The path of the output file, to be excluded from the search.
     * @param {string[]} [ignorePatterns] - An optional array of glob patterns to ignore files.
     * @returns {Promise<string[]>} A promise that resolves to an array of found file paths.
     */
    findFiles: (patterns: string[], outputFile: string): string[] => {
        return globSync(patterns, {
            ignore: [...CONFIG.IGNORELIST, outputFile],
        });
    },

    /**
     * Creates the content for a single source file, including headers and footers.
     * @param {string} sourceFile - The path of the source file to process.
     * @returns {Promise<string>} A promise that resolves to the formatted file content as a string.
     */
    createFileContent: async (sourceFile: string): Promise<string> => {
        const space = Spacer(START_END_SPACER, '■');
        const endLine = Spacer(START_END_NEWLINE, '\n');
        const divider = Spacer(FILE_DIVIDER_WIDTH, '█');
        const fileDivider = `//${divider}\n`;
        const startFile = `${endLine}//${space} Start of file: ${sourceFile} ${space}${endLine}${endLine}\n`;
        const content = await Bun.file(sourceFile).text();
        const endFile = `\n${endLine}${endLine}//${space} End of file: ${sourceFile} ${space}${endLine}\n`;
        return `${startFile}${content}${endFile}${fileDivider}${fileDivider}`;
    },
};

/******************************************************************************************************
 *
 * MAIN EXECUTION AND EXPORTS
 *
 ******************************************************************************************************/
const consolidateJobs = {
    /**
     * Processes a single consolidation job. Finds files and, if any exist,
     * consolidates them into a single output file.
     * Skips the job silently if no files are found.
     * @param {ConsolidationJob} job - The consolidation job to execute.
     * @returns {Promise<number>} The number of files processed in the job.
     */
    process: async (job: ConsolidationJob): Promise<number> => {
        const { name, outputFile, patterns } = job;
        const sourceFiles = fileSystem.findFiles(patterns, outputFile);
        if (sourceFiles.length > 0) {
            ui.logJobStart(name, outputFile);
            fileSystem.prepareOutputFile(outputFile);
            const allContent: string[] = [];
            for (const sourceFile of sourceFiles) {
                ui.logFileAppend(sourceFile);
                const content = await fileSystem.createFileContent(sourceFile);
                allContent.push(content);
            }
            fs.writeFileSync(outputFile, allContent.join(''));
            ui.logComplete();
            return sourceFiles.length;
        }
        return 0; // No files found for this job
    },

    /**
     * Runs all consolidation jobs, tracks the total files processed, and logs a final summary.
     * @param {CONFIG.ConsolidationJob[]} jobs - An array of consolidation jobs to execute.
     */
    run: async (jobs: ConsolidationJob[]): Promise<void> => {
        let totalFiles = 0;
        let processedJobs = 0;
        let skippedJobs = 0; // --- 5. Add counter for skipped jobs ---
        for (const job of jobs) {
            const fileCountForJob = await consolidateJobs.process(job);
            if (fileCountForJob > 0) {
                totalFiles += fileCountForJob;
                processedJobs++;
            } else {
                skippedJobs++; // --- 6. Increment if job returned 0 files ---
            }
        }
        if (totalFiles > 0) {
            // --- 7. Pass all counts to the summary function ---
            ui.logFinalSummary({ totalFiles, processedJobs, skippedJobs });
        }
    },
};

/**
 * @function main
 * @description The main entry point for the script. Initializes the UI and
 *              starts the consolidation process.
 */
export const main = async (): Promise<void> => {
    ui.displayHeader();
    await consolidateJobs.run(CONFIG.JOBS);
};

// Executes and exports the script.
/**
 * Description placeholder
 *
 * @type {() => Promise<void>}
 */
const consolidate = main;
export default consolidate;
await consolidate();
