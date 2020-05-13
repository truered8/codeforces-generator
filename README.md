# codeforces-generator
This repository automatically generates a directory for solving a problem from [CodeForces](https://codeforces.com/) given the name of the problem. The directory contains:
* All test cases of the problem
* A solution file based on a template provided by the user
* A script that runs through all test cases and checks if the program has the correct output

The repository currently only supports C++ on Windows.

# Getting Started
First, ensure that you have [`git`](https://git-scm.com/) and [`npm`](https://nodejs.org/en/) installed.
Then, run the following commands:
``` batch
git clone https://github.com/truered8/codeforces-generator
cd codeforces-generator
npm install
```

# Usage
## Creating the Problem Directory
1. Edit the required settings in `config.json`:
   * `PROBLEM_DIR`: The path where every problem directory will be saved
   * `TEMPLATE_PATH`: The path to the master template file
   * `SOLUTION_NAME`: The name of the template file created in each problem directory
   * `SAMPLE_DIR_NAME`: The name of the test sample directory
2. Run the following command:
   ``` batch
   node generate {problem codes}
   ```
    where {problem codes} should be replaced with the code of each problem you wish to scrape. For example:
    ``` batch
    node generate 158A 4A
    ```
    will generate the directories for problems [158A](https://codeforces.com/problemset/problem/158/A) and [4A](https://codeforces.com/problemset/problem/4/A).
## Running Tests
This should be performed after you have implemented your solution.
1. Enter the directory that contains the problem:
   ``` batch
   cd {PROBLEM_DIR}\{code of problem}
   ```
   where {PROBLEM_DIR} should be replaced with the PROBLEM_DIR setting previously configured and {code of problem} should be replaced with the code of the problem.
2. Run the batch file:
   ``` batch
   runtests_windows.bat
   ```
   This will run each of the test cases, and output any errors your solution made.