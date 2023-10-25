// server.ts
import express from 'express';
import { repoConnection, repoCommunicator, metricEvaluation } from './api'; // Adjust the imports according to your project structure
import logger from './logger';

const app = express();
const port = 3000;

app.get('/repo-info/:owner/:repo', async (req, res) => {
    const owner = req.params.owner;
    const repo = req.params.repo;
    
    const connection = new Connection(owner, repo);
    const communicator = new repoCommunicator(connection);
    
    await communicator.retrieveAllInfo();
    
    const metricEval = new metricEvaluation(communicator);
    
    res.json({
        url: communicator.connection.url,
        net_score: metricEval.score,
        ramp_up_score: metricEval.rampUp,
        correctness_score: metricEval.correctness,
        bus_factor_score: metricEval.busFactor,
        responsive_maintainer_score: metricEval.responsivness,
        license_score: metricEval.license,
        dependency_score: metricEval.pinnedDependencyFraction,
        pull_request_score: metricEval.codeIntroducedThroughPullRequestsFraction,
    });
    
    metricEval.logAll();
});

app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});
