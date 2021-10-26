import "jest-enzyme";
import '@testing-library/jest-dom';

global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
    takeRecords: () => []
};
