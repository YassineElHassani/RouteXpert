module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
    testTimeout: 30000,
    collectCoverageFrom: [
        'src/controllers/**/*.js',
        '!src/tests/**',
    ],
};