module.exports = {
  commands: [
    {
      name: 'legal-generate',
      description: 'Set up all native boilerplate for OSS licenses notice',
      func: ([], { project: { android, ios } }, {}) => {
        const generateLegal = require('./bare-plugin/build').default;

        generateLegal(android?.sourceDir, ios?.sourceDir);
      },
    },
  ],
};
