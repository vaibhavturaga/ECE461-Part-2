// jest configuration file
module.exports = {
    preset: 'ts-jest', // use ts-jest for TypeScript
    testEnvironment: 'node', // use node for testing
    testMatch: [
        "<rootDir>/tests/**/*.test.ts"
    ],
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    verbose: true,
    collectCoverage: true,  
    reporters: [  
        ['<rootDir>/dist/jestReporter.js', {}]
    ]
}
