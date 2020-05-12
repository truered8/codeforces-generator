const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const PROBLEMSET_URL = 'http://codeforces.com/problemset/problem'; // The URL to all problems
const TEMPLATE_PATH = './template.cpp'; // The path to the template file
const TEMPLATE_NAME = 'template.cpp'; // The path to the 
const SAMPLE_DIR_NAME = 'samples';

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
 * This function creates the problem directory with all of the needed files.
 * @param {string} problemName - The name of the problem
 */
const createDirectoryFromName = async problemName => {
    const samples = await getSamplesFromURL(`${PROBLEMSET_URL}/${problemName.slice(0, -1)}/${problemName.slice(-1)}`);
    const problemDirectory = path.join(__dirname, problemName)
    const sampleDirectory = path.join(problemDirectory, SAMPLE_DIR_NAME);
    !fs.existsSync(problemDirectory) && fs.mkdirSync(problemDirectory);
    !fs.existsSync(sampleDirectory) && fs.mkdirSync(sampleDirectory);
    fs.copyFileSync(TEMPLATE_PATH, path.join(problemDirectory, TEMPLATE_NAME));
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
    console.log(`Generated problem directory for problem ${process.argv[2]}!`);
}

if(process.argv.length < 3) {
    console.log('Error: couldn\'t find problem name.')
    console.log('Please try running the script in the following format: ');
    console.log(`node ${path.basename(__filename)} <problem name>`);
    process.exit(1);
}

createDirectoryFromName(process.argv[2]);