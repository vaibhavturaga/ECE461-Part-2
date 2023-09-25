// const { CoverageReporter } = require('@jest/reporters');
// import { Reporter, TestContext } from "@jest/reporters";
// import { AggregatedResult } from "@jest/test-result";


logger = require('./logger');

class CustomReporter {//} extends CoverageReporter{
  constructor(globalConfig, options) {
    // super()
    this._globalConfig = globalConfig;
    this._options = options;
  }

  // async onRunComplete(testContexts, aggregatedResults) {
  //   await this._addUntestedFiles(testContexts);
  //   const {map, reportContext} = await this._getCoverageResult();
  //   try {
  //     const coverageReporters = this._globalConfig.coverageReporters || [];
  //     if (!this._globalConfig.useStderr && coverageReporters.length < 1) {
  //       coverageReporters.push('text-summary');
  //     }
  //     coverageReporters.forEach(reporter => {
  //       let additionalOptions = {};
  //       if (Array.isArray(reporter)) {
  //         [reporter, additionalOptions] = reporter;
  //       }
  //       _istanbulReports()
  //         .default.create(reporter, {
  //           maxCols: process.stdout.columns || Infinity,
  //           ...additionalOptions
  //         })
  //         .execute(reportContext);
  //     });
  //     aggregatedResults.coverageMap = map;
  //   } catch (e) {
  //     console.error(
  //       _chalk().default.red(`
  //       Failed to write coverage reports:
  //       ERROR: ${e.toString()}
  //       STACK: ${e.stack}
  //     `)
  //     );
  //   }
  //   this._checkThreshold(map);
  // }

  async onRunComplete(testContexts, results) {
    const totalTests = results.numTotalTests;
    const passedTests = results.numPassedTests;
  
    console.log(`Total: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);

    // await this._addUntestedFiles(testContexts);
    // const {map, reportContext} = await this._getCoverageResult();
  
    // if (results.coverageMap) {
    const coverage = results.coverageMap.getCoverageSummary();
    const totalCoverage = (
      (coverage.lines.pct + coverage.branches.pct + coverage.functions.pct + coverage.statements.pct) / 4
    ).toFixed(2);
    console.log(`Coverage: ${totalCoverage}%`);
    console.log(`${passedTests}/${totalTests} test cases passed. ${totalCoverage}% line coverage achieved.`);
    // } else {
    //   console.log(`${passedTests}/${totalTests} test cases passed.`);
    // }
  }  
}

module.exports = CustomReporter;
