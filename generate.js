const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const config = require('./config.json');

/** The URL to all problems */
const PROBLEMSET_URL = 'http://codeforces.com/problemset/problem';

/** Configuration variables from ./config.json */
const PROBLEM_DIR = config.PROBLEM_DIR; // The path where every problem directory will be saved
const TEMPLATE_PATH = config.TEMPLATE_PATH; // The path to the master template file
const SOLUTION_NAME = config.SOLUTION_NAME; // The name of the template file created in each problem directory
const SAMPLE_DIR_NAME = config.SAMPLE_DIR_NAME; // The name of the test sample directory
const TEMP_DIR_NAME = config.TEMP_DIR_NAME; // The name of the temporary directory created for testing

/** 
 * This function is used to get the HTML content of any webpage.
 * @param {string} url - The URL of the webpage
 * @returns {string} The HTML content of the webpage
*/
const getHTML = async url => {
    const response = await axios.get(url);
    return cheerio.load(response.data);
}

/**
 * This function formats the HTML content of an element into a string.
 * @param {string} element - The HTML content to be formatted
 * @returns {string} The formatted HTML content
 */
const getStringFromElement = element => element.html().replace(/<br>/g, '\n').slice(0, -1);

/**
 * This function converts the URL of a webpage to a list of sample tests.
 * @param {string} url - The URL of the problem's webpage
 * @returns {Map[]} A list of key-value pairs of inputs and outputs
 */
const getSamplesFromURL = async url => {
    const $ = await getHTML(url);
    const inputStrings = $('.sample-tests .sample-test .input pre').map((index, element) => 
        getStringFromElement($(element))
    );
    const outputStrings = $('.sample-tests .sample-test .output pre').map((index, element) => 
        getStringFromElement($(element))
    );
    return [...Array(inputStrings.length).keys()].map(i => {
        return {
            input: inputStrings[i],
            output: outputStrings[i],
        };
    });
}

/**
 * This function generates the file that automatically runs through each test case.
 * @param {string} problemDirectory - The main directory of the problem
 * @param {number} sampleLen - The number of test cases
 */
const generateRunTests = (problemDirectory, sampleLen) => {
    const runFilePath = path.join(problemDirectory, 'run_tests_windows.bat');
    fs.copyFileSync('./run_tests_windows.bat', runFilePath);
    fs.readFile(runFilePath, 'utf8', (err, data) => {
        if (err) return console.log(err);
        const result = data
            .replace(/{{SOLUTION_NAME}}/g, SOLUTION_NAME)
            .replace(/{{SAMPLE_DIR_NAME}}/g, SAMPLE_DIR_NAME)
            .replace(/{{TEMP_DIR_NAME}}/g, TEMP_DIR_NAME)
            .replace(/{{SAMPLE_LEN}}/g, sampleLen);
        fs.writeFile(runFilePath, result, 'utf8', err => {
            if (err) return console.log(err);
        });
    });
}

/**
 * This function generates the directory containing all test cases.
 * @param {Object[]} samples - The inputs and outputs of each test case
 * @param {string} sampleDirectory - The directory in which the test cases will be saved
 */
const generateSamples = (samples, sampleDirectory) => {
    !fs.existsSync(sampleDirectory) && fs.mkdirSync(sampleDirectory);
    for(i in samples) {
        fs.writeFileSync(
            path.join(sampleDirectory, `input${i}.txt`), 
            samples[i].input
        );
        fs.writeFileSync(
            path.join(sampleDirectory, `output${i}.txt`), 
            samples[i].output
        );
    }
}

/**
 * This function creates the problem directory with all of the needed files.
 * @param {string} problemCode - The code of the problem
 */
const generateProblemDirectory = async problemCode => {
    const samples = await getSamplesFromURL(`${PROBLEMSET_URL}/${problemCode.slice(0, -1)}/${problemCode.slice(-1)}`);
    const problemDirectory = path.join(PROBLEM_DIR, problemCode)
    const sampleDirectory = path.join(problemDirectory, SAMPLE_DIR_NAME)
    const templatePath = path.join(problemDirectory, SOLUTION_NAME);
    !fs.existsSync(problemDirectory) && fs.mkdirSync(problemDirectory);
    !fs.existsSync(templatePath) && fs.copyFileSync(TEMPLATE_PATH, templatePath, fs.constants.COPYFILE_EXCL);
    generateRunTests(problemDirectory, samples.length - 1);
    generateSamples(samples, sampleDirectory);
    console.log(`Generated problem directory for problem ${problemCode}!`);
    console.log(`You can find the test cases in ${sampleDirectory}.`)
}

// If no problem names were provided
if(process.argv.length < 3) {
    console.log('Error: couldn\'t find problem name.')
    console.log('Please try running the script in the following format: ');
    console.log(`node ${path.basename(__filename)} <problem name>`);
    process.exit(1);
}

for(problemCode of process.argv.slice(2)) generateProblemDirectory(problemCode);