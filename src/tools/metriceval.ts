"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricEvaluation = void 0;
const logger_1 = __importDefault(require("../logger"));
/**************************************************************************************************
 * metricEvaluation
 * 1. Takes in the communicator class to access repository responses
 * 2. Filters through responses that are stored in communicator to generate metric calculations
 * 3. Logs all Evaluation metrics to console
 * 4. If it cannot find metric due to inappropriate responses. Metric will default to 0.
 **************************************************************************************************/
class metricEvaluation {
    constructor(communicator) {
        this.license = 0;
        this.threshold_response = 3;
        this.threshold_bus = 5;
        this.threshold_rampup = 8;
        this.busFactor = 0;
        this.responsivness = 0;
        this.rampUp = 0;
        this.correctness = 0;
        this.score = 0;
        this.pinnedDependencyFraction = 0;
        this.codeIntroducedThroughPullRequestsFraction = 0;
        this.communicator = communicator;
        this.getBus();
        this.getRampUp();
        this.getCorrectness();
        this.getResponsiveness();
        this.getlicense();
        this.getPinnedDependencyFraction();
        this.getCodeIntroducedThroughPullRequestsFraction();
        this.netScore();
    }
    //WIP
    getPinnedDependencyFraction() {
        if (!this.communicator.dependencies) {
            logger_1.default.error(`API failed to return dependency information for url: ${this.communicator.connection.url}`);
            return 0;
        }
        const dependencies = this.communicator.dependencies;
        const pinnedDependencies = dependencies.filter(dependency => {
            return dependency.pinnedToSpecificVersion;
        });
        return pinnedDependencies.length / dependencies.length || 0;
    }
    getCodeIntroducedThroughPullRequestsFraction() {
        if (!this.communicator.pullRequests) {
            logger_1.default.error(`API failed to return pull request information for url: ${this.communicator.connection.url}`);
            return 0;
        }
        const pullRequests = this.communicator.pullRequests;
        const reviewedPullRequests = pullRequests.filter(pr => pr.hasCodeReview);
        return reviewedPullRequests.length / pullRequests.length || 0;
    }
    getCorrectness() {
        if (!this.communicator.general) {
            logger_1.default.error(`API failed to return Correctness information for url: ${this.communicator.connection.url}`);
            return;
        }
        if ('open_issues_count' in this.communicator.general && 'watchers_count' in this.communicator.general) {
            const open_issues = this.communicator.general['open_issues_count'];
            const watchers_count = this.communicator.general['watchers_count'];
            this.correctness = Math.max(1 - Math.log(open_issues) / Math.log(watchers_count), 0);
            this.correctness = parseFloat(this.correctness.toFixed(5));
        }
    }
    getRampUp() {
        if (!this.communicator.contributors || !Array.isArray(this.communicator.contributors)) {
            logger_1.default.error(`API failed to return Ramp Up (contributor) information for url: ${this.communicator.connection.url}`);
            return;
        }
        //console.log(this.communicator.contributors)
        const firstCommitWeeks = this.communicator.contributors.map(contributor => {
            for (const week of contributor.weeks) {
                if (week.c > 0) {
                    return week.w;
                }
            }
            return null;
        }).filter(Boolean);
        if (firstCommitWeeks.length === 0) {
            return null;
        }
        const sortedWeeks = firstCommitWeeks.slice().sort((a, b) => a - b);
        let differences = [];
        for (let i = 1; i < sortedWeeks.length; i++) {
            const diff = sortedWeeks[i] - sortedWeeks[i - 1];
            differences.push(diff);
        }
        const average_seconds = differences.reduce((acc, diff) => acc + diff, 0) / differences.length;
        const average_weeks = average_seconds / 60 / 60 / 24 / 7;
        this.rampUp = average_weeks ? Math.min(1, this.threshold_rampup / average_weeks) : 0;
        this.rampUp = parseFloat(this.rampUp.toFixed(5));
        //logger.info(`Ramp Up: ${this.rampUp}`)
    }
    getBus() {
        if (!this.communicator.contributors) {
            logger_1.default.error(`API failed to return Bus Factor (contributor) information for url: ${this.communicator.connection.url}`);
            return;
        }
        if (Array.isArray(this.communicator.contributors)) {
            let commitList = [];
            this.communicator.contributors.forEach(contributor => {
                commitList.push(contributor.total);
            });
            //console.log(commitList)
            const sortedCommits = commitList.sort((a, b) => b - a);
            const sum = sortedCommits.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            let current_sum = 0;
            for (let i = 0; i < sortedCommits.length && current_sum < sum / 2; i++) {
                current_sum += sortedCommits[i];
                this.busFactor += 1;
            }
            this.busFactor = Math.min(1, this.busFactor / this.threshold_bus);
            this.busFactor = parseFloat(this.busFactor.toFixed(5));
            // logger.info(`Bus Factor: ${this.busFactor}`)
        }
    }
    getResponsiveness() {
        //If static analysis worked
        if (this.communicator.recentCommit) {
            const commitDate = new Date(this.communicator.recentCommit);
            const today = new Date();
            const diffInMonths = (today.getFullYear() - commitDate.getFullYear()) * 12 + (today.getMonth() - commitDate.getMonth());
            this.responsivness = this.threshold_response / Math.max(this.threshold_response, diffInMonths);
            this.responsivness = parseFloat(this.responsivness.toFixed(5));
        }
        else if (!this.communicator.commits) {
            logger_1.default.error(`API failed to return responsiveness information for url: ${this.communicator.connection.url}`);
            return;
        }
        //If static analysis did not work, use api
        else {
            const mostRecentCommit = this.communicator.commits[0];
            const commitDate = new Date(mostRecentCommit.commit.author.date);
            const today = new Date();
            const diffInMonths = (today.getFullYear() - commitDate.getFullYear()) * 12 + (today.getMonth() - commitDate.getMonth());
            this.responsivness = this.threshold_response / Math.max(this.threshold_response, diffInMonths);
            this.responsivness = parseFloat(this.responsivness.toFixed(5));
        }
        //  logger.info(`Responsivene Maintainer: ${this.responsivness}`)
    }
    getlicense() {
        if (!this.communicator.general) {
            logger_1.default.error(`API failed to return clicense information for url: ${this.communicator.connection.url}`);
            return;
        }
        if ('license' in this.communicator.general) {
            if (this.communicator.general['license']) {
                this.license = 1;
            }
        }
        //  logger.info(`License: ${this.license}`)
    }
    //TODO: Update weighting
    netScore() {
        this.score = 0.2 * this.busFactor + 0.3 * this.responsivness + 0.1 * this.license + 0.1 * this.rampUp + 0.3 * this.correctness + .1 * this.pinnedDependencyFraction + .1 * 0.1 * this.codeIntroducedThroughPullRequestsFraction;
        // logger.info(`Net Score: ${this.score}`)
        this.score = parseFloat(this.score.toFixed(5));
        return this.score;
    }
    logAll() {
        const output = { "URL": this.communicator.connection.url, "NET_SCORE": this.score, "RAMP_UP_SCORE": this.rampUp, "CORRECTNESS_SCORE": this.correctness, "BUS_FACTOR_SCORE": this.busFactor, "RESPONSIVE_MAINTAINER_SCORE": this.responsivness, "LICENSE_SCORE": this.license, "DEPENDENCY": this.pinnedDependencyFraction, "PULLREQ": this.codeIntroducedThroughPullRequestsFraction
        };
        //const outputString: string = `{"URL": ${this.communicator.connection.url}, "NET_SCORE": ${this.score}, "RAMP_UP_SCORE": ${this.rampUp}, "CORRECTNESS_SCORE": ${this.correctness}, "BUS_FACTOR_SCORE": ${this.busFactor}, "RESPONSIVE_MAINTAINER_SCORE": ${this.responsivness}, "LICENSE_SCORE": ${this.license}}`;
        const outputString = JSON.stringify(output, null, 2);
        console.log(outputString);
        //logger.info(outputString)
    }
}
exports.metricEvaluation = metricEvaluation;
//# sourceMappingURL=metriceval.js.map
