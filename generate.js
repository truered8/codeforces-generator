const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const PROBLEMSET_URL = 'http://codeforces.com/problemset/problem'; // The URL to all problems
const PROBLEM_DIR = '../'; // The path where every problem directory will be saved
const TEMPLATE_PATH = './template.cpp'; // The path to the master template file
const SOLUTION_NAME = 'solution.cpp'; // The name of the template file created in each problem directory
const SAMPLE_DIR_NAME = 'samples'; // The name of the test sample directory

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
    const runFilePath = path.join(problemDirectory, 'runtests_windows.bat');
    fs.copyFileSync('./runtests_windows.bat', runFilePath);
    fs.readFile(runFilePath, 'utf8', (err, data) => {
        if (err) return console.log(err);
        const result = data
            .replace(/{{SOLUTION_NAME}}/g, SOLUTION_NAME)
            .replace(/{{SAMPLE_DIR_NAME}}/g, SAMPLE_DIR_NAME)
            .replace(/{{SAMPLE_LEN}}/g, sampleLen);
        fs.writeFile(runFilePath, result, 'utf8', err => {
            if (err) return console.log(err);
        });
    });
}

/**
 * This function generates the directory containing all test cases
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
 * @param {string} problemName - The name of the problem
 */
const generateProblemDirectory = async problemName => {
    const samples = await getSamplesFromURL(`${PROBLEMSET_URL}/${problemName.slice(0, -1)}/${problemName.slice(-1)}`);
    const problemDirectory = path.join(PROBLEM_DIR, problemName)
    const sampleDirectory = path.join(problemDirectory, SAMPLE_DIR_NAME)
    !fs.existsSync(problemDirectory) && fs.mkdirSync(problemDirectory);
    fs.copyFileSync(TEMPLATE_PATH, path.join(problemDirectory, SOLUTION_NAME));
    generateRunTests(problemDirectory, samples.length - 1);
    generateSamples(samples, sampleDirectory);
    console.log(`Generated problem directory for problem ${problemName}!`);
    console.log(`You can find the test cases in ${sampleDirectory}.`)
}

if(process.argv.length < 3) {
    console.log('Error: couldn\'t find problem name.')
    console.log('Please try running the script in the following format: ');
    console.log(`node ${path.basename(__filename)} <problem name>`);
    process.exit(1);
}

for(problemName of process.argv.slice(2)) generateProblemDirectory(problemName);